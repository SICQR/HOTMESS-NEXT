import RotatingQR from '@/components/RotatingQR';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HOTMESS Safe Link',
  description: 'Ephemeral, rotating QR codes for safer sharing.'
};

export default function SafePage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-24 gap-8">
      <h1 className="text-4xl font-bold tracking-tight">Safe Share</h1>
      <p className="max-w-md text-center text-neutral-500 text-sm">
        This rotating QR code updates every ~10 seconds. Each link is HMAC-signed and expires
        quickly, reducing the window for interception or spoofing.
      </p>
      <RotatingQR intent="listen" />
      <div className="text-xs text-neutral-400">
        Intent: listen • TTL: 30s • Refresh: 10s
      </div>
    </div>
  );
}
