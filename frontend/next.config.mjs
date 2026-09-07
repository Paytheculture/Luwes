/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // We don't need rewrites because we are using Next.js API Routes directly.
  // Using rewrites to localhost:8080 causes Vercel to return 404 DNS_HOSTNAME_RESOLVED_PRIVATE
};

export default nextConfig;
