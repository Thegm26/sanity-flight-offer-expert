import type { CheckedBag, Itinerary, NormalizedOffer, Segment } from "@/lib/types";

type RecordValue = Record<string, unknown>;
const isRecord = (value: unknown): value is RecordValue => typeof value === "object" && value !== null;
const strings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
const text = (value: unknown) => typeof value === "string" && value.trim() ? value : undefined;

function bagFrom(value: unknown): CheckedBag {
  if (!isRecord(value)) return { status: "unknown", note: "Checked-bag allowance was not returned for this fare." };
  const quantity = typeof value.quantity === "number" ? value.quantity : undefined;
  const weight = typeof value.weight === "number" ? value.weight : undefined;
  const weightUnit = text(value.weightUnit);
  if (quantity !== undefined) return quantity > 0 ? { status: "included", quantity, weight, weightUnit, note: weight ? `Allowance also lists ${weight}${weightUnit ?? ""}.` : undefined } : { status: "not_included", quantity: 0 };
  if (weight !== undefined) return { status: "included", weight, weightUnit, note: `Allowance lists a weight limit of ${weight}${weightUnit ?? ""}; no piece count was returned.` };
  return { status: "unknown", note: "Checked-bag allowance was incomplete in the offer response." };
}

function normalizeSegment(value: unknown): Segment | null {
  if (!isRecord(value) || !isRecord(value.departure) || !isRecord(value.arrival)) return null;
  const departureAirport = text(value.departure.iataCode);
  const departureAt = text(value.departure.at);
  const arrivalAirport = text(value.arrival.iataCode);
  const arrivalAt = text(value.arrival.at);
  const carrierCode = text(value.carrierCode);
  const number = text(value.number);
  if (!departureAirport || !departureAt || !arrivalAirport || !arrivalAt || !carrierCode || !number) return null;
  const operating = isRecord(value.operating) ? text(value.operating.carrierCode) : undefined;
  return { departure: { airport: departureAirport, at: departureAt }, arrival: { airport: arrivalAirport, at: arrivalAt }, carrierCode, operatingCarrierCode: operating, flightNumber: number, duration: text(value.duration) };
}

function normalizeItinerary(value: unknown): Itinerary | null {
  if (!isRecord(value)) return null;
  const segments = Array.isArray(value.segments) ? value.segments.map(normalizeSegment).filter((segment): segment is Segment => segment !== null) : [];
  if (!segments.length) return null;
  return { duration: text(value.duration), stops: Math.max(0, segments.length - 1), departureAt: segments[0].departure.at, arrivalAt: segments.at(-1)!.arrival.at, segments };
}

function fareRules(value: unknown): string[] {
  if (!isRecord(value)) return [];
  const rawRules = Array.isArray(value.fareRules) ? value.fareRules : [];
  const detailedRules = Array.isArray(value.detailedFareRules) ? value.detailedFareRules : [];
  return [
    ...rawRules.flatMap((rule) => isRecord(rule) ? [text(rule.category), text(rule.description)].filter((item): item is string => Boolean(item)) : []),
    ...detailedRules.flatMap(formatDetailedFareRule),
  ];
}

function formatDetailedFareRule(rule: unknown): string[] {
  if (!isRecord(rule)) return [];
  const fields: Array<[string, unknown]> = [
    ["Fare basis", rule.fareBasis],
    ["Segment", rule.segment],
    ["Category", rule.category],
    ["Circumstances", rule.circumstances],
    ["Not applicable", rule.notApplicable],
    ["Penalty", rule.penalty],
  ];
  const result = fields.flatMap(([label, item]) => primitive(item).map((value) => `${label}: ${value}`));
  for (const description of textFragments(rule.descriptions ?? rule.description)) result.push(`Description: ${description}`);
  return result;
}

function primitive(value: unknown): string[] {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? [String(value)] : [];
}

function textFragments(value: unknown): string[] {
  if (typeof value === "string") return value.trim() ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(textFragments);
  if (!isRecord(value)) return [];
  return Object.values(value).flatMap(textFragments);
}

export function normalizeOffer(raw: unknown): NormalizedOffer | null {
  if (!isRecord(raw) || !isRecord(raw.price)) return null;
  const id = text(raw.id);
  const total = Number(raw.price.grandTotal ?? raw.price.total);
  const currency = text(raw.price.currency);
  const itineraries = Array.isArray(raw.itineraries) ? raw.itineraries.map(normalizeItinerary).filter((item): item is Itinerary => item !== null) : [];
  if (!id || !Number.isFinite(total) || total <= 0 || !currency || !itineraries.length) return null;
  const travelerPricings = Array.isArray(raw.travelerPricings) ? raw.travelerPricings : [];
  const fareDetails = travelerPricings.flatMap((traveler) => isRecord(traveler) && Array.isArray(traveler.fareDetailsBySegment) ? traveler.fareDetailsBySegment : []).flatMap((detail) => {
    if (!isRecord(detail)) return [];
    return [{ cabin: text(detail.cabin), fareBasis: text(detail.fareBasis), brandedFare: text(detail.brandedFare), class: text(detail.class), checkedBag: bagFrom(detail.includedCheckedBags) }];
  });
  return { id, price: { currency, total }, validatingCarriers: strings(raw.validatingAirlineCodes), itineraries, fareDetails, fareRuleText: fareRules(raw), source: "confirmed_offer_data" };
}

export function normalizeOffers(rawOffers: unknown[]): NormalizedOffer[] {
  return rawOffers.map(normalizeOffer).filter((offer): offer is NormalizedOffer => offer !== null);
}

export function shortlistOffers(offers: NormalizedOffer[], maxOffers = 4): NormalizedOffer[] {
  const sorted = [...offers].sort((left, right) => left.price.total - right.price.total);
  const selected: NormalizedOffer[] = [];
  const keys = new Set<string>();
  for (const offer of sorted) {
    if (selected.some((item) => item.id === offer.id)) continue;
    const key = `${offer.validatingCarriers.join(",")}:${offer.itineraries[0]?.stops ?? 0}:${offer.fareDetails.some((detail) => detail.checkedBag.status === "included")}`;
    if (!keys.has(key) || selected.length < 2) { selected.push(offer); keys.add(key); }
    if (selected.length === maxOffers) return selected;
  }
  for (const offer of sorted) { if (!selected.some((item) => item.id === offer.id)) selected.push(offer); if (selected.length === maxOffers) break; }
  return selected;
}
