// Structured logs: one JSON object per line, so Vercel's log view can filter on
// fields such as correlationId and event. Never log customer names, emails,
// addresses or card numbers.
export type LogFields = { correlationId: string } & Record<string, unknown>;

export function log(level: "info" | "warn" | "error", event: string, fields: LogFields): void {
  const line = JSON.stringify({
    level,
    time: new Date().toISOString(),
    service: "pizza-tracker",
    event,
    ...fields,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
