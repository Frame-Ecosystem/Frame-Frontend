/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "utfs.io",
      },
      {
        hostname: "lh3.googleusercontent.com",
      },
      {
        hostname: "images.unsplash.com",
      },
      {
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Allow dev HMR access from IPv4 hosts during development.
  // NOTE: Next.js rejects a single '*' as too broad, but does support wildcard
  // matching per domain segment. `*.*.*.*` effectively allows any IPv4 host.
  // Keep this dev-only.
  allowedDevOrigins: ["*.*.*.*"],
}
export default nextConfig
