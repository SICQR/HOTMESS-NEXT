import ky from 'ky'

interface WeatherResponse {
  latitude?: number;
  longitude?: number;
  current?: Record<string, unknown>;
  hourly?: Record<string, unknown>;
}

export async function getWeatherByCoords(lat: number, lon: number) {
  const base = process.env.NEXT_PUBLIC_WEATHER_API_BASE || 'https://api.open-meteo.com'
  const url = `${base}/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&current=temperature_2m`
  return ky.get(url).json<WeatherResponse>()
}
