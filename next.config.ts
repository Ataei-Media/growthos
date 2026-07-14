import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Screenshots (ScreenshotOne) and Supabase Storage assets are rendered
    // through next/image; audited sites can serve images from any host.
    remotePatterns: [
      { protocol: "https", hostname: "api.screenshotone.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
