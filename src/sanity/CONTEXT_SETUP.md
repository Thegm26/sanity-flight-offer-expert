# Sanity Context Knowledge Base setup

This project deliberately gives the flight-analysis agent access only to a Sanity Knowledge Base through Context MCP. It must not receive direct project, Content Lake, or broad organization MCP access.

Recommended Knowledge Base purpose: provide reviewed, cited general travel-policy context that helps explain a flight offer without replacing offer-specific baggage, fare, change, or refund data from Amadeus.

1. In Sanity Manage, enable **Context** for the organization and create a Knowledge Base sourced from this project's `production` dataset.
2. Configure the Knowledge Base document selection with the projection exported as `FLIGHT_KNOWLEDGE_BASE_GROQ` in `knowledge-base.ts`. It includes only published articles, glossary terms, airlines, and airports, plus their official citation URLs and minimal references.
3. Create an organization Context token with the **Context Viewer** role. Do not use a project API token for this purpose.
4. Set `SANITY_CONTEXT_MCP_URL` and `SANITY_CONTEXT_TOKEN` only in the server environment. The app's OpenAI integration already restricts the remote MCP server to `initial_context` and `knowledge_base_read`.
5. Set `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET=production` for the embedded Studio. These values identify public content and are safe in browser code; no write token is used by the Studio configuration.

The seed content is intentionally non-authoritative: it points people to official sites and makes no baggage allowance, fee, refund, or change entitlement claims. Replace it with reviewed source-specific content before relying on it in recommendations.
