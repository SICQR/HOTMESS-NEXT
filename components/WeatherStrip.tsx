'use client';
import React from 'react'
import { getWeatherByCoords } from '@/lib/weather'

export default function WeatherStrip(){
  const [temp,setTemp]=React.useState<string>('')
  
  React.useEffect(()=>{
    navigator.geolocation?.getCurrentPosition(async (pos)=>{
      const data = await getWeatherByCoords(pos.coords.latitude, pos.coords.longitude)
      const raw = data?.current && (data.current as Record<string, unknown>)["temperature_2m"]
      const t = typeof raw === 'number' ? raw : undefined
      setTemp(typeof t === 'number' ? `${Math.round(t)}°C` : '')
    }, ()=>setTemp(''))
  },[])
  
  return (
    <div className="px-6 py-2 text-xs uppercase tracking-wider bg-neutral-900 border-y border-white/10">
      <span>Weather Watch:</span> <span className="opacity-80 ml-2">{temp || 'On‑site weather unavailable'}</span>
    </div>
  )
}
