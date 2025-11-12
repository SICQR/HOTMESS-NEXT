import React from 'react';
import Link from 'next/link';

export default function AftercareDisclaimer() {
  return (
    <div className="mt-16 rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-center text-sm text-gray-400" role="note" aria-label="Aftercare disclaimer">
      Aftercare content is informational only — not medical advice. If you feel unsafe, visit{' '}
      <Link href="/care" className="text-red-500 underline">Hand N Hand Care</Link>.
    </div>
  );
}
