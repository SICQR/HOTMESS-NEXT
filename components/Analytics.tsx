"use client";
import { useEffect, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    __HM_COOKIES__?: { functional: boolean; analytics: boolean; marketing: boolean };
    HM_COOKIES?: { functional: boolean; analytics: boolean; marketing: boolean };
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
    umami?: { track: (eventName?: string) => void };
  }
}

// HOTMESS UPDATE: buffer analytics until consent + idle, then send batched edge events
export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queueRef = useRef<Array<{ event: string; props?: Record<string, unknown>; attempts?: number }>>([]);
  const flushRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffTimers = useRef<Set<number>>(new Set());
  const flushFnRef = useRef<() => void>(() => {});
  const LS_KEY = 'hm_analytics_queue_v1';

  function consentGranted() {
    if (typeof window === 'undefined') return false;
    const consent = (window.HM_COOKIES ?? window.__HM_COOKIES__) || null;
    return !!consent?.analytics;
  }

  const persistQueue = useCallback(() => {
    try {
      if (!queueRef.current.length) {
        localStorage.removeItem(LS_KEY);
        return;
      }
      localStorage.setItem(LS_KEY, JSON.stringify(queueRef.current.slice(0, 200))); // cap size
    } catch {}
  }, []);

  const loadPersisted = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        queueRef.current.push(...arr);
      }
    } catch {}
  };

  const attemptSend = useCallback(async (batch: typeof queueRef.current) => {
    try {
      const res = await fetch('/edge-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent: { analytics: true },
          occurredAt: new Date().toISOString(),
          events: batch.map(b => ({ event: b.event, props: b.props }))
        }),
        keepalive: true,
      });
      if (!res.ok) throw new Error('non-2xx');
      return true;
    } catch {
      return false;
    }
  }, []);

  const scheduleRetry = useCallback((failed: typeof queueRef.current) => {
    failed.forEach(evt => {
      evt.attempts = (evt.attempts || 0) + 1;
    });
    const delay = Math.min(30000, 500 * Math.pow(2, Math.max(...failed.map(f => f.attempts || 1)) - 1) + Math.random() * 250);
    const id = window.setTimeout(() => {
      backoffTimers.current.delete(id);
      flushFnRef.current();
    }, delay);
    backoffTimers.current.add(id);
  }, []);

  const flush = useCallback(async () => {
    const batch = queueRef.current.splice(0, queueRef.current.length);
    if (flushRef.current) clearTimeout(flushRef.current);
    flushRef.current = null;
    if (!batch.length) return;
    const ok = await attemptSend(batch);
    if (!ok) {
      // requeue failed
      queueRef.current.unshift(...batch);
      persistQueue();
      scheduleRetry(batch);
      return;
    }
    persistQueue();
  }, [attemptSend, persistQueue, scheduleRetry]);

  // keep a stable reference for retry timers
  useEffect(() => {
    flushFnRef.current = () => { void flush(); };
  }, [flush]);

  const scheduleFlush = useCallback(() => {
    if (flushRef.current) return;
    flushRef.current = setTimeout(flush, 1500); // small buffer window
  }, [flush]);

  const enqueue = useCallback((evt: string, props?: Record<string, unknown>) => {
    if (!consentGranted()) return;
    queueRef.current.push({ event: evt, props, attempts: 0 });
    persistQueue();
    scheduleFlush();
  }, [scheduleFlush, persistQueue]);

  useEffect(() => {
    if (typeof window === "undefined") return;
  const consent = window.HM_COOKIES ?? window.__HM_COOKIES__;
    if (!consent?.analytics) return;

  // Example: vendor script injection then initial page_view
    try {
      const getNonce = () => (document.querySelector('meta[name="csp-nonce"]') as HTMLMetaElement | null)?.content || undefined;
      // GA4 injection (if configured)
      const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
      if (gaId && !document.getElementById("ga4-script")) {
        const s1 = document.createElement("script");
        s1.id = "ga4-script";
        s1.async = true;
        s1.nonce = getNonce();
        s1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(s1);

        const s2 = document.createElement("script");
        s2.id = "ga4-config";
        s2.nonce = getNonce();
        s2.innerHTML = `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${gaId}', { anonymize_ip: true });`;
        document.head.appendChild(s2);
      }

      // Umami injection (if configured)
      const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
      const umamiSrc = process.env.NEXT_PUBLIC_UMAMI_SRC; // e.g. https://analytics.example.com/script.js
      if (umamiId && umamiSrc && !document.getElementById("umami-script")) {
        const u = document.createElement("script");
        u.id = "umami-script";
        u.defer = true;
        u.nonce = getNonce();
        u.src = umamiSrc;
        u.setAttribute("data-website-id", umamiId);
        document.head.appendChild(u);
      }

      enqueue('page_view', { path: window.location.pathname });
    } catch {}
  }, [enqueue]);

  // Track route changes (client-side navigation) with consent
  useEffect(() => {
    if (typeof window === "undefined") return;
    const consent = window.HM_COOKIES ?? window.__HM_COOKIES__;
    if (!consent?.analytics) return;

  const path = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    try {
      // GA4 page_view
      if (typeof window.gtag === "function") {
        window.gtag("event", "page_view", { page_path: path });
      }
      // Umami manual track (optional; many builds auto-track SPA navigations)
      if (window.umami && typeof window.umami.track === "function") {
        window.umami.track("pageview");
      }
      enqueue('page_view', { path });
    } catch {}
  }, [pathname, searchParams, enqueue]);

  // Load persisted queue on mount if consent now granted
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (consentGranted()) loadPersisted();
  }, []);

  // Flush on visibilitychange + beforeunload via sendBeacon fallback
  useEffect(() => {
    if (typeof window === 'undefined') return;
    function onVis() {
      if (document.visibilityState === 'hidden') {
        const batch = queueRef.current.splice(0, queueRef.current.length);
        persistQueue();
        if (!batch.length) return;
        try {
          const payload = JSON.stringify({
            consent: { analytics: true },
            occurredAt: new Date().toISOString(),
            events: batch.map(b => ({ event: b.event, props: b.props }))
          });
          navigator.sendBeacon('/edge-analytics', new Blob([payload], { type: 'application/json' }));
        } catch {
          // fallback to normal flush
          queueRef.current.unshift(...batch);
          flush();
        }
      }
    }
    window.addEventListener('visibilitychange', onVis);
    window.addEventListener('beforeunload', onVis);
    return () => {
      window.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('beforeunload', onVis);
    };
  }, [flush, persistQueue]);

  return null;
}
