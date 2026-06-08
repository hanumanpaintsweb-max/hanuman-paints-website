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
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { 
          key: 'Strict-Transport-Security', 
          value: 'max-age=63072000; includeSubDomains; preload' 
        },
        { 
          key: 'X-Frame-Options', 
          value: 'SAMEORIGIN' 
        },
        { 
          key: 'X-Content-Type-Options', 
          value: 'nosniff' 
        },
        { 
          key: 'Referrer-Policy', 
          value: 'strict-origin-when-cross-origin' 
        },
      ],
    }]
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
