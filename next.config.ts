import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // cacheComponents hangs on Cloudflare Workers (OpenNext) — setTimeout
  // staging is not supported yet: https://github.com/opennextjs/opennextjs-cloudflare/pull/1318
  // cacheComponents: true,
  // partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
