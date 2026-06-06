import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
  ],
  denyUrls: [/\/admin\//],
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    Sentry.replayIntegration(),
  ],
});
