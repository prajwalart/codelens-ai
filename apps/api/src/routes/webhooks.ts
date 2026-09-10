import { Router } from 'express';
import crypto from 'crypto';
import { Queue } from 'bullmq';
import { prisma } from '../index.js';

const router = Router();

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

const prReviewQueue = new Queue('pr-review', { connection });

// Verify GitHub Webhook Signature
function verifySignature(req: any, res: any, next: any) {
  const signature = req.headers['x-hub-signature-256'];
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) return next(); // Skip if no secret configured (Demo mode)

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

  if (signature !== digest) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  next();
}

router.post('/github', verifySignature, async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  if (event === 'pull_request' && (payload.action === 'opened' || payload.action === 'synchronize')) {
    // A PR was opened or updated
    console.log(`[Webhook] PR ${payload.action}: ${payload.pull_request.html_url}`);

    try {
      const repo = await prisma.repository.findFirst({
        where: { githubId: payload.repository.id }
      });

      if (repo) {
        const pr = await prisma.pullRequest.upsert({
          where: { githubId: payload.pull_request.id },
          update: { state: payload.pull_request.state },
          create: {
            githubId: payload.pull_request.id,
            repositoryId: repo.id,
            number: payload.pull_request.number,
            title: payload.pull_request.title,
            state: payload.pull_request.state,
            author: payload.pull_request.user.login,
            url: payload.pull_request.html_url
          }
        });

        const review = await prisma.pullRequestReview.create({
          data: {
            pullRequestId: pr.id,
            status: 'PENDING'
          }
        });

        await prReviewQueue.add('review-pr', {
          reviewId: review.id,
          pullRequestUrl: payload.pull_request.url,
          repositoryId: repo.id
        });
      }
    } catch (e) {
      console.error('Error handling webhook', e);
    }
  }

  res.status(200).send('Event received');
});

export default router;
