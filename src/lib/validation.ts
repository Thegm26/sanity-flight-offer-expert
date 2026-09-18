import { z } from "zod";

const airportCode = z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, "Use a three-letter IATA airport code.");
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.").refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), "Use a valid calendar date.");

export const compareRequestSchema = z
  .object({
    origin: airportCode,
    destination: airportCode,
    departureDate: date,
    returnDate: date.optional(),
    adults: z.coerce.number().int().min(1).max(9),
    checkedBag: z.enum(["required", "not_required"]),
    flexibility: z.enum(["lowest_price", "balanced", "change_flexibility"]),
  })
  .superRefine((value, context) => {
    if (value.origin === value.destination) {
      context.addIssue({ code: "custom", path: ["destination"], message: "Origin and destination must differ." });
    }
    if (value.returnDate && value.returnDate < value.departureDate) {
      context.addIssue({ code: "custom", path: ["returnDate"], message: "Return date must be on or after departure date." });
    }
  });

export function parseCompareRequest(input: unknown) {
  return compareRequestSchema.parse(input);
}
