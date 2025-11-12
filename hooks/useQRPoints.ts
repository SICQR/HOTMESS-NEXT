"use client";

import useSWR from 'swr';

interface RewardsData {
  totalPoints: number;
  rewards: Array<{ qr_code: string; points: number; updated_at: string }>;
  scanCount: number;
}

async function fetcher(url: string): Promise<RewardsData | null> {
  const res = await fetch(url);
  const json = await res.json();
  if (!json.success) return null;
  return json.data;
}

export function useQRPoints(userId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    userId ? `/api/qr/rewards?userId=${encodeURIComponent(userId)}` : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  return {
    points: data?.totalPoints ?? 0,
    rewards: data?.rewards ?? [],
    scanCount: data?.scanCount ?? 0,
    mutate,
    isLoading,
    error,
  };
}
