import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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

const hasValidSentryToken = process.env.SENTRY_AUTH_TOKEN?.startsWith('sntrys_')

export default withSentryConfig(nextConfig, {
  org: "hanuman-paints",
  project: "javascript-nextjs",
  silent: !hasValidSentryToken,
  widenClientFileUpload: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: {
    disable: !hasValidSentryToken,
  },
});
