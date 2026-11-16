import 'dotenv/config';
import fs from 'fs';
import { generateText, Output } from 'ai';
import { z } from 'zod';

// Side quest: multi-label classification. A request can belong to more than one category.
type SupportRequest = { id: number; text: string };
const supportRequests = JSON.parse(
  fs.readFileSync(new URL('./support_requests.json', import.meta.url), 'utf-8'),
) as SupportRequest[];

// Each request gets an array of categories. The description asks for a small number
// on purpose, to limit over-assignment (everything becoming product_issues).
const multiLabelSchema = z.object({
  request: z.string().describe('The original support request text.'),
  categories: z
    .array(z.enum(['billing', 'product_issues', 'enterprise_sales', 'account_issues', 'product_feedback']))
    .min(1)
    .max(2)
    .describe(
      'One or two categories. Add a second only when the request clearly spans both areas, ' +
        'for example a payment problem that also blocks product access. Do not add a category just because it is related.',
    ),
});

async function main() {
  const { output } = await generateText({
    model: 'openai/gpt-5-mini',
    prompt: `Classify each support request into one or two categories.\n\n${JSON.stringify(supportRequests)}`,
    output: Output.array({ element: multiLabelSchema }),
  });

  console.log(JSON.stringify(output, null, 2));
  const counts = output.map((r) => r.categories.length);
  console.log(`\nCategories per request: ${counts.join(', ')} (avg ${(counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(2)})`);
}

main().catch((error) => {
  console.error('❌ Multi-label classification failed:', error.message);
  process.exit(1);
});
