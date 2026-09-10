import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@codelens.ai' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@codelens.ai',
      githubId: 'demo-12345',
      image: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
    },
  });

  // Create demo repository 1
  const repo1 = await prisma.repository.upsert({
    where: { githubId: 101010 },
    update: {},
    create: {
      githubId: 101010,
      name: 'codelens-demo-project',
      fullName: 'demo-user/codelens-demo-project',
      owner: 'demo-user',
      url: 'https://github.com/demo-user/codelens-demo-project',
      description: 'A vulnerable and messy project for demonstration purposes.',
      language: 'TypeScript',
      stars: 42,
      forks: 12,
      userId: user.id,
    },
  });

  // Create demo repository 2
  const repo2 = await prisma.repository.upsert({
    where: { githubId: 202020 },
    update: {},
    create: {
      githubId: 202020,
      name: 'react-dashboard',
      fullName: 'demo-user/react-dashboard',
      owner: 'demo-user',
      url: 'https://github.com/demo-user/react-dashboard',
      description: 'Internal admin dashboard for analytics.',
      language: 'JavaScript',
      stars: 105,
      forks: 34,
      userId: user.id,
    },
  });

  // Create analysis job for repo1
  const job1 = await prisma.analysisJob.create({
    data: {
      repositoryId: repo1.id,
      status: 'COMPLETED',
      commitHash: 'a1b2c3d4e5f6g7h8i9j0',
      branch: 'main',
      score: 68, // Lower score to show issues
      securityScore: 45,
      maintainabilityScore: 78,
      reliabilityScore: 81,
      startedAt: new Date(Date.now() - 86400000 * 2),
      completedAt: new Date(Date.now() - 86400000 * 2 + 120000),
      issues: {
        create: [
          {
            title: 'Hardcoded JWT Secret',
            description: 'A hardcoded secret is used for JWT signing. This is a critical security vulnerability.',
            severity: 'CRITICAL',
            category: 'Security',
            file: 'src/auth/jwt.ts',
            line: 12,
            snippet: "const JWT_SECRET = 'my-super-secret-key-123';",
            recommendation: 'Use environment variables to store sensitive secrets. Example: process.env.JWT_SECRET',
            confidence: 'HIGH',
          },
          {
            title: 'Unsafe SQL Query',
            description: 'Potential SQL injection detected via string concatenation.',
            severity: 'HIGH',
            category: 'Security',
            file: 'src/db/users.ts',
            line: 45,
            snippet: "const query = 'SELECT * FROM users WHERE id = ' + userId;",
            recommendation: 'Use parameterized queries or an ORM like Prisma.',
            confidence: 'HIGH',
          },
          {
            title: 'Complex Function',
            description: 'Function has cyclomatic complexity of 15, which exceeds the recommended limit of 10.',
            severity: 'MEDIUM',
            category: 'Maintainability',
            file: 'src/services/billing.ts',
            line: 88,
            snippet: "function calculateTierAndApplyDiscounts(user, cart, code, ...) { ... }",
            recommendation: 'Break down this function into smaller, more focused helper functions.',
            confidence: 'MEDIUM',
          },
          {
            title: 'Missing Type Annotations',
            description: 'Implicit any type used in function arguments.',
            severity: 'LOW',
            category: 'Code Smell',
            file: 'src/utils/helpers.ts',
            line: 5,
            snippet: "export function parseData(data) { ... }",
            recommendation: 'Add proper TypeScript types to all function arguments.',
            confidence: 'HIGH',
          }
        ]
      }
    }
  });

  // Create analysis job for repo2
  const job2 = await prisma.analysisJob.create({
    data: {
      repositoryId: repo2.id,
      status: 'COMPLETED',
      commitHash: 'f4b3c2d1e0',
      branch: 'main',
      score: 92,
      securityScore: 98,
      maintainabilityScore: 89,
      reliabilityScore: 89,
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 3500000),
      issues: {
        create: [
          {
            title: 'Console Statement Left in Production',
            description: 'A console.log statement was found.',
            severity: 'LOW',
            category: 'Code Smell',
            file: 'src/components/Header.jsx',
            line: 23,
            snippet: "console.log('Rendering header');",
            recommendation: 'Remove console statements before deploying to production.',
            confidence: 'HIGH',
          }
        ]
      }
    }
  });

  // Create Mock Pull Requests
  const pr1 = await prisma.pullRequest.upsert({
    where: { githubId: 1001 },
    update: {},
    create: {
      githubId: 1001,
      repositoryId: repo1.id,
      number: 142,
      title: 'Improve authentication middleware',
      state: 'OPEN',
      author: 'demo-user',
      url: 'https://github.com/demo-user/codelens-demo-project/pull/142',
      reviews: {
        create: [
          {
            status: 'COMPLETED',
            score: 91,
            summary: "## AI Code Review Summary\n\nOverall, this PR significantly improves the authentication flow by introducing stateless JWT tokens and standardizing error handling. However, I noticed a minor issue regarding token expiration configuration.\n\n### Strengths\n- Good use of robust error handling.\n- Removed deprecated session management code.\n\n### Weaknesses\n- The JWT expiration time is hardcoded to 1 year, which is overly permissive.\n\n### Recommendations\n- Move the expiration time to an environment variable (`JWT_EXPIRES_IN`) and lower the default to 24 hours."
          }
        ]
      }
    }
  });

  console.log(`Database has been seeded. 🌱`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
