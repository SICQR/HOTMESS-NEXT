'use client';
import React from 'react'
import { verify } from '@/lib/hmac'

export default function QRRouterDebug() {
  React.useEffect(() => {
    // no redirects in debug mode; just log
    const u = new URL(window.location.href)
    const ok = verify(u.searchParams, process.env.NEXT_PUBLIC_LINK_SIGNING_SECRET || '')
    const p = u.searchParams.get('p')
  console.info('[HM] /r/_debug', { ok, p, qp: Object.fromEntries(u.searchParams.entries()) })
  }, [])

  return (
    <div className="px-6 py-32 text-center">
      <h1 className="text-2xl font-semibold mb-2">/r debug</h1>
      <p className="opacity-70">Check console for verification status and params.</p>
    </div>
  )
}
