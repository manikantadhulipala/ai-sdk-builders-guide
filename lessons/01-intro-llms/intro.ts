import { generateText } from 'ai';
import 'dotenv/config';

// Lesson 1: LLMs as an API. Send a prompt, get text back.
async function main() {
  const { text } = await generateText({
    model: 'openai/gpt-5-mini',
    prompt: 'Tell me a short, funny joke about web developers.',
  });

  console.log(text);
}

main().catch(console.error);
