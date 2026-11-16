import 'dotenv/config';
import fs from 'fs';
import { generateText } from 'ai';

// Side quest: Streaming Extraction Pipeline with resumable processing.
// Splits the essay into chunks, extracts names from each, and saves a checkpoint
// after every chunk. If the run crashes, the next run skips finished chunks.

const CHUNK_CHARS = 16000; // roughly 4000 tokens at ~4 characters per token
const MODEL = 'openai/gpt-5-mini';
const CHECKPOINT = new URL('./.checkpoint.json', import.meta.url);

type Checkpoint = Record<string, string>; // chunk index -> extracted names text

function chunkText(text: string, size: number): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let current = '';
  for (const paragraph of paragraphs) {
    if (current && (current + '\n\n' + paragraph).length > size) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = current ? current + '\n\n' + paragraph : paragraph;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function loadCheckpoint(): Checkpoint {
  try {
    return JSON.parse(fs.readFileSync(CHECKPOINT, 'utf-8')) as Checkpoint;
  } catch {
    return {};
  }
}

// Write to a temp file first, then rename, so a crash never leaves a half-written checkpoint.
function saveCheckpoint(data: Checkpoint) {
  const tmp = new URL('./.checkpoint.json.tmp', import.meta.url);
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, CHECKPOINT);
}

export async function extractLargeDocument(text: string, stopAfter = Infinity) {
  const chunks = chunkText(text, CHUNK_CHARS);
  const done = loadCheckpoint();
  let processedThisRun = 0;

  for (let i = 0; i < chunks.length; i++) {
    if (done[i] !== undefined) {
      console.log(`⏭️  chunk ${i + 1}/${chunks.length}: already done, skipping`);
      continue;
    }
    if (processedThisRun >= stopAfter) {
      console.log(`⏸️  stopping after ${stopAfter} chunk(s) for this run; rerun to continue`);
      break;
    }

    const { text: names } = await generateText({
      model: MODEL,
      prompt: `Extract all the names mentioned in this text. List them separated by commas.
Text:
${chunks[i]}`,
    });
    done[i] = names.trim();
    saveCheckpoint(done);
    processedThisRun++;
    console.log(`✅ chunk ${i + 1}/${chunks.length}: saved`);
  }

  // Merge all finished chunks into one de-duplicated list, in order.
  const seen = new Set<string>();
  for (let i = 0; i < chunks.length; i++) {
    for (const name of (done[i] ?? '').split(',')) {
      const cleaned = name.trim();
      if (cleaned) seen.add(cleaned);
    }
  }
  const finished = Object.keys(done).length === chunks.length;
  return { names: [...seen], finished, total: chunks.length };
}

async function main() {
  const text = fs.readFileSync(new URL('./essay.txt', import.meta.url), 'utf-8');
  const stopAfter = process.argv.includes('--stop-after')
    ? Number(process.argv[process.argv.indexOf('--stop-after') + 1])
    : Infinity;

  const result = await extractLargeDocument(text, stopAfter);
  console.log(`\n${result.finished ? '✅ Complete' : '⏳ Partial'} (${result.total} chunk(s))`);
  console.log(result.names.join(', ') || '(no names yet)');
}

main().catch((error) => {
  console.error('❌ Streaming extraction failed:', error.message);
  process.exit(1);
});
