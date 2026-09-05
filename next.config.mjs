import path from "node:path";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./shared/i18n/request.js');

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

export default withNextIntl(nextConfig);
