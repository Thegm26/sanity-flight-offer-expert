/** Sanitized, deterministic offer data shaped after Amadeus Flight Offers Search. */
export const fixtureFlightOffers = [
  {
    id: "fixture-af-direct",
    validatingAirlineCodes: ["AF"],
    price: { currency: "EUR", grandTotal: "248.30" },
    itineraries: [{ duration: "PT3H35M", segments: [{ departure: { iataCode: "CDG", at: "2026-11-12T10:25:00" }, arrival: { iataCode: "IST", at: "2026-11-12T16:00:00" }, carrierCode: "AF", number: "1390", duration: "PT3H35M", operating: { carrierCode: "AF" } }] }],
    travelerPricings: [{ travelerId: "1", fareDetailsBySegment: [{ cabin: "ECONOMY", class: "V", fareBasis: "V0LY", brandedFare: "LIGHT", includedCheckedBags: { quantity: 0 } }] }],
  },
  {
    id: "fixture-tk-bag",
    validatingAirlineCodes: ["TK"],
    price: { currency: "EUR", grandTotal: "281.80" },
    itineraries: [{ duration: "PT3H30M", segments: [{ departure: { iataCode: "CDG", at: "2026-11-12T13:30:00" }, arrival: { iataCode: "IST", at: "2026-11-12T19:00:00" }, carrierCode: "TK", number: "1822", duration: "PT3H30M", operating: { carrierCode: "TK" } }] }],
    travelerPricings: [{ travelerId: "1", fareDetailsBySegment: [{ cabin: "ECONOMY", class: "H", fareBasis: "H0LY", brandedFare: "ECOFLY", includedCheckedBags: { quantity: 1, weight: 23, weightUnit: "KG" } }] }],
    fareRules: [{ category: "EXCHANGE", description: "Conditions are supplied by the priced offer; verify before purchase." }],
  },
  {
    id: "fixture-ib-connection",
    validatingAirlineCodes: ["IB"],
    price: { currency: "EUR", grandTotal: "266.10" },
    itineraries: [{ duration: "PT6H45M", segments: [{ departure: { iataCode: "CDG", at: "2026-11-12T07:00:00" }, arrival: { iataCode: "MAD", at: "2026-11-12T09:05:00" }, carrierCode: "IB", number: "3423", duration: "PT2H05M", operating: { carrierCode: "IB" } }, { departure: { iataCode: "MAD", at: "2026-11-12T11:35:00" }, arrival: { iataCode: "IST", at: "2026-11-12T15:45:00" }, carrierCode: "IB", number: "3290", duration: "PT4H10M", operating: { carrierCode: "IB" } }] }],
    travelerPricings: [{ travelerId: "1", fareDetailsBySegment: [{ cabin: "ECONOMY", class: "O", fareBasis: "O0LY", brandedFare: "BASIC" }, { cabin: "ECONOMY", class: "O", fareBasis: "O0LY", brandedFare: "BASIC" }] }],
  },
] as const;

/** Sanitized Flight Offers Price shape: detailed rules live in top-level included. */
export const fixturePriceResponse = {
  data: { type: "flight-offers-pricing", flightOffers: [fixtureFlightOffers[1]] },
  included: {
    "detailed-fare-rules": [{
      fareBasis: "H0LY",
      segment: "1",
      category: "EXCHANGE",
      circumstances: "BEFORE DEPARTURE",
      notApplicable: false,
      penalty: "EUR 70",
      descriptions: [{ description: "Changes are subject to the priced offer conditions." }],
    }],
  },
} as const;
