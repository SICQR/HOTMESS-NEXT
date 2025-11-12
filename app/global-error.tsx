"use client";
import Link from "next/link";
import { useEffect } from "react";
import { logger } from "@/lib/log";

// Global error boundary at the root layout level.
// Catches errors bubbling to the top of the app tree.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logger.error("global_render_error", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-black text-white font-sans">
        <main id="main" className="mx-auto max-w-2xl px-6 py-20 text-center space-y-6">
          <h1 className="text-4xl font-bold">HOTMESS: Unexpected Crash</h1>
          <p className="text-gray-400 text-sm">
            A fatal error occurred before the page could render. We log these anonymously to improve stability.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={reset}
              className="rounded bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Retry
            </button>
            <Link
              href="/"
              className="rounded bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Home
            </Link>
            <Link
              href="/safe"
              className="rounded bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Safe / Help
            </Link>
          </div>
          <details className="mt-6 mx-auto max-w-prose text-left text-xs opacity-70">
            <summary className="cursor-pointer">Diagnostic details</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words">{error.message}\n{error.stack?.slice(0, 1500)}</pre>
          </details>
        </main>
      </body>
    </html>
  );
}
