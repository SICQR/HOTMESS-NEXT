"use client";
import { Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import type { GlobeDataset } from '@/lib/types';

type GlobePoint = { lat: number; lng: number; size: number; city: string };

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false }) as unknown as React.ComponentType<Record<string, unknown>>;

const fetcher = async <T=unknown>(url: string): Promise<T> => (await fetch(url, { cache: 'no-store' })).json();

export default function Globe3D() {
  const { data } = useSWR<GlobeDataset>('/api/globe/cities', fetcher, { refreshInterval: 60000 });
  const globeData = useMemo<GlobePoint[]>(() => {
    const pts = data?.points ?? [];
    return pts.map(p => ({
      lat: p.lat,
      lng: p.lng,
      size: Math.max(0.5, Math.log2(p.listeners + 1)),
      city: p.city,
    }));
  }, [data?.points]);

  return (
    <div className="w-full h-[60vh]">
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-sm opacity-70">Loading globe…</div>}>
        <Globe
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          pointsData={globeData}
          pointLat={(d: GlobePoint) => d.lat}
          pointLng={(d: GlobePoint) => d.lng}
          pointAltitude={(d: GlobePoint) => d.size / 10}
          pointColor={() => 'rgba(255,60,60,0.85)'}
          animateIn
        />
      </Suspense>
    </div>
  );
}
