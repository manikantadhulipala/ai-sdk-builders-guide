import fs from 'fs';
import { get_encoding } from 'tiktoken';

// Count tokens in the lesson essay with the o200k_base tokenizer, and compare with characters.
// Token counts are a local estimate and do not require a model call.
const essay = fs.readFileSync(new URL('./essay.txt', import.meta.url), 'utf-8');

const encoding = get_encoding('o200k_base');
try {
  const tokens = encoding.encode(essay);
  const chars = essay.length;
  console.log(`Characters: ${chars}`);
  console.log(`Tokens:     ${tokens.length}`);
  console.log(`Ratio:      ${(chars / tokens.length).toFixed(2)} characters per token`);

  const sample = 'Tokenization of unusual words like Kubernetes-ified 12345 🚀 splits into pieces.';
  console.log(`\nSample: "${sample}"`);
  console.log(`Tokens: ${encoding.encode(sample).length}`);
} finally {
  encoding.free();
}
