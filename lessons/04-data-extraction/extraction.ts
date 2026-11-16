import 'dotenv/config'; // Load environment variables (API keys, etc.)
import fs from 'fs';
import { generateText } from 'ai'; // AI SDK's core text generation function

// Read the essay file that we'll extract names from (next to this script)
const essay = fs.readFileSync(new URL('./essay.txt', import.meta.url), 'utf-8');

async function main() {
  // Call the LLM with our extraction prompt
  const result = await generateText({
    model: 'openai/gpt-5-mini', // Fast, cost-effective for simple extraction tasks (non-reasoning)
    // For complex analysis, try 'openai/gpt-5' (reasoning model, slower but more accurate)
    prompt: `Extract all the names mentioned in this essay. List them separated by commas.
Essay:
${essay}`, // Instruction + the actual essay content
  });

  // The AI's response is in result.text
  console.log('\n--- AI Response ---');
  console.log(result.text); // This will be something like: "John Smith, Jane Doe, ..."
  console.log('-------------------');
}

// Run the async function and catch any errors
main().catch((error) => {
  console.error('❌ Extraction failed:', error.message);
  console.log('\n💡 Common issues:');
  console.log('  - Check your .env file has a valid AI_GATEWAY_API_KEY');
  console.log('  - Verify essay.txt exists in lessons/04-data-extraction/');
  console.log('  - Ensure you have internet connectivity for API calls');
  process.exit(1);
});
