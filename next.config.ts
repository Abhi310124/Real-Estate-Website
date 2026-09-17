import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // sanity.config.ts (imported by the /studio Server Component page so its config object can be
  // passed to <NextStudio>) drags the whole embedded Studio — sanity, @sanity/vision, next-sanity
  // — into Next's server/RSC build graph. Their compiled chunks do `import useSWR from 'swr'`
  // unconditionally, but Turbopack resolves that import for the server graph via swr's
  // package.json "react-server" export condition, whose build has no default export (only
  // `unstable_serialize`) — confirmed by running the build without this and reading the resulting
  // "Export default doesn't exist in target module ... swr/dist/index/react-server.mjs" error.
  // These packages are inherently browser-oriented (hooks, browser storage) and were never meant
  // to be tree-shaken into an RSC server graph in the first place, so the fix is to keep them out
  // of that bundling pass entirely and let Node's own plain `require`/`import` resolve them — which
  // does not apply the react-server condition and lands on swr's real default export.
  serverExternalPackages: ['sanity', '@sanity/vision', 'next-sanity', 'swr'],
  images: {
    remotePatterns: [
      // Sanity serves every uploaded image asset from this single CDN host regardless of
      // project ID, so one pattern covers heroImage/gallery/floorPlans/masterPlan/seo.ogImage
      // once Task 20's Sanity data source is live — see sanity/lib/image.ts.
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
}

export default nextConfig
