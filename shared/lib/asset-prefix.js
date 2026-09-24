// Prepends the dev-only workspace proxy prefix (see next.config.mjs) to a
// root-absolute public asset path. No-op in production.
export const withAssetPrefix = (path) => `${process.env.NEXT_PUBLIC_ASSET_PREFIX || ""}${path}`;
