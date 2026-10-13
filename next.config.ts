import type { NextConfig } from "next"

// Static export: the site is plain files served by nginx. carrel.winlab.tw
// sends every path Carrel itself does not serve (/mcp, /oauth, /.well-known,
// /healthz, /internal, /apps) to this site.
const nextConfig: NextConfig = {
  output: "export",
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
