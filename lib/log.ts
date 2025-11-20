import redactEntry from '../src/utils/redact';

const LOGTAIL_TOKEN = process.env.LOGTAIL_SOURCE_TOKEN;
const NODE_ENV = process.env.NODE_ENV;

let productionWarningEmitted = false;

function sendToSink(level: string, payload: any) {
  const redacted = redactEntry(payload);
  const body = JSON.stringify({ level, ...redacted });

  // If a real sink is configured, send redacted structured JSON there.
  if (LOGTAIL_TOKEN) {
    try {
      if (typeof fetch === 'function') {
        // fire-and-forget; best-effort to not block
        fetch('https://in.logtail.com/', {
          method: 'POST',
          body,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LOGTAIL_TOKEN}`,
          },
        }).catch(() => {
          // swallow to avoid crashing caller
        });
      } else {
        // runtime does not expose fetch; skip sending but log locally redacted
        console.debug('[LOG] fetch not available; would send to Logtail:', body);
      }
    } catch (e) {
      // swallow any unexpected errors from posting logs
      console.error('[LOG] failed to send structured log to sink');
    }
    return;
  }

  // no sink configured:
  if (NODE_ENV === 'production') {
    if (!productionWarningEmitted) {
      // one-time warning to stderr that structured logs are being dropped
      console.error('[SECURITY] structured logs disabled (no LOGTAIL_SOURCE_TOKEN configured) - dropping structured log entries to avoid secret leakage');
      productionWarningEmitted = true;
    }
    return; // drop structured log
  }

  // In development: emit redacted debug for developer visibility
  try {
    console.debug(JSON.stringify(redacted));
  } catch (e) {
    // best-effort logging
    console.debug('[LOG] (redacted)');
  }
}

export const logger = {
  debug: (msg: string, meta?: any) => sendToSink('debug', { msg, meta }),
  info: (msg: string, meta?: any) => sendToSink('info', { msg, meta }),
  warn: (msg: string, meta?: any) => sendToSink('warn', { msg, meta }),
  error: (msg: string, meta?: any) => sendToSink('error', { msg, meta }),
};

export default logger;