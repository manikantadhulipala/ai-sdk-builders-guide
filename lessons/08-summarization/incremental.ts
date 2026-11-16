import 'dotenv/config';
import fs from 'fs';
import { generateText, Output } from 'ai';
import { summarySchema } from './summarize.js';

// Side quest: incremental summary updates.
// The last summary and the highest comment id it covers are cached. A run summarises only
// comments newer than that id, then merges them into the cached summary. Nothing is reprocessed.

type Comment = { id: number; author: string; timestamp: string; content: string };

const comments = JSON.parse(
  fs.readFileSync(new URL('./messages.json', import.meta.url), 'utf-8'),
) as Comment[];

const CACHE = new URL('./.summary-cache.json', import.meta.url);

type Cache = { lastId: number; summary: unknown };

function loadCache(): Cache | null {
  try {
    return JSON.parse(fs.readFileSync(CACHE, 'utf-8')) as Cache;
  } catch {
    return null;
  }
}

// Write to a temp file and rename, so a crash never leaves a half-written cache.
function saveCache(cache: Cache) {
  const tmp = new URL('./.summary-cache.json.tmp', import.meta.url);
  fs.writeFileSync(tmp, JSON.stringify(cache, null, 2));
  fs.renameSync(tmp, CACHE);
}

async function main() {
  const cache = loadCache();
  const lastId = cache?.lastId ?? 0;
  const fresh = comments.filter((c) => c.id > lastId);

  if (fresh.length === 0 && cache) {
    console.log(`No new comments since id ${lastId}. Using cached summary.`);
    console.log(JSON.stringify(cache.summary, null, 2));
    return;
  }

  console.log(`Summarising ${fresh.length} new comment(s) (ids > ${lastId})`);
  const { output } = await generateText({
    model: 'openai/gpt-5-mini',
    prompt: `Update the existing summary with the new comments. Keep anything still true, add new decisions and action items, and keep the names of anyone assigned a task.

Existing summary (may be null on the first run):
${JSON.stringify(cache?.summary ?? null)}

New comments:
${JSON.stringify(fresh)}`,
    output: Output.object({ schema: summarySchema }),
  });

  const newLastId = Math.max(lastId, ...fresh.map((c) => c.id));
  saveCache({ lastId: newLastId, summary: output });
  console.log(`Cache updated through comment id ${newLastId}`);
  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error('❌ Incremental summary failed:', error.message);
  process.exit(1);
});
