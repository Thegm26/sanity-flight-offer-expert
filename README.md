# Flight Offer Expert

Flight Offer Expert compares a small set of Amadeus flight offers and explains
their tradeoffs with reviewed airline-policy context from a Sanity Knowledge
Base. It is a fare-clarity demo: it does not book travel, collect passenger
data, or process payments.

## Architecture

```text
Browser → POST /api/compare → Amadeus Flight Offers Search + Price
                                  ↓
                         normalized confirmed offer facts
                                  ↓
OpenAI Responses API ← Sanity Context MCP ← Sanity Knowledge Base
                                  ↓
              cited general policy guidance + safe comparison response
```

The server marks Amadeus fields as **confirmed offer data**. Sanity material is
always marked **general policy guidance**. If OpenAI or Context retrieval is
unavailable, the API still returns usable offer facts with `degraded: true`; it
does not invent policy conclusions.

## Requirements and local run

- Node.js 22 or later
- npm
- A Sanity project for Studio and Knowledge Base work (optional for fixture mode)
- Amadeus and OpenAI credentials only for live, AI-enriched comparisons

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The embedded Studio is at
[http://localhost:3000/studio](http://localhost:3000/studio) once its public
project settings are configured.

Run checks with:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Modes and environment

Start in deterministic demo mode; no external credentials are needed:

```dotenv
APP_DATA_MODE=fixture
```

Fixture responses are intentionally labelled as demo data and are never live
inventory. They are sanitized test data used for the UI and automated tests.

To query Amadeus, set `APP_DATA_MODE=live` and configure the following in your
host or untracked `.env.local`. Do not commit tokens or credentials.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project identifier used by the embedded Studio. |
| `NEXT_PUBLIC_SANITY_DATASET` | Studio dataset, normally `production`. |
| `SANITY_ORGANIZATION_ID` | Sanity organization reference for operational setup. |
| `SANITY_CONTEXT_MCP_URL` | Remote Context MCP endpoint for the Knowledge Base. |
| `SANITY_CONTEXT_TOKEN` | Organization Context Viewer token; server-only. |
| `AMADEUS_CLIENT_ID` | Amadeus Self-Service client ID; server-only. |
| `AMADEUS_CLIENT_SECRET` | Amadeus Self-Service client secret; server-only. |
| `AMADEUS_BASE_URL` | `https://test.api.amadeus.com` for test mode, or the authorized production endpoint. |
| `OPENAI_API_KEY` | Responses API key; server-only. |
| `OPENAI_MODEL` | Optional model override; defaults to `gpt-5.6-terra`. |

The API returns a safe degraded response when the OpenAI/Sanity variables are
absent, rather than failing a fixture or Amadeus comparison. Live Amadeus mode
does require both Amadeus credentials.

## Sanity Studio and Knowledge Base

1. Create or select a Sanity project and set its public project ID and dataset
   in `.env.local`.
2. Sign in with `npx sanity login`, then use `npm run sanity:seed` to import the
   reviewed starter documents. The command uses `--replace`; use a dedicated
   empty dataset or review its effect before running it against existing data.
3. Start the app and review/edit the documents in `/studio`. Keep only
   published, reviewed entries with official source URLs.
4. Enable Sanity Context for the organization, create a Knowledge Base from
   this dataset, and configure its document projection and Context token as
   described in [the Context setup guide](src/sanity/CONTEXT_SETUP.md).
5. Set `SANITY_CONTEXT_MCP_URL` and `SANITY_CONTEXT_TOKEN` in the deployment
   environment. The token must be an organization token with the **Context
   Viewer** role, not a project API token.

The remote MCP integration is intentionally restricted to `initial_context`
and `knowledge_base_read`; the agent has no direct Content Lake or broad
organization access.

## Amadeus and OpenAI setup

Create an Amadeus Self-Service developer application and begin with the test
environment. Test inventory is limited and mutable, so use fixture mode for a
repeatable demo. In live mode, the service searches offers and requests pricing
with detailed fare rules for shortlisted options. It does not expose Amadeus
credentials to the browser.

Create an OpenAI API key with access to the configured model. The server uses
the Responses API and requires a successful Sanity Knowledge Base read before
returning AI policy guidance and citations. If that retrieval cannot be
verified, the comparison deliberately falls back to confirmed offer facts only.

## API

`POST /api/compare`

```json
{
  "origin": "CDG",
  "destination": "IST",
  "departureDate": "2026-11-12",
  "returnDate": "2026-11-18",
  "adults": 1,
  "checkedBag": "required",
  "flexibility": "balanced"
}
```

`returnDate` is optional. `checkedBag` is `required` or `not_required`;
`flexibility` is `lowest_price`, `balanced`, or `change_flexibility`. Invalid
requests return `400`. Successful responses include up to four normalized
offers, `dataMode` (`fixture` or `live`), labels for confirmed facts and policy
guidance, uncertainties, a purchase-verification disclaimer, and either an
`analysis` object or `degraded: true`.

## Accuracy rules

- General airline policy is never presented as a ticket-specific entitlement
  unless offer-level Amadeus data supports it.
- Cabin-bag data is not assumed: the Self-Service offers API does not supply it.
- Missing, incomplete, unpriced, or ambiguous fare information is surfaced as
  uncertainty.
- Policy citations must originate from the configured Sanity Knowledge Base.
- Prices, baggage, changes, refunds, and final conditions must be verified with
  the airline or seller before purchase.

## Deploy and submission

Deploy to Vercel (or another Node 22-capable host), add the same environment
variables there, and keep `APP_DATA_MODE=fixture` for a dependable public demo
until live credentials and inventory have been validated. Never expose secret
values in client-side variables, screenshots, logs, or a public transcript.

Before the Sanity Challenge submission, verify:

- A public demo or walkthrough video works.
- The repository and DEV post link to the deployed app.
- The post explains the Knowledge Base sources, Context MCP tools, and why
  Sanity is essential to the comparison.
- The post includes the Sanity project ID or a public dataset URL, setup/test
  instructions, and the required `#sanitychallenge` tag.
- Demo screenshots clearly distinguish fixtures from live data, confirmed offer
  data from general policy guidance, and all uncertainties.
