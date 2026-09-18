import { defineField, defineType } from "sanity";

import { reviewFields, sourceUrlField } from "./shared";

export const airportType = defineType({
  name: "airport",
  title: "Airport",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (Rule) => Rule.required().min(2) }),
    defineField({ name: "iataCode", title: "IATA code", type: "string", validation: (Rule) => Rule.required().uppercase().regex(/^[A-Z]{3}$/, "Use a three-letter IATA code.") }),
    defineField({ name: "city", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "country", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "officialWebsite", type: "url", validation: (Rule) => Rule.required().uri({ scheme: ["https"] }) }),
    defineField({ name: "summary", type: "text", rows: 3, validation: (Rule) => Rule.required().min(20).max(500) }),
    sourceUrlField,
    defineField({ name: "relatedAirlines", title: "Related airlines", type: "array", of: [{ type: "reference", to: [{ type: "airline" }] }] }),
    ...reviewFields,
  ],
  preview: { select: { title: "name", code: "iataCode", city: "city" }, prepare: ({ title, code, city }) => ({ title, subtitle: `${code ?? "No IATA code"} · ${city ?? ""}` }) },
});
