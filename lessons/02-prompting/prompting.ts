import { generateText } from 'ai';
import 'dotenv/config';

// Zero-shot: ask directly, no examples.
async function zeroShot(userInput: string) {
  const { text } = await generateText({
    model: 'openai/gpt-5-mini',
    prompt: `Classify sentiment (positive/negative/neutral): '${userInput}'`,
  });
  return text;
}

// Few-shot: show the pattern with examples, then ask for the new item.
async function fewShot(userItem: string) {
  const { text } = await generateText({
    model: 'openai/gpt-5-mini',
    prompt: `
Classify the following items based on the examples.

Item: Apple
Category: A
Reason: It's a fruit.

Item: ${userItem}
Category:`,
  });
  return text;
}

// Chain-of-thought: a worked example first, so the model reasons step by step.
async function chainOfThought(userOrder: string) {
  const { text } = await generateText({
    model: 'openai/gpt-5',
    prompt: `
Q: Calculate the total cost: 5 apples at $0.50 each, 2 bananas at $0.75 each.
A:
Cost of apples = 5 * $0.50 = $2.50
Cost of bananas = 2 * $0.75 = $1.50
Total cost = $2.50 + $1.50 = $4.00
The final answer is: $4.00

Q: Calculate the total cost: ${userOrder}
A:`,
  });
  return text;
}

async function main() {
  console.log('Zero-shot:', await zeroShot('This movie was okay.'));
  console.log('Few-shot:', await fewShot('Vardudel'));
  console.log(
    'Chain-of-thought:',
    await chainOfThought('3 pears at $0.40 each, 1 melon at $2.00'),
  );
}

main().catch(console.error);
