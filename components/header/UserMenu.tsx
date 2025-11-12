'use client';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useToast } from '@/components/Toast'; // HOTMESS ADD

export default function UserMenu() {
  const supabase = supabaseClient();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { push } = useToast(); // HOTMESS ADD

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const before = email;
      setEmail(session?.user?.email ?? null);
      if (!before && session?.user?.email) push(`Signed in as ${session.user.email}`); // HOTMESS ADD
      if (before && !session) push('Signed out'); // HOTMESS ADD
    });
    return () => { sub.subscription.unsubscribe(); };
  // We deliberately avoid re-subscribing on email/push changes to prevent duplicate toasts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  if (!email) return <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-400">Login</Link>;

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen(o => !o)}
        className="text-sm px-4 py-2 rounded-md border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 focus:ring-2 focus:ring-red-400"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {email}
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-md border border-neutral-700 bg-neutral-900 shadow-lg z-50"
          role="menu"
        >
          <Link href="/qr" role="menuitem" className="block px-4 py-2 text-sm hover:bg-neutral-800">Rewards</Link>
          <Link href="/settings" role="menuitem" className="block px-4 py-2 text-sm hover:bg-neutral-800">Settings</Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              role="menuitem"
              className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-800"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
