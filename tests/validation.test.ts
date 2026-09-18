import { describe, expect, it } from "vitest";
import { parseCompareRequest } from "@/lib/validation";

const valid = { origin: "cdg", destination: "ist", departureDate: "2026-11-12", adults: 1, checkedBag: "required", flexibility: "balanced" };

describe("compare request validation", () => {
  it("normalizes IATA codes", () => expect(parseCompareRequest(valid)).toMatchObject({ origin: "CDG", destination: "IST" }));
  it("rejects same-airport itineraries", () => expect(() => parseCompareRequest({ ...valid, destination: "CDG" })).toThrow("Origin and destination"));
  it("rejects an invalid return ordering", () => expect(() => parseCompareRequest({ ...valid, returnDate: "2026-11-01" })).toThrow("Return date"));
  it("rejects a non-IATA origin", () => expect(() => parseCompareRequest({ ...valid, origin: "Paris" })).toThrow("IATA"));
});
