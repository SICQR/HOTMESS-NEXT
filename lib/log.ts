// NOTE: updated by copilot/fix/red-hardening-logging-qr
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  meta?: Record<string, unknown>;
}

export function redactEntry(obj: unknown): unknown {
  try {
    // Deep clone via stringify to remove non-serializables
    const cloned = JSON.parse(JSON.stringify(obj));
    const secretRe = /secret|token|password|pass|key|authorization|ssn/i;

    function walk(o: unknown) {
      if (o && typeof o === 'object') {
        for (const k of Object.keys(o as Record<string, unknown>)) {
          try {
            const v = (o as Record<string, unknown>)[k];
            if (secretRe.test(k)) {
              (o as Record<string, unknown>)[k] = '[REDACTED]';
            } else if (typeof v === 'string' && v.length > 256) {
              (o as Record<string, unknown>)[k] = v.slice(0, 128) + '...[TRUNCATED]';
            } else if (v && typeof v === 'object') {
              walk(v);
            }
          } catch {
            // ignore per-field errors
          }
        }
      }
    }

    walk(cloned);
    return cloned;
  } catch {
    return '[UNREDACTABLE]';
  }
}

class Logger {
  private static warnedMissingSink = false;

  private getRidFromCookie(): string | undefined {
    try {
      if (typeof document === 'undefined') return undefined;
      const m = document.cookie.match(/(?:^|; )hm_rid=([^;]+)/);
      return m ? decodeURIComponent(m[1]) : undefined;
    } catch { return undefined; }
  }

  private async sendToExternal(entry: LogEntry & { rid?: string }) {
    try {
      const token = process.env.LOGTAIL_SOURCE_TOKEN;
      if (token) {
        await fetch('https://in.logtail.com/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(entry),
        });
        return;
      }

      // No external sink configured
      if (process.env.NODE_ENV === 'development') {
        // Print a redacted entry for developer debugging
        console.debug('[logger] redacted entry', redactEntry(entry));
        return;
      }

      // In production: do not print full entries. Emit a one-time warning and drop.
      if (!Logger.warnedMissingSink) {
        console.error('[logger] external log sink not configured; structured logs will be dropped');
        Logger.warnedMissingSink = true;
      }
      return;
    } catch {
      // ignore errors from logging pipeline
    }
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const entry: LogEntry & { rid?: string } = {
      level,
      message,
      timestamp: new Date(),
      meta,
      rid: this.getRidFromCookie(),
    };

    // Respect LOG_LEVEL only for client-side console verbosity in development.
    if (process.env.NODE_ENV === 'development') {
      const logMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : level === 'debug' ? console.debug : console.log;
      logMethod(`[${level.toUpperCase()}]`, message, meta || '');
      return;
    }

    // Production/staging: forward to external sink if configured; otherwise be silent except a one-time warning
    void this.sendToExternal(entry);
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.log('debug', message, meta);
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: Record<string, unknown>) {
    this.log('error', message, meta);
  }
}

export const logger = new Logger();