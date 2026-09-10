import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

router.get('/stats', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const totalRepositories = await prisma.repository.count({ where: { userId } });
    const totalPullRequests = await prisma.pullRequest.count({
      where: { repository: { userId } }
    });
    
    const latestAnalyses = await prisma.analysisJob.groupBy({
      by: ['repositoryId'],
      _max: { score: true },
      where: { repository: { userId } }
    });
    
    const averageScore = latestAnalyses.length > 0 
      ? Math.round(latestAnalyses.reduce((acc, curr) => acc + (curr._max.score || 0), 0) / latestAnalyses.length)
      : 0;

    const issues = await prisma.analysisIssue.findMany({
      where: { analysisJob: { repository: { userId } } }
    });

    const severityDistribution = {
      CRITICAL: issues.filter(i => i.severity === 'CRITICAL').length,
      HIGH: issues.filter(i => i.severity === 'HIGH').length,
      MEDIUM: issues.filter(i => i.severity === 'MEDIUM').length,
      LOW: issues.filter(i => i.severity === 'LOW').length,
    };

    const recentRepositories = await prisma.repository.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 3,
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    res.json({
      totalRepositories,
      totalPullRequests,
      averageScore,
      severityDistribution,
      recentRepositories
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

export default router;
