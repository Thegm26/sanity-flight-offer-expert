import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/agent", () => ({ analyzeOffers: vi.fn() }));
import { analyzeOffers } from "@/lib/agent";
import { compareFlightOffers } from "@/lib/compare";

const request = { origin: "CDG", destination: "IST", departureDate: "2026-11-12", adults: 1, checkedBag: "required" as const, flexibility: "balanced" as const };

afterEach(() => { delete process.env.APP_DATA_MODE; vi.resetAllMocks(); });

describe("comparison fallback", () => {
  it("returns usable fixture offers and a strict degraded state when agent retrieval is unavailable", async () => {
    process.env.APP_DATA_MODE = "fixture";
    vi.mocked(analyzeOffers).mockRejectedValue(new Error("Sanity Context MCP is unavailable."));
    const result = await compareFlightOffers(request);
    expect(result).toMatchObject({ dataMode: "fixture", degraded: true, analysis: null, confirmedFactsLabel: "Confirmed offer data (Amadeus)" });
    expect(result.offers.length).toBeGreaterThan(1);
    expect(result.uncertainties.join(" ")).toContain("Sanity Context MCP");
    expect(result.disclaimer).toContain("Verify");
  });
});
