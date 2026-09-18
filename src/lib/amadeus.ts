import "server-only";

import { getAmadeusConfig, getDataMode } from "@/lib/env";
import { normalizeOffers, shortlistOffers } from "@/lib/normalize";
import { fixtureFlightOffers } from "@/test-fixtures/amadeus";
import type { CompareRequest, DataMode } from "@/lib/types";

type Token = { value: string; expiresAt: number };
let token: Token | undefined;

async function amadeusFetch(path: string, init: RequestInit = {}) {
  const config = getAmadeusConfig();
  const accessToken = await getAccessToken();
  const response = await fetch(`${config.baseUrl}${path}`, { ...init, headers: { Authorization: `Bearer ${accessToken}`, ...(init.headers ?? {}) }, cache: "no-store" });
  if (!response.ok) throw new Error(`Amadeus request failed (${response.status}).`);
  return response.json() as Promise<unknown>;
}

export async function getAccessToken() {
  if (token && token.expiresAt > Date.now() + 30_000) return token.value;
  const config = getAmadeusConfig();
  const response = await fetch(`${config.baseUrl}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: config.clientId, client_secret: config.clientSecret }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Amadeus authentication failed (${response.status}).`);
  const payload = await response.json() as { access_token?: unknown; expires_in?: unknown };
  if (typeof payload.access_token !== "string") throw new Error("Amadeus authentication returned no access token.");
  token = { value: payload.access_token, expiresAt: Date.now() + (typeof payload.expires_in === "number" ? payload.expires_in * 1000 : 1_500_000) };
  return token.value;
}

export async function searchFlightOffers(request: CompareRequest): Promise<unknown[]> {
  const parameters = new URLSearchParams({ originLocationCode: request.origin, destinationLocationCode: request.destination, departureDate: request.departureDate, adults: String(request.adults), max: "30" });
  if (request.returnDate) parameters.set("returnDate", request.returnDate);
  const result = await amadeusFetch(`/v2/shopping/flight-offers?${parameters}`);
  return isDataArray(result) ? result.data : [];
}

export async function priceFlightOffer(offer: unknown): Promise<unknown> {
  const result = await amadeusFetch("/v1/shopping/flight-offers/pricing?include=detailed-fare-rules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: { type: "flight-offers-pricing", flightOffers: [offer] } }) });
  if (isRecord(result) && isRecord(result.data) && Array.isArray(result.data.flightOffers)) return attachDetailedFareRules(result.data.flightOffers[0] ?? offer, result.included);
  if (isDataArray(result) && result.data[0]) return result.data[0];
  return offer;
}

/** Adds price-response detailed fare rules to the offer without changing its confirmed fields. */
export function attachDetailedFareRules(offer: unknown, included: unknown): unknown {
  if (!isRecord(offer) || !isRecord(included) || !Array.isArray(included["detailed-fare-rules"])) return offer;
  return { ...offer, detailedFareRules: included["detailed-fare-rules"] };
}

export async function fetchComparableOffers(request: CompareRequest): Promise<{ offers: unknown[]; dataMode: DataMode; pricingWarnings: string[] }> {
  const dataMode = getDataMode();
  if (dataMode === "fixture") return { offers: fixtureFlightOffers as unknown as unknown[], dataMode, pricingWarnings: ["Fixture mode is active. These are deterministic demo offers, not live inventory."] };
  const found = searchFlightOffers(request);
  const pricingWarnings: string[] = [];
  const candidates = shortlistOffers(normalizeOffers(await found));
  const priced = await Promise.all(candidates.slice(0, 4).map(async (offer) => {
    try { return await priceFlightOffer(offer); } catch { pricingWarnings.push("Some offers could not be price-confirmed; shown fields remain search-response data."); return offer; }
  }));
  return { offers: priced, dataMode, pricingWarnings };
}

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null; }
function isDataArray(value: unknown): value is { data: unknown[] } { return isRecord(value) && Array.isArray(value.data); }
