import { getTelemetry } from '@/lib/model-router';

// Route handlers are not cached by default; keep it that way so stats are always current.
export const dynamic = 'force-dynamic';

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export async function GET() {
  const calls = getTelemetry();

  const byModel: Record<string, { calls: number; medianLatencyMs: number; avgLatencyMs: number }> = {};
  for (const call of calls) {
    (byModel[call.model] ??= { calls: 0, medianLatencyMs: 0, avgLatencyMs: 0 });
  }
  for (const model of Object.keys(byModel)) {
    const latencies = calls.filter((c) => c.model === model).map((c) => c.latencyMs);
    byModel[model] = {
      calls: latencies.length,
      medianLatencyMs: Math.round(median(latencies)),
      avgLatencyMs: Math.round(latencies.reduce((sum, v) => sum + v, 0) / latencies.length),
    };
  }

  return Response.json({
    window: 100,
    totalCalls: calls.length,
    byModel,
    recent: calls.slice(-20),
  });
}
