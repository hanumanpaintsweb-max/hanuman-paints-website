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
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
  org: "hanuman-paints",
  project: "hanuman-paints",
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  sourcemaps: {
    disable: false,
  },
});
