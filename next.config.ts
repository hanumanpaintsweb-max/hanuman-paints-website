import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'msp.images.akzonobel.com',
      },
      {
        protocol: 'https',
        hostname: 'www.dulux.in',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: "hanuman-paints",
  project: "javascript-nextjs",
  silent: false,
  widenClientFileUpload: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: {
    disable: false,
  },
});
