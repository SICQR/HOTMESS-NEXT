type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  meta?: Record<string, unknown>;
}

class Logger {
  private getRidFromCookie(): string | undefined {
    try {
      if (typeof document === 'undefined') return undefined;
      const m = document.cookie.match(/(?:^|; )hm_rid=([^;]+)/);
      return m ? decodeURIComponent(m[1]) : undefined;
    } catch { return undefined; }
  }

  private async sendToExternal(entry: LogEntry & { rid?: string }) {
    try {
      // Server-side: send directly to Logtail if token present
      if (typeof window === 'undefined') {
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
  // Fallback to console if no sink configured
  console.log(JSON.stringify(entry));
        return;
      }
      // Client-side: POST to internal API to avoid exposing tokens
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // ignore
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

    // In development, use console
    if (process.env.NODE_ENV === 'development') {
      const logMethod = level === 'error' ? console.error : 
                       level === 'warn' ? console.warn :
                       level === 'debug' ? console.debug :
                       console.log;
      
      logMethod(`[${level.toUpperCase()}]`, message, meta || '');
      return;
    }

    // In production, forward to external sink or API route
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