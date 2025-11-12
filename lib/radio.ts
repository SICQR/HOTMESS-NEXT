import useSWR from 'swr'
import ky from 'ky'

const RK = process.env.NEXT_PUBLIC_RADIOKING_BASE
const SLUG = process.env.NEXT_PUBLIC_RADIOKING_SLUG
const AZ = process.env.NEXT_PUBLIC_AZURACAST_API_BASE
const AZKEY = process.env.NEXT_PUBLIC_AZURACAST_API_KEY

interface RadioKingCurrentTrack { title?: string; artist?: string }
interface AzuracastSong { title?: string; artist?: string }
interface AzuracastEntry { now_playing?: { song?: AzuracastSong } }
const fetcher = async <T=unknown>(url: string): Promise<T> => ky.get(url).json<T>()

export function useNowPlaying() {
  const { data, error, isLoading, mutate } = useSWR(
    `${RK}/widget/radio/${SLUG}/track/current?format=json`,
    fetcher,
    { refreshInterval: 15000 }
  )

  const fallback = useSWR(AZ ? `${AZ}/nowplaying?key=${AZKEY}` : null, fetcher)

  const rk = data as RadioKingCurrentTrack | undefined
  const az = (fallback.data as AzuracastEntry[] | undefined)?.[0]
  const track = rk?.title || az?.now_playing?.song?.title || 'Live Stream'
  const artist = rk?.artist || az?.now_playing?.song?.artist || 'HOTMESS RADIO'

  return { track, artist, isLoading, error, refresh: mutate }
}
