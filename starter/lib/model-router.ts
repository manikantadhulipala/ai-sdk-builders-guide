export interface RouterConfig {
  task: 'classification' | 'summarization' | 'reasoning';
  maxLatencyMs: number;
  priority: 'cost' | 'quality';
}

export interface CallRecord {
  model: string;
  task: RouterConfig['task'];
  latencyMs: number;
  at: string; // ISO timestamp
}

// Keep only the last 100 calls. Held in memory, so it resets when the server restarts.
const WINDOW = 100;
const telemetry: CallRecord[] = [];

export function recordCall(record: CallRecord) {
  telemetry.push(record);
  if (telemetry.length > WINDOW) telemetry.shift();
}

export function getTelemetry(): readonly CallRecord[] {
  return telemetry;
}

// PLACEHOLDER static caps. Replace these with figures from the Vercel AI Gateway
// model pricing page and your own measurements. Not verified.
const MODELS = [
  { id: 'openai/gpt-5-nano', tasks: ['classification', 'summarization'], staticLatencyMs: 1500, relativeCost: 1, quality: 1 },
  { id: 'openai/gpt-5-mini', tasks: ['classification', 'summarization', 'reasoning'], staticLatencyMs: 3000, relativeCost: 2, quality: 2 },
  { id: 'openai/gpt-5.2', tasks: ['summarization', 'reasoning'], staticLatencyMs: 12000, relativeCost: 8, quality: 3 },
] as const;

type ModelId = (typeof MODELS)[number]['id'];

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Uses observed median latency when there are at least 3 samples, otherwise the static cap.
function expectedLatencyMs(model: ModelId, staticLatencyMs: number): number {
  const samples = telemetry.filter((r) => r.model === model).map((r) => r.latencyMs);
  return samples.length >= 3 ? median(samples) : staticLatencyMs;
}

export function selectModel(config: RouterConfig): ModelId {
  const candidates = MODELS.filter((m) => (m.tasks as readonly string[]).includes(config.task));

  const withinLatency = candidates.filter(
    (m) => expectedLatencyMs(m.id, m.staticLatencyMs) <= config.maxLatencyMs,
  );

  // Nothing fits the latency budget: fall back to the fastest candidate.
  if (withinLatency.length === 0) {
    const fastest = [...candidates].sort(
      (a, b) => expectedLatencyMs(a.id, a.staticLatencyMs) - expectedLatencyMs(b.id, b.staticLatencyMs),
    )[0];
    return fastest.id;
  }

  const best = [...withinLatency].sort((a, b) =>
    config.priority === 'cost' ? a.relativeCost - b.relativeCost : b.quality - a.quality,
  )[0];
  return best.id;
}
