import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: '/:chapterSlug/admin',
        destination: '/admin',
      },
      {
        source: '/:chapterSlug/admin/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
};

export default nextConfig;
