import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

router.get('/', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const repos = await prisma.repository.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    res.json(repos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

router.get('/:id', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const repo = await prisma.repository.findUnique({
      where: { id: req.params.id }
    });
    if (!repo || repo.userId !== userId) return res.status(404).json({ error: 'Not found' });

    const fullRepo = await prisma.repository.findUnique({
      where: { id: req.params.id },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            issues: true
          }
        }
      }
    });
    res.json(fullRepo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repository' });
  }
});

router.get('/:id/issues', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const repo = await prisma.repository.findUnique({ where: { id: req.params.id } });
    if (!repo || repo.userId !== userId) return res.status(404).json({ error: 'Not found' });

    const jobs = await prisma.analysisJob.findMany({
      where: { repositoryId: req.params.id },
      orderBy: { createdAt: 'desc' },
      take: 1,
      include: { issues: true }
    });
    
    if (jobs.length === 0) return res.json([]);
    res.json(jobs[0].issues);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

router.get('/jobs/:jobId', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const job = await prisma.analysisJob.findUnique({
      where: { id: req.params.jobId },
      include: { repository: true }
    });
    if (!job || job.repository.userId !== userId) return res.status(404).json({ error: 'Not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

export default router;
