"use client";
import Link from "next/link";
import { useEffect } from "react";
import { logger } from "@/lib/log";

// Client error boundary for rendering errors in routes below this segment.
// Next.js App Router will use this for errors thrown during rendering/loading.
export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logger.error("render_error", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <main id="main" className="mx-auto max-w-2xl px-6 py-16 text-center space-y-6">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="text-gray-400 text-sm">
        The page hit an unexpected error. You can try again or head back home.
      </p>
      <div className="flex justify-center gap-4 flex-wrap">
        <button
          onClick={reset}
          className="rounded bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          Try again
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
        <pre className="mt-2 whitespace-pre-wrap break-words">{error.message}\n{error.stack?.slice(0, 1200)}</pre>
      </details>
    </main>
  );
}
