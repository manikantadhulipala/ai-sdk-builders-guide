import dotenvFlow from 'dotenv-flow';
dotenvFlow.config();

import { generateText, Output } from 'ai';
import { z } from 'zod';

// Lesson 6, Step 1 and 2: plain text vs structured output for the same input.
const namesText = 'Guillermo, Lee, and Sarah joined the call.';
const appointmentText =
  'Let us meet with Sarah and Lee on Thursday, November 20 at 2pm in the Berlin office to review the Q4 plan.';

async function compareOutputs() {
  console.log('\n=== Using generateText (Plain Text) ===\n');
  const { text } = await generateText({
    model: 'openai/gpt-5-mini',
    prompt: `Extract all names from this text: ${namesText}`,
  });
  console.log('Raw text output:', text);
  console.log('Output type:', typeof text);
  console.log('Need to parse string to get individual names');

  console.log('\n=== Using generateText with Output.object() (Structured Data) ===\n');

  const appointmentSchema = z.object({
    title: z.string().describe('The meeting title or subject'),
    date: z.string().describe('The date of the meeting'),
    time: z.string().nullable().describe('The time of the event'),
    location: z.string().nullable().describe('Where the event will take place'),
    attendees: z.array(z.string()).nullable().describe('People attending'),
  });

  const { output } = await generateText({
    model: 'openai/gpt-5-mini',
    prompt: `Parse appointment details from: ${appointmentText}`,
    output: Output.object({ schema: appointmentSchema }),
  });

  console.log('Structured output:', JSON.stringify(output, null, 2));
  console.log('Output type:', typeof output);
  console.log('\nDirect property access:');
  console.log('- Title:', output.title);
  console.log('- Date:', output.date);
  console.log('- Time:', output.time);
  console.log('- Location:', output.location);
  console.log('- Attendees:', output.attendees?.join(', '));
}

compareOutputs().catch((error) => {
  console.error('❌ Comparison failed:', error.message);
  process.exit(1);
});
