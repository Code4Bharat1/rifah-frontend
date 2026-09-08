import path from "node:path";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./shared/i18n/request.js');

import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const backendServerUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

/** @type {import("next").NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendServerUrl}/uploads/:path*`,
      },
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

export default withNextIntl(nextConfig);
