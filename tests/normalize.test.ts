import { describe, expect, it } from "vitest";
import { fixtureFlightOffers, fixturePriceResponse } from "@/test-fixtures/amadeus";
import { attachDetailedFareRules } from "@/lib/amadeus";
import { normalizeOffer, normalizeOffers, shortlistOffers } from "@/lib/normalize";

describe("Amadeus offer normalization", () => {
  it("keeps confirmed price, schedules, stops, and checked-bag status", () => {
    const offer = normalizeOffer(fixtureFlightOffers[1]);
    expect(offer).toMatchObject({ id: "fixture-tk-bag", price: { currency: "EUR", total: 281.8 }, itineraries: [{ stops: 0 }], source: "confirmed_offer_data" });
    expect(offer?.fareDetails[0].checkedBag).toMatchObject({ status: "included", quantity: 1 });
  });

  it("does not invent a missing checked-bag allowance", () => {
    const offer = normalizeOffer(fixtureFlightOffers[2]);
    expect(offer?.fareDetails.every((detail) => detail.checkedBag.status === "unknown")).toBe(true);
  });

  it("treats a weight-only checked-bag allowance as included without inventing pieces", () => {
    const raw = structuredClone(fixtureFlightOffers[0]);
    const detail = raw.travelerPricings[0].fareDetailsBySegment[0] as { includedCheckedBags?: unknown };
    detail.includedCheckedBags = { weight: 23, weightUnit: "KG" };
    const offer = normalizeOffer(raw);
    expect(offer?.fareDetails[0].checkedBag).toMatchObject({ status: "included", weight: 23, weightUnit: "KG" });
    expect(offer?.fareDetails[0].checkedBag.quantity).toBeUndefined();
  });

  it("preserves detailed fare rules returned in Flight Offers Price included", () => {
    const offer = attachDetailedFareRules(fixturePriceResponse.data.flightOffers[0], fixturePriceResponse.included);
    const normalized = normalizeOffer(offer);
    expect(normalized?.fareRuleText).toEqual(expect.arrayContaining([
      "Fare basis: H0LY", "Segment: 1", "Category: EXCHANGE", "Circumstances: BEFORE DEPARTURE", "Not applicable: false", "Penalty: EUR 70", "Description: Changes are subject to the priced offer conditions.",
    ]));
  });

  it("selects no more than four diverse comparable offers", () => {
    const normalized = normalizeOffers(fixtureFlightOffers as unknown as unknown[]);
    const offers = shortlistOffers([...normalized, ...normalized]);
    expect(offers).toHaveLength(3);
    expect(offers.map((offer) => offer.id)).toContain("fixture-ib-connection");
  });

  it("drops malformed offers instead of producing guessed facts", () => {
    expect(normalizeOffer({ id: "bad", price: { currency: "EUR", grandTotal: "19" }, itineraries: [] })).toBeNull();
  });
});
