import 'dotenv/config';
import { generateText, Output } from 'ai';
import { z } from 'zod';

// Smart form filling from natural language, plus the optional email triage challenge.

const userInput =
  'Lunch with the design team next Tuesday at noon in the 3rd floor kitchen, about 45 minutes. Priya and Tom are coming. Bring the new mockups.';

async function smartFormFill(input: string) {
  const eventSchema = z.object({
    eventTitle: z.string().describe('The title or purpose of the event'),
    date: z.string().describe('The date of the event'),
    time: z.string().nullable().describe('The time of the event'),
    duration: z.string().nullable().describe('How long the event will last'),
    location: z.string().nullable().describe('Where the event will take place'),
    attendees: z.array(z.string()).nullable().describe('People attending'),
    notes: z.string().nullable().describe('Additional notes or agenda items'),
  });

  const { output: eventDetails } = await generateText({
    model: 'openai/gpt-5-mini',
    prompt: `Extract calendar event details from: "${input}"`,
    output: Output.object({ schema: eventSchema }),
  });

  console.log('✨ AI automatically fills your form:\n');
  console.log(`📅 Event: ${eventDetails.eventTitle}`);
  console.log(`📆 Date: ${eventDetails.date}`);
  if (eventDetails.time) console.log(`⏰ Time: ${eventDetails.time}`);
  if (eventDetails.location) console.log(`📍 Location: ${eventDetails.location}`);
  if (eventDetails.attendees) console.log(`👥 Attendees: ${eventDetails.attendees.join(', ')}`);
  if (eventDetails.notes) console.log(`📝 Notes: ${eventDetails.notes}`);

  console.log('\n✅ Form ready to save - no manual input needed!');
}

// Challenge: categorise an email. Optional fields use .nullable() so the model
// always returns the key, with null when there is no value.
async function smartEmailTriage(email: string) {
  const triageSchema = z.object({
    category: z.enum(['billing', 'support', 'sales', 'spam', 'other']),
    priority: z.enum(['low', 'medium', 'high']),
    suggestedResponse: z
      .string()
      .nullable()
      .describe('A short reply, or null if the email is too complex to answer automatically'),
  });

  const { output } = await generateText({
    model: 'openai/gpt-5-mini',
    prompt: `Triage this email. Suggest a reply only if it is simple.\n\nEmail:\n${email}`,
    output: Output.object({ schema: triageSchema }),
  });

  console.log('\n📧 Email triage:');
  console.log(JSON.stringify(output, null, 2));
}

async function main() {
  await smartFormFill(userInput);
  await smartEmailTriage('Hi, I was charged twice for my March invoice. Can you refund one payment?');
}

main().catch((error) => {
  console.error('❌ Demo failed:', error.message);
  process.exit(1);
});
