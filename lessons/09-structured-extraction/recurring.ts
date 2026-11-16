import { z } from 'zod';
import { appointmentSchemaFor } from './schemas.js';

// Side quest: recurring appointments. Adds a frequency and an end condition to the base schema.
// Null frequency means a one-off appointment.
export function recurringAppointmentSchemaFor(today: string) {
  return appointmentSchemaFor(today).extend({
    recurrence: z
      .object({
        frequency: z
          .enum(['daily', 'weekly', 'monthly'])
          .describe('How often it repeats. "every Monday" is weekly; "each month" is monthly.'),
        interval: z.number().int().min(1).default(1).describe('Every N periods, e.g. "every 2 weeks" is 2.'),
        daysOfWeek: z
          .array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']))
          .nullable()
          .describe('For weekly repeats, the weekdays it happens on. Null otherwise.'),
        until: z
          .string()
          .nullable()
          .describe('Last date in YYYY-MM-DD if stated ("until March 1"). Null if it has no end.'),
        count: z
          .number()
          .int()
          .nullable()
          .describe('Number of occurrences if stated ("for 5 weeks"). Null if not stated.'),
      })
      .nullable()
      .describe('Null for a one-off appointment.'),
  });
}
