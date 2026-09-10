import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

router.get('/', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const issues = await prisma.analysisIssue.findMany({
      where: { analysisJob: { repository: { userId } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        analysisJob: {
          include: {
            repository: {
              select: { name: true, fullName: true }
            }
          }
        }
      }
    });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

export default router;
