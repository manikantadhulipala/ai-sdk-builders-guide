import type { ComponentType } from "react";
import Weather, { type WeatherData } from "@/app/(5-chatbot)/chat/weather";

// Maps tool part types (for example "tool-getWeather") to the component that renders their output.
// Tools not listed here fall back to GenericToolOutput.
type ToolRenderer = ComponentType<{ weatherData?: never; output: unknown }>;

export function isWeatherOutput(value: unknown): value is WeatherData {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.city === "string" &&
    typeof v.temperature === "number" &&
    typeof v.weatherCode === "number" &&
    typeof v.humidity === "number"
  );
}

// Fallback for unknown outputs: shows each field as a labelled row, with nested values as JSON.
export function GenericToolOutput({ output }: { output: unknown }) {
  if (typeof output !== "object" || output === null) {
    return <p className="text-sm">{String(output)}</p>;
  }
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-lg border p-3 text-sm">
      {Object.entries(output as Record<string, unknown>).map(([key, value]) => (
        <div key={key} className="contents">
          <dt className="font-medium">{key}</dt>
          <dd className="text-muted-foreground break-all">
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

const registry: Record<string, ToolRenderer> = {
  "tool-getWeather": ((props: { output: unknown }) =>
    isWeatherOutput(props.output) ? <Weather weatherData={props.output} /> : <GenericToolOutput output={props.output} />) as ToolRenderer,
};

export function getComponentForTool(toolType: string): ToolRenderer {
  return registry[toolType] ?? ((props: { output: unknown }) => <GenericToolOutput output={props.output} />);
}
