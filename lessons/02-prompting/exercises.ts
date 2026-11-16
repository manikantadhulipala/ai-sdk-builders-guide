import 'dotenv/config';
import { generateText, Output } from 'ai';
import { z } from 'zod';

// Scripted versions of the course's AI SDK Playground exercises.

// Exercise 1: few-shot categorisation of user feedback.
const fewShotFeedback = `Categorize user feedback based on these examples:

Example 1:
Feedback: "Love the new design! So much easier to navigate."
Category: praise, Sentiment: positive, Urgency: low

Example 2:
Feedback: "Need a dark mode option for night work."
Category: feature, Sentiment: neutral, Urgency: medium

Example 3:
Feedback: "Login page won't load, can't access my account!"
Category: bug, Sentiment: negative, Urgency: high

Now categorize this feedback:
"The app keeps crashing when I try to upload files. This is really frustrating!"`;

// Exercise 2: chain-of-thought reasoning about team sizes.
const chainOfThought = `Q: A company has 150 employees. They want teams of 8-12 people, but no team can have exactly 10. Teams should be as equal as possible. How should they organize?

A: Let me work through this step by step.

First, I need to find valid team sizes: 8, 9, 11, or 12 people.

Let me try different combinations:
- If I use 12-person teams: 150 ÷ 12 = 12.5, so I could have 12 teams of 12 (144 people) + 1 team of 6. But 6 is too small.
- If I use 11-person teams: 150 ÷ 11 = 13.6, so I could have 13 teams of 11 (143 people) + 1 team of 7. But 7 is too small.

Let me try mixing sizes...

Q: If a small business wants to expand from 5 to 50 employees over 2 years, what should they consider?

A:`;

// Exercise 3: schema-guided structured output for feedback.
const feedbackSchema = z.object({
  category: z.enum(['bug', 'feature', 'praise', 'complaint']),
  sentiment: z.enum(['positive', 'negative', 'neutral']),
  priority: z.enum(['low', 'medium', 'high']),
});

async function main() {
  console.log('--- Exercise 1: few-shot ---');
  const fewShot = await generateText({ model: 'openai/gpt-5-mini', prompt: fewShotFeedback });
  console.log(fewShot.text);

  console.log('\n--- Exercise 2: chain-of-thought ---');
  const cot = await generateText({ model: 'openai/gpt-5-mini', prompt: chainOfThought });
  console.log(cot.text);

  console.log('\n--- Exercise 3: schema-guided output ---');
  const structured = await generateText({
    model: 'openai/gpt-5-mini',
    prompt: "Analyze this user feedback: 'Love the new search feature, but it's a bit slow when I type fast.'",
    output: Output.object({ schema: feedbackSchema }),
  });
  console.log(structured.output);
}

main().catch((error) => {
  console.error('❌ Exercises failed:', error.message);
  process.exit(1);
});
