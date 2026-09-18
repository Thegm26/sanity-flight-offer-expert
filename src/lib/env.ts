import "server-only";

import type { DataMode } from "@/lib/types";

function optional(name: string) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function getDataMode(): DataMode {
  return process.env.APP_DATA_MODE === "live" ? "live" : "fixture";
}

export function getAmadeusConfig() {
  const clientId = optional("AMADEUS_CLIENT_ID");
  const clientSecret = optional("AMADEUS_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Amadeus credentials are not configured.");
  return {
    clientId,
    clientSecret,
    baseUrl: optional("AMADEUS_BASE_URL") ?? "https://test.api.amadeus.com",
  };
}

export function getAgentConfig() {
  const apiKey = optional("OPENAI_API_KEY");
  const mcpUrl = optional("SANITY_CONTEXT_MCP_URL");
  const mcpToken = optional("SANITY_CONTEXT_TOKEN");
  if (!apiKey || !mcpUrl || !mcpToken) throw new Error("OpenAI or Sanity Context MCP credentials are not configured.");
  return { apiKey, mcpUrl, mcpToken, model: optional("OPENAI_MODEL") ?? "gpt-5.6-terra" };
}
