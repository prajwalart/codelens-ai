# CodeLens AI

AI-Powered Developer Intelligence and Automated Code Review Platform — built by **Prajwal R.**

## Overview

CodeLens AI connects to your GitHub repositories, analyzes code for bugs, security vulnerabilities, and code smells, and provides AI-powered explanations for detected issues. Each repository is isolated per user with full authentication and multi-tenant data security.

## Features

- **Authenticated Multi-User Platform**: Full sign-up/sign-in with credentials or Google OAuth. All data is strictly isolated per user.
- **Real Repository Analysis**: Fetches the actual GitHub tarball, scans source files line-by-line, and calculates real quality scores.
- **Security Scanning**: Detects hardcoded secrets (AWS keys, passwords, tokens), unsafe `eval()` usage, and more. All detected secrets are automatically redacted before storage.
- **Code Quality Scores**: Overall, Security, Maintainability, Reliability, and Performance scores based on real findings.
- **AI-Powered Explanations**: Optionally sends the top critical findings to OpenAI for actionable explanation and fix suggestions (stored separately from static analysis results).
- **Developer Dashboard**: Visualizes scores, issue explorer, repository management, and analysis history.
- **Pull Request Tracking**: Webhook-based PR event handling via `POST /api/webhooks/github`.

## Tech Stack

| Layer              | Technology                                    |
|--------------------|-----------------------------------------------|
| Frontend           | Next.js 14, React, Tailwind CSS, shadcn/ui    |
| Backend API        | Node.js, Express.js                           |
| Job Queue          | BullMQ (requires Redis 6.2+)                  |
| Static Analyzer    | Native TypeScript (regex + AST-lite rules)    |
| AI Integration     | OpenAI GPT-4o (optional, graceful fallback)   |
| Database           | SQLite via Prisma ORM                         |
| Authentication     | NextAuth.js (Credentials + Google OAuth)      |

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Redis 6.2+ on `localhost:6379`
  - **Windows**: Download portable Redis 7.x from [redis-windows/redis-windows](https://github.com/redis-windows/redis-windows/releases), or install [Memurai Developer](https://www.memurai.com/) (requires admin).
  - **macOS/Linux**: `brew install redis` or `apt install redis-server`

### Installation

```bash
git clone <repo-url>
cd codelens-ai
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="file:./dev.db"
REDIS_URL="redis://localhost:6379"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Optional: Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Optional: GitHub OAuth + Webhooks
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GITHUB_WEBHOOK_SECRET="..."

# Optional: OpenAI (AI explanations — gracefully disabled if missing)
AI_PROVIDER="openai"
AI_API_KEY="sk-..."
AI_MODEL="gpt-4o"

API_URL="http://localhost:3001"
WEB_URL="http://localhost:3000"
```

### Database Setup

```bash
npm run db:push -w @codelens/database
```

### Start Redis

```bash
# Windows (portable build in project root):
.\redis_local\redis-server.exe

# macOS/Linux:
redis-server
```

### Start Dev Servers

```bash
npm run dev
```

This starts both the Next.js frontend (`localhost:3000`) and the Express API + BullMQ worker (`localhost:3001`) concurrently.

## Analyzing a Repository

1. Sign in at `http://localhost:3000/sign-in`
2. Navigate to **Analyze** in the dashboard sidebar
3. Paste any public GitHub repository URL
4. Click **Start Analysis**
5. Watch real-time status: `QUEUED → FETCHING → SCANNING → AI_REVIEW → SCORING → COMPLETED`
6. View results: scores, findings, exact file/line locations, and AI explanations

## Scanner Rules

| Rule ID  | Severity | Category        | What It Detects                        |
|----------|----------|-----------------|----------------------------------------|
| SEC-001  | CRITICAL | Security        | Hardcoded AWS Access Keys              |
| SEC-002  | HIGH     | Security        | Hardcoded passwords / tokens / secrets |
| SEC-003  | CRITICAL | Security        | Unsafe `eval()` usage                  |
| QUAL-001 | INFO     | Code Smell      | Leftover `console.log()` statements    |
| QUAL-002 | INFO     | Maintainability | Unresolved `// TODO:` comments         |

All detected secrets are automatically replaced with `[REDACTED_SECRET]` before storage, logging, or AI submission.

## Security Model

- All records (repositories, analyses, findings) are scoped to the authenticated user.
- `Repository` table enforces `@@unique([githubId, userId])` — users cannot access each other'\''s data.
- The Next.js API proxy validates `getServerSession()` and injects `X-User-Id` before forwarding to Express.
- Tarball extraction is protected against path traversal, symlinks, and oversized files.

## License

MIT
