import 'dotenv/config';
import fs from 'fs';
import { generateText } from 'ai';

// Challenge 1 (prompt) and Challenge 2 (model) from the lesson.
// Change MODEL to 'openai/gpt-5' to compare quality and cost.
const MODEL = 'openai/gpt-5-mini';

const essay = fs.readFileSync(new URL('./essay.txt', import.meta.url), 'utf-8');

async function main() {
  const { text } = await generateText({
    model: MODEL,
    prompt: `What is the key takeaway of this piece in 50 words?

Essay:
${essay}`,
  });

  console.log(`\n--- Summary (${MODEL}) ---`);
  console.log(text);
  console.log('-------------------');
}

main().catch((error) => {
  console.error('❌ Summary failed:', error.message);
  process.exit(1);
});
