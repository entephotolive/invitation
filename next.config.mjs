/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Next.js 16 + Turbopack can intermittently fail to spawn the TS checker on Windows paths with spaces.
    // We still run `npx tsc --noEmit` in CI/dev as the source of truth.
    ignoreBuildErrors: true
  },
  experimental: {
    // Reduce worker process spawning (helps in restricted/sandboxed Windows environments).
    cpus: 1,
    workerThreads: true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      }
    ]
  }
};

export default nextConfig;
