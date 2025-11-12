import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="text-sm font-medium text-gray-500">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 text-gray-400">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center rounded-md bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          Go back home
        </Link>
      </div>
    </main>
  );
}
