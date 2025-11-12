'use client';
import React from 'react'

const intents = ['onboarding','rides','eats','radio','shop','earn','safety'] as const

export default function ConciergeWidget(){
  const [open,setOpen]=React.useState(false)
  const [intent,setIntent]=React.useState<typeof intents[number] | null>(null)
  
  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="w-80 max-w-[90vw] bg-black border border-white/10 rounded-2xl shadow-2xl p-4 mb-3">
          <div className="text-sm uppercase mb-2 font-semibold">AI Concierge</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {intents.map(k => (
              <button key={k} className="border border-white/20 hover:bg-white/5 rounded px-2 py-1 uppercase transition" onClick={()=>setIntent(k)}>{k}</button>
            ))}
          </div>
          <div className="mt-3 text-sm min-h-16">
            {intent === 'rides' && <p>Need a ride? Use your city link in Telegram or scan the QR. No partner codes shown here. Stay safe.</p>}
            {intent === 'eats' && <p>Recovery food options via your city hub. Hydrate, eat, sleep. No shame exits.</p>}
            {intent === 'radio' && <p>Tap Listen to jump into HOTMESS RADIO. Live now, with care nudges on the half hour.</p>}
            {intent === 'shop' && <p>Browse drops. UTM tags respect your affiliate when you come from your QR.</p>}
            {intent === 'earn' && <p>Log in to see your tier and referral link. Payouts feed our Care Fund too.</p>}
            {intent === 'safety' && <p>Consent first. If something feels off, message a mod in your city room. Aftercare is info/services, not medical advice.</p>}
            {!intent && <p>Select an intent.</p>}
          </div>
        </div>
      )}
      <button className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold uppercase px-5 py-3 rounded-2xl shadow-lg transition" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>
        {open? 'Close' : 'Concierge'}
      </button>
    </div>
  )
}
