import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

router.get('/', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const prs = await prisma.pullRequest.findMany({
      where: { repository: { userId } },
      orderBy: { updatedAt: 'desc' },
      include: {
        repository: {
          select: { name: true, fullName: true }
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    res.json(prs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pull requests' });
  }
});

router.get('/:id', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const pr = await prisma.pullRequest.findUnique({
      where: { id: req.params.id },
      include: {
        repository: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    if (!pr || pr.repository.userId !== userId) return res.status(404).json({ error: 'Not found' });
    res.json(pr);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pull request details' });
  }
});

export default router;
