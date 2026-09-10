import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@codelens/database';
import reposRouter from './routes/repos';
import webhooksRouter from './routes/webhooks';
import dashboardRouter from './routes/dashboard';
import pullRequestsRouter from './routes/pullRequests';
import issuesRouter from './routes/issues';
import './workers/analysisWorker';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/dashboard', dashboardRouter);
app.use('/api/repositories', reposRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/pull-requests', pullRequestsRouter);
app.use('/api/issues', issuesRouter);

const server = app.listen(port, () => {
  console.log(`🚀 CodeLens API running on http://localhost:${port}`);
});

const gracefulShutdown = () => {
  console.log('Shutting down server gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  
  // Force shutdown if it takes too long
  setTimeout(() => process.exit(1), 5000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // for nodemon/tsx restarts
