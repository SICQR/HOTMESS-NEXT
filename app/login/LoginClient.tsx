'use client';
import { useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import { useToast } from '@/components/Toast'; // HOTMESS ADD

export default function LoginClient() {
  const supabase = supabaseClient();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast(); // HOTMESS ADD

  async function signInWith(provider: 'google' | 'apple') {
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${location.origin}/` } });
    if (error) { setError(error.message); push(`Sign-in failed: ${error.message}`); } else { push('Redirecting to provider…'); }
    setLoading(false);
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/` }
    });
    if (error) { setError(error.message); push(`Magic link failed: ${error.message}`); } else { setSent(true); push('Magic link sent. Check your email.'); }
    setLoading(false);
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16 text-white" aria-labelledby="login-heading">
      <h1 id="login-heading" className="text-3xl font-bold mb-6">Sign in</h1>
      <div className="space-y-3" aria-label="OAuth providers">
        <button disabled={loading} onClick={() => signInWith('apple')} className="w-full bg-white text-black rounded-md px-4 py-3 text-sm font-medium hover:bg-neutral-200 focus:ring-2 focus:ring-red-500">
          Continue with Apple
        </button>
        <button disabled={loading} onClick={() => signInWith('google')} className="w-full bg-[#1a73e8] text-white rounded-md px-4 py-3 text-sm font-medium hover:bg-[#1669c1] focus:ring-2 focus:ring-red-500">
          Continue with Google
        </button>
      </div>
      <div className="my-6 h-px bg-neutral-800" />
      <form onSubmit={sendMagicLink} className="space-y-3" aria-describedby={sent ? 'magic-status' : undefined}>
        <label className="block text-sm text-gray-400" htmlFor="email">Email</label>
        <input
          id="email"
          className="w-full bg-neutral-900 border border-neutral-700 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
          type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required
          placeholder="you@example.com"
        />
        <button disabled={loading} type="submit" className="w-full bg-red-600 hover:bg-red-700 rounded-md px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-red-400">
          {loading ? 'Sending…' : 'Send magic link'}
        </button>
      </form>
      {sent && (
        <p id="magic-status" className="mt-3 text-sm text-green-400" role="status" aria-live="polite">
          Check your email for a sign-in link.
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-400" role="alert" aria-live="assertive">{error}</p>
      )}
    </main>
  );
}
