FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm (or use npm)
RUN npm i -g npm@latest

COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

RUN npm install

COPY . .

# Generate Prisma Client
RUN npm run db:generate

# Build API
RUN npm run build -w @codelens/api

EXPOSE 3001
CMD ["npm", "run", "start", "-w", "@codelens/api"]
