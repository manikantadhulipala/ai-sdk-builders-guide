import 'dotenv/config';
import fs from 'fs';
import { generateSummary } from './summarize.js';

// Side quest: map-reduce summarisation for large threads.
// Map: summarise chunks of comments in parallel, with a small concurrency limit.
// Reduce: summarise the chunk summaries into one final summary.

const CHUNK_SIZE = 15;
const CONCURRENCY = 5;

const comments = JSON.parse(
  fs.readFileSync(new URL('./messages.json', import.meta.url), 'utf-8'),
) as unknown[];

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

// Simple concurrency limiter, so no extra dependency is needed.
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  const chunks = chunk(comments, CHUNK_SIZE);
  console.log(`Map: ${chunks.length} chunk(s) of up to ${CHUNK_SIZE} comments, concurrency ${CONCURRENCY}`);

  const chunkSummaries = await mapLimit(chunks, CONCURRENCY, (c) => generateSummary(c));

  console.log('Reduce: summarising the chunk summaries');
  const finalSummary = await generateSummary(chunkSummaries);

  console.log('\n--- Final summary ---');
  console.log(JSON.stringify(finalSummary, null, 2));
}

main().catch((error) => {
  console.error('❌ Map-reduce summary failed:', error.message);
  process.exit(1);
});
