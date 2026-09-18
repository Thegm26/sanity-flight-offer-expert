import "server-only";

import { analyzeOffers } from "@/lib/agent";
import { fetchComparableOffers } from "@/lib/amadeus";
import { normalizeOffers, shortlistOffers } from "@/lib/normalize";
import type { CompareRequest, ComparisonResponse } from "@/lib/types";

const disclaimer = "Flight conditions and prices can change. Verify baggage, fare rules, changes, refunds, and final price with the airline or seller before purchasing.";

export async function compareFlightOffers(request: CompareRequest): Promise<ComparisonResponse> {
  const fetched = await fetchComparableOffers(request);
  const offers = shortlistOffers(normalizeOffers(fetched.offers));
  if (!offers.length) throw new Error("No usable offers were returned for this search.");
  const uncertainties = [...fetched.pricingWarnings, "Cabin-bag allowances are not supplied by the Amadeus Self-Service flight-offers API."];
  try {
    const analysis = await analyzeOffers(request, offers);
    return { dataMode: fetched.dataMode, offers, analysis, confirmedFactsLabel: "Confirmed offer data (Amadeus)", policyGuidanceLabel: "General policy guidance (Sanity Knowledge Base)", uncertainties: [...uncertainties, ...analysis.uncertainties], degraded: false, disclaimer };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "The policy analysis service is unavailable.";
    return { dataMode: fetched.dataMode, offers, analysis: null, confirmedFactsLabel: "Confirmed offer data (Amadeus)", policyGuidanceLabel: "General policy guidance (Sanity Knowledge Base)", uncertainties: [...uncertainties, `Policy analysis is unavailable: ${reason}`], degraded: true, disclaimer };
  }
}
