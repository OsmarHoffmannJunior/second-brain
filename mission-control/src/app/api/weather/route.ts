/**
 * Weather API - Itapema, SC, Brasil
 * GET /api/weather
 * Uses Open-Meteo (free, no API key)
 */
import { NextResponse } from 'next/server';

let cache: { data: unknown; ts: number } | null = null;
const CACHE_DURATION = 10 * 60 * 1000;

const WMO_CODES: Record<number, { label: string; emoji: string }> = {
  0: { label: "Céu limpo", emoji: "☀️" },
  1: { label: "Predominantemente limpo", emoji: "🌤️" },
  2: { label: "Parcialmente nublado", emoji: "⛅" },
  3: { label: "Nublado", emoji: "☁️" },
  45: { label: "Neblina", emoji: "🌫️" },
  48: { label: "Neblina gelada", emoji: "🌫️" },
  51: { label: "Garoa leve", emoji: "🌦️" },
  53: { label: "Garoa", emoji: "🌦️" },
  55: { label: "Garoa forte", emoji: "🌧️" },
  61: { label: "Chuva leve", emoji: "🌧️" },
  63: { label: "Chuva", emoji: "🌧️" },
  65: { label: "Chuva forte", emoji: "🌧️" },
  71: { label: "Neve leve", emoji: "🌨️" },
  73: { label: "Neve", emoji: "❄️" },
  75: { label: "Neve forte", emoji: "❄️" },
  80: { label: "Pancadas leves", emoji: "🌦️" },
  81: { label: "Pancadas", emoji: "🌧️" },
  82: { label: "Pancadas fortes", emoji: "⛈️" },
  95: { label: "Tempestade", emoji: "⛈️" },
  96: { label: "Tempestade com granizo", emoji: "⛈️" },
  99: { label: "Tempestade com granizo forte", emoji: "⛈️" },
};

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_DURATION) {
    return NextResponse.json(cache.data);
  }

  try {
    // Itapema, SC: -27.0916° S, 48.6156° W
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=-27.0916&longitude=-48.6156&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=America%2FSao_Paulo&forecast_days=3';

    const res = await fetch(url, { next: { revalidate: 600 } });
    const json = await res.json();

    const current = json.current;
    const daily = json.daily;

    const wmo = WMO_CODES[current.weather_code] || { label: "Desconhecido", emoji: "🌡️" };

    const data = {
      city: "Itapema, SC",
      temp: Math.round(current.temperature_2m),
      feels_like: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      wind: Math.round(current.wind_speed_10m),
      precipitation: current.precipitation,
      condition: wmo.label,
      emoji: wmo.emoji,
      forecast: daily.time.slice(0, 3).map((day: string, i: number) => ({
        day,
        max: Math.round(daily.temperature_2m_max[i]),
        min: Math.round(daily.temperature_2m_min[i]),
        emoji: (WMO_CODES[daily.weather_code[i]] || { emoji: "🌡️" }).emoji,
      })),
      updated: new Date().toISOString(),
    };

    cache = { data, ts: Date.now() };
    return NextResponse.json(data);
  } catch (error) {
    console.error('[weather] Error:', error);
    return NextResponse.json({ error: 'Falha ao buscar clima' }, { status: 500 });
  }
}
