import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Rooms — HOTMESS London',
  description: 'Public directory of city chat rooms.',
};

export default function Rooms() {
  return (
    <div className="px-6 py-32 max-w-4xl mx-auto">
      <h1 className="text-6xl md:text-8xl font-bold uppercase mb-6">Rooms</h1>
      <p className="text-xl opacity-80 mb-8">Public directory (read‑only) of city rooms.</p>
      <div className="grid gap-4">
        {['London', 'Manchester', 'Torremolinos'].map(city => (
          <div key={city} className="border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition">
            <h2 className="text-2xl font-semibold mb-2">{city}</h2>
            <p className="text-sm opacity-70 mb-3">HOTMESS {city} Night — Men‑only chat & meetups</p>
            <a href="https://t.me/HotmessNew_bot" className="text-red-500 hover:underline text-sm uppercase">Join on Telegram →</a>
          </div>
        ))}
      </div>
    </div>
  )
}
