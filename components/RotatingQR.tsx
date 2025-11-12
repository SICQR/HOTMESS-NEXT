"use client";

import { useEffect, useMemo, useState } from 'react';

type Props = {
  intent?: 'listen' | 'shop' | 'join';
  ttlSeconds?: number; // desired TTL for each signed link
  refreshMs?: number;  // how often to refresh link
  className?: string;
};

export default function RotatingQR({ intent = 'listen', ttlSeconds = 30, refreshMs = 10000, className }: Props) {
  const [url, setUrl] = useState<string>('');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [error, setError] = useState<string>('');

  async function fetchLink() {
    try {
      const res = await fetch(`/api/beacon-link?intent=${intent}&ttl=${ttlSeconds}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to fetch link');
      setUrl(json.url);
      setExpiresAt(json.expiresAt);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch link';
      setError(msg);
    }
  }

  useEffect(() => {
    fetchLink();
    const id = setInterval(fetchLink, Math.max(3000, refreshMs));
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent, ttlSeconds, refreshMs]);

  useEffect(() => {
    // Fallback: use a trusted external QR service to avoid bundling a QR library.
    // This avoids a hard dependency that breaks the build when not installed.
    if (!url) {
      setDataUrl('');
      return;
    }
    // api.qrserver.com renders QR as an image. Size ~288px to match previous scale.
    const encoded = encodeURIComponent(url);
    const remote = `https://api.qrserver.com/v1/create-qr-code/?size=288x288&margin=1&data=${encoded}`;
    setDataUrl(remote);
  }, [url]);

  const remaining = useMemo(() => {
    if (!expiresAt) return '';
    const ms = Date.parse(expiresAt) - Date.now();
    if (ms <= 0) return 'expiring';
    return `${Math.ceil(ms / 1000)}s`;
  }, [expiresAt]);

  return (
    <div className={className}>
      {error && (
        <div className="text-red-500 text-sm mb-2">{error}</div>
      )}
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dataUrl} alt={`QR code for ${intent}`} className="h-48 w-48 rounded bg-white p-2 shadow" />
      ) : (
        <div className="h-48 w-48 rounded bg-white/50 backdrop-blur flex items-center justify-center text-sm text-neutral-600">
          Generating QR…
        </div>
      )}
      <div className="mt-2 text-xs text-neutral-500 flex items-center gap-2">
        <a href={url} className="underline hover:no-underline">Open link</a>
        <span aria-hidden>•</span>
        <span>refreshing, {remaining}</span>
      </div>
    </div>
  );
}
