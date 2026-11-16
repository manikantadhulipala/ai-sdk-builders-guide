import { z } from 'zod';

// Today's date is injected into the schema so the model can resolve "tomorrow" or "next Tuesday".
// Pass the date in, so the schema is testable with a fixed "today".
export function appointmentSchemaFor(today: string) {
  return z.object({
    title: z
      .string()
      .describe('The title of the event. The main purpose, concise, without names. Capitalise properly.'),
    startTime: z
      .string()
      .nullable()
      .describe('Start time in 24-hour HH:MM format, zero-padded (e.g. 14:00 for 2pm, 09:30 for 9:30am). Null if not stated.'),
    endTime: z
      .string()
      .nullable()
      .describe('End time in 24-hour HH:MM format. If not stated but a start time is, use one hour after startTime.'),
    attendees: z
      .array(z.string())
      .nullable()
      .describe('Attendee names, with first and last names when given. Null if none are mentioned.'),
    location: z.string().nullable().describe('Where it takes place. Null if not stated.'),
    date: z
      .string()
      .describe(
        `The appointment date in YYYY-MM-DD format. Today is ${today}, which is a ${weekday(today)}. ` +
          'Resolve relative dates from today: "tomorrow" is the next day, "next Tuesday" is the Tuesday of the following week. ' +
          '"Morning" means 09:00 and "afternoon" means 14:00 when no exact time is given.',
      ),
  });
}

export type AppointmentDetails = z.infer<ReturnType<typeof appointmentSchemaFor>>;

// Day name for a YYYY-MM-DD string, computed in UTC so the result does not depend on the machine's time zone.
export function weekday(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
}

// Add one day to a YYYY-MM-DD string, in UTC.
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
