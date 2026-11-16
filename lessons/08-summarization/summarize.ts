import 'dotenv/config';
import fs from 'fs';
import { generateText, Output } from 'ai';
import { z } from 'zod';

// Lesson 8: summarise a comment thread with generateText + Output.object().
// The schema uses .describe() on every field, the refinement from Step 4.
const comments = JSON.parse(
  fs.readFileSync(new URL('./messages.json', import.meta.url), 'utf-8'),
) as unknown[];

export const summarySchema = z.object({
  headline: z.string().describe('The main topic or title of the summary. Max 5 words.'),
  context: z
    .string()
    .describe('Briefly explain the situation or background that led to this discussion. Max 2 sentences.'),
  discussionPoints: z.string().describe('Summarize the key topics discussed. Max 2 sentences.'),
  takeaways: z
    .string()
    .describe(
      'List the main decisions, action items, or next steps. Include names for assigned tasks. Max 2-3 bullet points or sentences.',
    ),
});

export async function generateSummary(items: unknown[]) {
  const { output } = await generateText({
    model: 'openai/gpt-5-mini',
    prompt: `Please summarize the following comments concisely, focusing on key decisions and action items.

Comments:
${JSON.stringify(items)}`,
    output: Output.object({ schema: summarySchema }),
  });
  return output;
}

async function main() {
  const summary = await generateSummary(comments);
  console.log('\n--- Summary ---');
  console.log(JSON.stringify(summary, null, 2));
}

// Only run when executed directly, so the module can be imported by the side quest.
if (process.argv[1]?.endsWith('summarize.ts')) {
  main().catch((error) => {
    console.error('❌ Summary failed:', error.message);
    process.exit(1);
  });
}
