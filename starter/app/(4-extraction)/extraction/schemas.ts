import { z } from "zod";

// Today's date is injected so the model can resolve "tomorrow" and "next Tuesday".
const today = new Date().toISOString().split("T")[0];

export const appointmentSchema = z.object({
  title: z
    .string()
    .describe("The title of the event. The main purpose, concise, without names. Capitalise properly."),
  startTime: z
    .string()
    .nullable()
    .describe("Start time in 24-hour HH:MM format, zero-padded (e.g. 14:00 for 2pm). Null if not stated."),
  endTime: z
    .string()
    .nullable()
    .describe("End time in 24-hour HH:MM format. If not stated but a start time is, use one hour after startTime."),
  attendees: z
    .array(z.string())
    .nullable()
    .describe("Attendee names, with first and last names when given. Null if none are mentioned."),
  location: z.string().nullable(),
  date: z
    .string()
    .describe(`The appointment date in YYYY-MM-DD format. Today is ${today}. Resolve "tomorrow" and "next Tuesday" from today.`),
});

export type AppointmentDetails = z.infer<typeof appointmentSchema>;
