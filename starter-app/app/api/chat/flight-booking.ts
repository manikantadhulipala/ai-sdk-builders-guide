import { z } from "zod";

// Side quest: dependent fields. The schema checks each field's shape; the returnDate-after-departure
// rule is checked separately by validateTripDates, because zod cannot compare two sibling fields here.
export const flightBookingParameters = z.object({
  trip: z.object({
    origin: z.string().describe("Origin airport code (e.g., LAX, JFK)"),
    destination: z.string().describe("Destination airport code (e.g., LHR, NRT)"),
    departureDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
      .describe("Departure date in YYYY-MM-DD format"),
    returnDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
      .describe("Return date in YYYY-MM-DD format (for round trips)")
      .optional(),
  }),
  passengers: z
    .array(
      z.object({
        type: z.enum(["adult", "child", "infant"]).describe("Passenger type"),
        count: z.number().int().min(1).max(9).describe("Number of this passenger type"),
      }),
    )
    .min(1)
    .describe("Passenger list with at least one entry"),
  preferences: z
    .object({
      cabinClass: z
        .enum(["economy", "premium", "business", "first"])
        .describe("Preferred cabin class")
        .optional(),
      directFlightsOnly: z.boolean().describe("Whether to only show direct flights").optional(),
    })
    .optional(),
});

export type FlightBooking = z.infer<typeof flightBookingParameters>;

// Dependent-field check: a return date must be after the departure date.
export function validateTripDates(trip: FlightBooking["trip"]): string | null {
  if (!trip.returnDate) return null;
  return trip.returnDate > trip.departureDate ? null : "returnDate must be after departureDate";
}
