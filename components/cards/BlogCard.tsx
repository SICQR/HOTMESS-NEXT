// HOTMESS ADD
'use client';
import Link from 'next/link';

export type BlogCardProps = { title: string; slug: string; excerpt: string; publishedAt?: string };
export function BlogCard({ title, slug, excerpt, publishedAt }: BlogCardProps) {
  return (
    <li role="listitem" className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">{title}</h3>
        {publishedAt && (
          <time dateTime={publishedAt} className="text-xs text-neutral-500">
            {new Date(publishedAt).toLocaleDateString()}
          </time>
        )}
      </div>
      <p className="text-sm text-neutral-300 mt-1">{excerpt}</p>
      <Link href={`/blog/${slug}`} className="mt-3 inline-block text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md">Read →</Link>
    </li>
  );
}
export default BlogCard;
