# Flight Offer Expert: Agent Guide

## Purpose

This repository is a portfolio/demo app that compares flight offers and explains fare tradeoffs using reviewed travel-policy content from Sanity. It does not book travel, collect passenger data, or process payments.

## Architecture and current behavior

- Next.js 15 / React 19 app; Node.js 22+ is required.
- `POST /api/compare` validates a search, gets offers, normalizes/ranks them, and optionally adds cited policy guidance.
- `APP_DATA_MODE=fixture` uses deterministic Amadeus-shaped data from `src/test-fixtures/`. The UI labels it as demo fixture data.
- The existing live adapter in `src/lib/amadeus.ts` targets the former Amadeus Self-Service API. Do not enable it without valid replacement credentials and validation.
- OpenAI Responses can call only the Sanity Context MCP tools `initial_context` and `knowledge_base_read`. If OpenAI or Context is unavailable, comparisons deliberately return confirmed offer facts with `degraded: true` instead of inventing policy conclusions.
- Embedded Sanity Studio is served at `/studio`; schemas and Knowledge Base projection live in `src/sanity/`.
- Offer facts and general policy guidance must remain visibly distinct. Never imply that general policy is a ticket-specific entitlement.

## Progress and external setup status (2026-09-19)

- Core MVP, responsive search/comparison UI, one-way/round-trip behavior, airport selectors, offer normalization, validation, degraded responses, embedded Studio, fixtures, and tests are implemented.
- Partner attribution currently reads “Powered by Amadeus + Sanity.”
- Sanity project: `npynqtsx`; dataset: `production`; organization: `osp5gh3p4`.
- The `production` dataset currently contains 11 seeded documents. Do not rerun `npm run sanity:seed` casually: it imports with `--replace`.
- Amadeus Self-Service was decommissioned on July 17, 2026. No Amadeus credentials exist for this project, so `APP_DATA_MODE` must remain `fixture`.
- Duffel is the recommended replacement flight provider, but no Duffel adapter or credentials have been implemented.
- OpenAI and Sanity Context are not fully connected: an OpenAI API key plus a Sanity Context Knowledge Base MCP endpoint/token still need to be configured and tested.
- A Sanity token was previously pasted into chat. Treat it as compromised and rotate/revoke it before deployment or further use.

## Next steps

1. Decide whether to migrate flight search from Amadeus to Duffel; if so, preserve the normalized offer contract and explicit test/demo labeling.
2. Create/configure the Sanity Context Knowledge Base from the existing `production` dataset, following `src/sanity/CONTEXT_SETUP.md`.
3. Add server-only OpenAI and Sanity Context credentials locally/deployment-side, then verify cited analysis and the degraded fallback.
4. Update outdated Amadeus setup wording and branding if the provider is replaced or the public demo remains fixture-only.
5. Deploy to a Node 22-capable host and verify the public app and `/studio` CORS origin.

## Commands

```bash
npm ci
cp .env.example .env.local
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```

Local app: `http://localhost:3000`; Studio: `http://localhost:3000/studio`.

## Environment and secret safety

- Keep local values in untracked `.env.local`; never commit API keys, bearer tokens, client secrets, or copied chat credentials.
- Only `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` are browser-safe. All provider, OpenAI, and Context credentials are server-only.
- Current safe default: `APP_DATA_MODE=fixture`.
- Relevant variables are documented in `.env.example`; leave unavailable credentials blank.
- Do not print secret values in logs, test output, screenshots, commits, issues, or final responses.

## Repository rules

- Keep changes scoped and follow existing TypeScript/React patterns; do not refactor unrelated code.
- Use the normalized types in `src/lib/types.ts` as the boundary between provider data and the UI/agent.
- Validate all request input through `src/lib/validation.ts`; do not trust browser input.
- Preserve safe degradation when external AI/context services fail.
- Policy citations must come from Sanity Knowledge Base retrieval and use official source URLs.
- Never fabricate fares, baggage allowances, change/refund rights, or live-inventory claims.
- Add focused tests for behavioral/provider changes. Before handoff, run lint, typecheck, tests, and build when practical.
- Preserve unrelated user changes. Before committing, confirm Git identity is `Thegm26 <georgios.michalakis26@gmail.com>`.
