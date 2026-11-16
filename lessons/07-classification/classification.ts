import 'dotenv/config';
import fs from 'fs';
import { generateText, Output } from 'ai';
import { z } from 'zod';

// Lesson 7: classify support requests. Set SOURCE to the multilanguage file to try the
// Step 4 challenge.
const SOURCE = 'support_requests_multilanguage.json';
type SupportRequest = { id: number; text: string };
const supportRequests = JSON.parse(
  fs.readFileSync(new URL(`./${SOURCE}`, import.meta.url), 'utf-8'),
) as SupportRequest[];

// Step 1 + Step 3 + Step 4: the final schema from the lesson.
const classificationSchema = z.object({
  request: z.string().describe('The original support request text.'),
  category: z
    .enum(['billing', 'product_issues', 'enterprise_sales', 'account_issues', 'product_feedback'])
    .describe('The most relevant category for the support request.'),
  urgency: z.enum(['low', 'medium', 'high']).describe('The probable urgency of the support request.'),
  language: z
    .string()
    .describe('The full name of the language the support request is in (e.g., English, Spanish, German).'),
});

async function main() {
  console.log('Asking AI to classify support requests...');

  const { output: classifiedRequests } = await generateText({
    model: 'openai/gpt-5-mini', // fast model for classification; try 'openai/gpt-5' for edge cases
    prompt: `Classify the following support requests based on the defined categories.\n\n${JSON.stringify(supportRequests)}`,
    output: Output.array({ element: classificationSchema }),
  });

  console.log('\n--- AI Response (Structured JSON) ---');
  console.log(JSON.stringify(classifiedRequests, null, 2));
  console.log('-----------------------------------');
}

main().catch((error) => {
  console.error('❌ Classification failed:', error.message);
  process.exit(1);
});
