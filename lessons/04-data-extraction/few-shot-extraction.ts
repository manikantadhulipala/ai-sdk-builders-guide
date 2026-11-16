import 'dotenv/config';
import fs from 'fs';
import { generateText } from 'ai';

// Side quest: Advanced Prompt Engineering. Few-shot, structured JSON, and a consistency test.
const essay = fs.readFileSync(new URL('./essay.txt', import.meta.url), 'utf-8');

const fewShotPrompt = `Extract all person names from text, including their roles if mentioned.

Example 1:
Text: "CEO Sarah Chen met with investor Mark Johnson at the conference."
Output:
- Sarah Chen (CEO)
- Mark Johnson (investor)

Example 2:
Text: "The founders, Alex and Jamie, hired consultant Dr. Lisa Wang."
Output:
- Alex (founder)
- Jamie (founder)
- Dr. Lisa Wang (consultant)

Now extract from this text:
${essay}

Output:`;

const structuredPrompt = `Extract names and relationships from this essay.
Format as JSON with this structure:

{
  "people": [
    {
      "name": "Full Name",
      "role": "their role/title if mentioned",
      "relationships": ["list of people they're connected to"]
    }
  ]
}

Essay: ${essay}`;

// Runs the same prompt several times to see how stable the output is.
async function testConsistency(prompt: string, iterations = 3) {
  const results: string[] = [];
  for (let i = 0; i < iterations; i++) {
    const { text } = await generateText({ model: 'openai/gpt-5-mini', prompt });
    results.push(text);
  }

  console.log('Consistency Test Results:');
  results.forEach((result, i) => console.log(`Run ${i + 1}:`, result));
}

async function main() {
  console.log('--- Few-shot ---');
  await testConsistency(fewShotPrompt);
  console.log('\n--- Structured JSON ---');
  await testConsistency(structuredPrompt, 1);
}

main().catch((error) => {
  console.error('❌ Few-shot extraction failed:', error.message);
  process.exit(1);
});
