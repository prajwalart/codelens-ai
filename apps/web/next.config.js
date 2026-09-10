/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
  'bullmq',
  'ioredis',
  '@valkey/valkey-glide',
  '@valkey/valkey-glide-linux-x64-gnu',
],
  },
};

module.exports = nextConfig;
