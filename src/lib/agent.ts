import "server-only";

import OpenAI from "openai";
import { z } from "zod";

import { getAgentConfig } from "@/lib/env";
import type { AgentAnalysis, CompareRequest, NormalizedOffer, PolicyCitation } from "@/lib/types";

const analysisSchema = z.object({
  recommendedOfferId: z.string(),
  recommendation: z.string().min(1),
  offerTradeoffs: z.array(z.object({ offerId: z.string(), summary: z.string().min(1) })),
  policyGuidance: z.array(z.object({ title: z.string().min(1), url: z.string().url(), summary: z.string().min(1) })),
  uncertainties: z.array(z.string().min(1)),
});

const responseFormat = {
  type: "json_schema" as const,
  name: "flight_offer_analysis",
  strict: true,
  schema: {
    type: "object", additionalProperties: false,
    required: ["recommendedOfferId", "recommendation", "offerTradeoffs", "policyGuidance", "uncertainties"],
    properties: {
      recommendedOfferId: { type: "string" },
      recommendation: { type: "string" },
      offerTradeoffs: { type: "array", items: { type: "object", additionalProperties: false, required: ["offerId", "summary"], properties: { offerId: { type: "string" }, summary: { type: "string" } } } },
      policyGuidance: { type: "array", items: { type: "object", additionalProperties: false, required: ["title", "url", "summary"], properties: { title: { type: "string" }, url: { type: "string" }, summary: { type: "string" } } } },
      uncertainties: { type: "array", items: { type: "string" } },
    },
  },
};

export async function analyzeOffers(request: CompareRequest, offers: NormalizedOffer[]): Promise<AgentAnalysis> {
  const config = getAgentConfig();
  const client = new OpenAI({ apiKey: config.apiKey });
  const response = await client.responses.create({
    model: config.model,
    input: buildPrompt(request, offers),
    tools: [{
      type: "mcp",
      server_label: "sanity-context",
      server_url: config.mcpUrl,
      authorization: config.mcpToken,
      allowed_tools: ["initial_context", "knowledge_base_read"],
      require_approval: "never",
    }],
    tool_choice: { type: "allowed_tools", mode: "required", tools: [{ type: "mcp", server_label: "sanity-context" }] },
    text: { format: responseFormat, verbosity: "low" },
  });
  const retrievedUrls = new Set(extractRetrievedUrls(response.output));
  const didReadKnowledgeBase = response.output.some((item) => item.type === "mcp_call" && item.name === "knowledge_base_read" && item.status === "completed");
  if (!didReadKnowledgeBase || !retrievedUrls.size) throw new Error("Sanity Knowledge Base retrieval did not return citable sources.");
  const parsed = analysisSchema.parse(JSON.parse(response.output_text));
  const offerIds = new Set(offers.map((offer) => offer.id));
  if (!offerIds.has(parsed.recommendedOfferId)) throw new Error("Agent selected an offer that was not returned by Amadeus.");
  const policyGuidance: PolicyCitation[] = parsed.policyGuidance
    .filter((citation) => retrievedUrls.has(citation.url))
    .map((citation) => ({ ...citation, source: "general_policy_guidance" }));
  if (!policyGuidance.length) throw new Error("Agent returned no citations from Sanity Knowledge Base retrieval.");
  return { ...parsed, policyGuidance };
}

function buildPrompt(request: CompareRequest, offers: NormalizedOffer[]) {
  return `You are a flight-offer expert. First call initial_context, then use knowledge_base_read to retrieve relevant fare, checked-baggage, refund, or change-policy guidance. Compare only the confirmed Amadeus offer data in the JSON below. General policy guidance must never be stated as applying to a particular ticket unless the confirmed offer explicitly supports it. Mention missing or ambiguous data. Do not discuss visas, immigration, health, or legal advice. Cite only source URLs returned by the Knowledge Base tool output. Return the required JSON object.\n\nTraveler request:\n${JSON.stringify(request)}\n\nConfirmed offer data from Amadeus:\n${JSON.stringify(offers)}`;
}

function extractRetrievedUrls(output: unknown[]): string[] {
  const urls = new Set<string>();
  for (const item of output) {
    if (!isRecord(item) || item.type !== "mcp_call" || typeof item.output !== "string") continue;
    for (const match of item.output.matchAll(/https?:\/\/[^\s"'<>\\]+/g)) {
      try { urls.add(new URL(match[0].replace(/[),.;]+$/, "")).toString()); } catch { /* ignore malformed values */ }
    }
  }
  return [...urls];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
