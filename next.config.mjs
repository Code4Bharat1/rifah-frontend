import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const backendServerUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

// This workspace serves the dev server behind a path-prefixed proxy
// (VSCODE_PROXY_URI="https://<host>/proxy/{{port}}/"). Next only sets this up
// automatically for its own build assets (_next/static/...); root-absolute
// asset URLs the browser resolves against the bare origin would otherwise
// 404 since they skip that prefix. Dev-only — unset in production so a real
// deployment's asset URLs are untouched.
const isDev = process.env.NODE_ENV !== 'production';
const devProxyPort = process.env.PORT || 3000;
const proxyAssetPrefix = isDev && process.env.VSCODE_PROXY_URI ? `/proxy/${devProxyPort}` : '';

/** @type {import("next").NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_ASSET_PREFIX: proxyAssetPrefix,
  },
  ...(proxyAssetPrefix ? { assetPrefix: proxyAssetPrefix } : {}),
  turbopack: {
    root: __dirname,
    resolveAlias: {
      'next-intl/config': './shared/i18n/request.js',
    },
  },
  webpack(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['next-intl/config'] = path.resolve(__dirname, './shared/i18n/request.js');
    return config;
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
  async redirects() {
    return [
      {
        source: '/aboutRIFAH',
        destination: '/about',
        permanent: false,
      },
      {
        source: '/about-rifah',
        destination: '/about',
        permanent: false,
      },
      {
        source: '/aboutrifah',
        destination: '/about',
        permanent: false,
      },
      {
        source: '/about-us',
        destination: '/about',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendServerUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
