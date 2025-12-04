import * as Sentry from "@sentry/browser";

export const initSentry = (sentryDsn: string) => {
  Sentry.init({
    dsn: sentryDsn,
    beforeSend(event) {
      if (event.tags && event.tags.capture) {
        return event;
      }
      return null;
    },
  });
};

export const captureException = (error: unknown, fingerprint: string[]) => {
  Sentry.captureException(error, { tags: { capture: true }, fingerprint });
};
