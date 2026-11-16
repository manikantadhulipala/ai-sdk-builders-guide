import 'dotenv/config';
import { generateText, Output } from 'ai';
import { appointmentSchemaFor, addDays, weekday } from './schemas.js';

// Lesson 9: extract appointment details from natural language with generateText + Output.object().

export async function extractAppointment(input: string, today = new Date().toISOString().slice(0, 10)) {
  const { output } = await generateText({
    model: 'openai/gpt-5-mini',
    prompt: `Extract the appointment details from the following natural language input:\n\n"${input}"`,
    output: Output.object({ schema: appointmentSchemaFor(today) }),
  });
  return output;
}

async function main() {
  // A fixed "today" makes the relative-date example reproducible.
  const today = '2025-09-29';
  const inputs = [
    'Meeting with Guillermo Rauch about Next Conf Keynote Practice tomorrow at 2pm at Vercel HQ',
    'Quick sync with Lee tomorrow morning',
  ];
  console.log(`Today is ${today} (${weekday(today)}); tomorrow is ${addDays(today, 1)}\n`);
  for (const input of inputs) {
    const details = await extractAppointment(input, today);
    console.log(`Input: "${input}"`);
    console.log(JSON.stringify(details, null, 2));
    console.log('');
  }
}

if (process.argv[1]?.endsWith('extract.ts')) {
  main().catch((error) => {
    console.error('❌ Extraction failed:', error.message);
    process.exit(1);
  });
}
