import { Worker } from 'bullmq';
import { prisma } from '../index.js';
import { GitHubFetcher } from '../analyzer/fetcher.js';
import { ScannerEngine } from '../analyzer/engine.js';
import { AIReviewer } from '../analyzer/ai.js';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  connectTimeout: 2000,
  maxRetriesPerRequest: 1
};

const fetcher = new GitHubFetcher();
const scanner = new ScannerEngine();
const aiReviewer = new AIReviewer();

export const analysisWorker = new Worker('analysis', async (job) => {
  const { jobId, repositoryId, url, branch } = job.data;
  console.log(`[Worker] Starting analysis for job ${jobId}`);

  let extractedDir: string | null = null;

  try {
    // 1. Mark as running
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: { status: 'FETCHING', startedAt: new Date() }
    });

    const parsed = fetcher.parseUrl(url);
    
    // 2. Metadata
    const metadata = await fetcher.getMetadata(parsed.owner, parsed.repo);
    const defaultBranch = metadata.default_branch || branch || 'main';
    const realCommit = await fetcher.getLatestCommit(parsed.owner, parsed.repo, defaultBranch);

    // 3. Download tarball
    extractedDir = await fetcher.downloadTarball(parsed.owner, parsed.repo, defaultBranch);

    // 4. Scan
    await prisma.analysisJob.update({ where: { id: jobId }, data: { status: 'SCANNING' } });
    const findings = scanner.scanDirectory(extractedDir);

    // 5. AI Review
    await prisma.analysisJob.update({ where: { id: jobId }, data: { status: 'AI_REVIEW' } });
    const weightMap: Record<string, number> = { "CRITICAL": 5, "HIGH": 4, "MEDIUM": 3, "LOW": 2, "INFO": 1 };
    findings.sort((a, b) => (weightMap[b.severity] || 0) - (weightMap[a.severity] || 0));
    
    const topFindings = findings.slice(0, 5);
    for (const f of topFindings) {
      const aiResp = await aiReviewer.reviewFinding(f);
      (f as any).aiExplanation = aiResp;
      (f as any).aiSuggestedFix = "See explanation above."; // Optional split logic
    }

    // 6. Calculate scores
    await prisma.analysisJob.update({ where: { id: jobId }, data: { status: 'SCORING' } });
    const scores = scanner.calculateScores(findings);

    // 7. Save results to database
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        commitHash: realCommit,
        branch: defaultBranch,
        score: scores.score,
        securityScore: scores.securityScore,
        maintainabilityScore: scores.maintainabilityScore,
        reliabilityScore: scores.reliabilityScore,
        performanceScore: scores.performanceScore,
        issues: {
          create: findings.map((issue: any) => ({
            title: issue.title,
            description: issue.description,
            severity: issue.severity,
            category: issue.category,
            file: issue.file,
            line: issue.line,
            snippet: issue.snippet,
            recommendation: issue.recommendation,
            aiExplanation: issue.aiExplanation || null,
            aiSuggestedFix: issue.aiSuggestedFix || null,
            confidence: issue.confidence
          }))
        }
      }
    });

    await prisma.repository.update({
      where: { id: repositoryId },
      data: { defaultBranch: defaultBranch, updatedAt: new Date() }
    });

    console.log(`[Worker] Finished analysis for job ${jobId}`);

  } catch (error: any) {
    console.error(`[Worker] Analysis failed for job ${jobId}:`, error.message);
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: { 
        status: 'FAILED',
        error: error.message,
        completedAt: new Date()
      }
    });
  } finally {
    if (extractedDir) {
      fetcher.cleanup(extractedDir);
    }
  }
}, { connection });

analysisWorker.on('connecting', () => {
  console.log('[Worker] Connecting to Redis...');
});

analysisWorker.on('ready', () => {
  console.log('[Worker] Connected to Redis successfully and ready to process jobs.');
});

analysisWorker.on('error', (error) => {
  console.error('[Worker] Redis connection or processing error:', error);
});

analysisWorker.on('closed', () => {
  console.log('[Worker] Redis connection closed.');
});
