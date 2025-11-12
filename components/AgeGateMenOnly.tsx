'use client';
import React from 'react'
import Cookies from 'js-cookie'

export default function AgeGateMenOnly() {
  const [open, setOpen] = React.useState(() => !(Cookies.get('hm_age_ok') === '1'))
  const [dob, setDob] = React.useState('')
  const [isMan, setIsMan] = React.useState(false)
  const [affirm, setAffirm] = React.useState(false)

  if (!open) return null

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const year = Number(dob.slice(0,4))
    const ok = isMan && affirm && year && (new Date().getFullYear() - year) >= 18
    if (ok) { Cookies.set('hm_age_ok','1', { expires: 7 }); setOpen(false) }
  }

  return (
    <div role="dialog" aria-modal className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-6">
      <form onSubmit={submit} className="w-full max-w-md bg-black text-white p-6 rounded-2xl border border-white/10 shadow-2xl">
        <h1 className="text-3xl md:text-5xl font-bold mb-2 uppercase">Confirm access</h1>
        <p className="text-sm opacity-80 mb-4">Men‑only. You must be 18+. We use a cookie to remember your choice.</p>
        <label className="block text-sm mb-3">Date of birth
          <input required type="date" className="mt-1 w-full bg-transparent border border-white/20 rounded px-3 py-2" value={dob} onChange={e=>setDob(e.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm mb-2">
          <input type="checkbox" checked={isMan} onChange={e=>setIsMan(e.target.checked)} /> I confirm I am a man.
        </label>
        <label className="flex items-center gap-2 text-sm mb-4">
          <input type="checkbox" checked={affirm} onChange={e=>setAffirm(e.target.checked)} /> I am 18+ and accept privacy & cookies.
        </label>
        <button className="w-full bg-red-600 hover:bg-red-700 text-white uppercase px-5 py-3 rounded-2xl" type="submit">Enter</button>
        <p className="text-xs mt-3 opacity-70">Aftercare is information/services, not medical advice.</p>
      </form>
    </div>
  )
}
