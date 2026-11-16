import { tool } from "ai";
import { z } from "zod";

// Side quest: error handling for the weather tool. Returns structured errors the model can explain,
// instead of throwing.
const cityCoordinates: Record<string, { lat: number; lon: number }> = {
  "san francisco": { lat: 37.7749, lon: -122.4194 },
  "new york": { lat: 40.7128, lon: -74.006 },
  london: { lat: 51.5074, lon: -0.1278 },
  tokyo: { lat: 35.6762, lon: 139.6503 },
  paris: { lat: 48.8566, lon: 2.3522 },
};

export type WeatherResult =
  | { city: string; temperature: number; weatherCode: number }
  | { error: string; city: string; suggestion: string };

export async function fetchWeather(city: string, fetchImpl: typeof fetch = fetch): Promise<WeatherResult> {
  const coords = cityCoordinates[city.trim().toLowerCase()];
  if (!coords) {
    return {
      error: `No coordinates for "${city}"`,
      city,
      suggestion: "Ask the user for a major city name, such as London, Tokyo, or Paris.",
    };
  }
  try {
    const response = await fetchImpl(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weathercode&timezone=auto`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!response.ok) {
      return { error: `Weather service returned ${response.status}`, city, suggestion: "Try again later." };
    }
    const data = await response.json();
    return { city, temperature: data.current.temperature_2m, weatherCode: data.current.weathercode };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Weather request failed",
      city,
      suggestion: "The weather service may be slow or unavailable. Try again later.",
    };
  }
}

export const getWeatherResilient = tool({
  description: "Get the current weather conditions and temperature for a specific city.",
  inputSchema: z.object({ city: z.string().describe("The city name for weather lookup") }),
  execute: async ({ city }) => fetchWeather(city),
});
