/**
 * Narrow projection for the Sanity Context Knowledge Base. Configure this in
 * Sanity Context as the only data source exposed to the flight-analysis agent.
 * The app itself reaches Context MCP; it does not query this projection at run time.
 */
export const FLIGHT_KNOWLEDGE_BASE_GROQ = `
  *[
    _type in ["airline", "airport", "policyArticle", "glossaryTerm"] &&
    status == "published"
  ] | order(reviewedAt desc) {
    _id,
    _type,
    "title": coalesce(title, name, term),
    "summary": coalesce(summary, definition),
    "sourceUrl": sourceUrl,
    locale,
    status,
    reviewedAt,
    topic,
    iataCode,
    city,
    country,
    "airline": airline->{name, iataCode, officialWebsite},
    "airports": airports[]->{name, iataCode, city},
    "relatedAirlines": relatedAirlines[]->{name, iataCode},
    "relatedAirports": relatedAirports[]->{name, iataCode, city},
    "relatedPolicies": relatedPolicies[]->{title, slug},
    body
  }
`;
