import 'dotenv/config';
import fs from 'fs';
import { generateText } from 'ai';

// Side quest: Extraction Expert. Three specialised prompts over the same essay.
const essay = fs.readFileSync(new URL('./essay.txt', import.meta.url), 'utf-8');

const companyPrompt = `Extract all company names from this essay.
Include both explicit mentions and implied references (e.g., "the startup" referring to a previously mentioned company).

Format as JSON array: ["Company 1", "Company 2"]

Essay: ${essay}`;

const conceptPrompt = `Identify the main business concepts and technical terms in this essay.
Categorize them as either 'business' or 'technical' concepts.

Format as JSON:
{
  "business": ["concept1", "concept2"],
  "technical": ["term1", "term2"]
}

Essay: ${essay}`;

const quotePrompt = `Extract all quotes (text in quotation marks) from this essay.
For each quote, identify who said it if mentioned.

Format as JSON array:
[{"quote": "text here", "speaker": "name or null"}]

Essay: ${essay}`;

async function run(label: string, prompt: string) {
  const { text } = await generateText({ model: 'openai/gpt-5-mini', prompt });
  console.log(`\n--- ${label} ---`);
  console.log(text);
}

async function main() {
  await run('Companies', companyPrompt);
  await run('Concepts', conceptPrompt);
  await run('Quotes', quotePrompt);
}

main().catch((error) => {
  console.error('❌ Advanced extraction failed:', error.message);
  process.exit(1);
});
