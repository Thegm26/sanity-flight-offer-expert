export type DataMode = "fixture" | "live";

export type CompareRequest = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  checkedBag: "required" | "not_required";
  flexibility: "lowest_price" | "balanced" | "change_flexibility";
};

export type Segment = {
  departure: { airport: string; at: string };
  arrival: { airport: string; at: string };
  carrierCode: string;
  operatingCarrierCode?: string;
  flightNumber: string;
  duration?: string;
};

export type Itinerary = {
  duration?: string;
  stops: number;
  departureAt: string;
  arrivalAt: string;
  segments: Segment[];
};

export type CheckedBag = {
  status: "included" | "not_included" | "unknown";
  quantity?: number;
  weight?: number;
  weightUnit?: string;
  note?: string;
};

export type FareDetail = {
  cabin?: string;
  fareBasis?: string;
  brandedFare?: string;
  class?: string;
  checkedBag: CheckedBag;
};

export type NormalizedOffer = {
  id: string;
  price: { currency: string; total: number };
  validatingCarriers: string[];
  itineraries: Itinerary[];
  fareDetails: FareDetail[];
  fareRuleText: string[];
  source: "confirmed_offer_data";
};

export type PolicyCitation = {
  title: string;
  url: string;
  summary: string;
  source: "general_policy_guidance";
};

export type AgentAnalysis = {
  recommendedOfferId: string;
  recommendation: string;
  offerTradeoffs: Array<{ offerId: string; summary: string }>;
  policyGuidance: PolicyCitation[];
  uncertainties: string[];
};

export type ComparisonResponse = {
  dataMode: DataMode;
  offers: NormalizedOffer[];
  analysis: AgentAnalysis | null;
  confirmedFactsLabel: "Confirmed offer data (Amadeus)";
  policyGuidanceLabel: "General policy guidance (Sanity Knowledge Base)";
  uncertainties: string[];
  degraded: boolean;
  disclaimer: string;
};
