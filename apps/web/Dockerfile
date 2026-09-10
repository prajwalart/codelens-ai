FROM node:20-alpine AS base
WORKDIR /app

RUN npm i -g npm@latest

COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

RUN npm install

COPY . .

# Generate Prisma Client (needed if web uses it directly, but usually it shouldn't)
RUN npm run db:generate

# Build Web
RUN npm run build -w @codelens/web

EXPOSE 3000
CMD ["npm", "run", "start", "-w", "@codelens/web"]
