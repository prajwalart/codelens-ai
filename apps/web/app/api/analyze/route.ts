import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Queue } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  connectTimeout: 2000,
  maxRetriesPerRequest: 1
};

const analysisQueue = new Queue('analysis', { connection });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    // Parse URL loosely
    const parts = url.replace(/\/$/, '').split('/');
    const name = parts[parts.length - 1].replace('.git', '');
    const owner = parts[parts.length - 2];
    const fullName = `${owner}/${name}`;

    const githubId = hashString(fullName);

    const repo = await prisma.repository.upsert({
      where: { githubId_userId: { githubId, userId: user.id } },
      update: { url },
      create: {
        githubId,
        name,
        fullName,
        owner,
        url,
        description: 'Analyzed via CodeLens',
        userId: user.id
      }
    });

    const job = await prisma.analysisJob.create({
      data: {
        repositoryId: repo.id,
        status: 'QUEUED',
        commitHash: 'HEAD',
        branch: repo.defaultBranch,
      }
    });

    try {
      await analysisQueue.add('analyze-repo', {
        jobId: job.id,
        repositoryId: repo.id,
        url: repo.url,
        branch: repo.defaultBranch
      });
    } catch (redisError) {
      console.warn("Redis Queue failed, marking as FAILED:", redisError);
      await prisma.analysisJob.update({
        where: { id: job.id },
        data: { status: 'FAILED', error: 'Service Unavailable (Queue)' }
      });
      // Continue to return jobId so frontend sees FAILED gracefully
    }

    return NextResponse.json({ message: 'Analysis started', jobId: job.id, repositoryId: repo.id });
  } catch (error: any) {
    console.error('Trigger Analysis Error:', error);
    return NextResponse.json({ error: 'Failed to start analysis' }, { status: 500 });
  }
}

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
