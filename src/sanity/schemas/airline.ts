import { defineField, defineType } from "sanity";

import { reviewFields, sourceUrlField } from "./shared";

export const airlineType = defineType({
  name: "airline",
  title: "Airline",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (Rule) => Rule.required().min(2) }),
    defineField({ name: "iataCode", title: "IATA code", type: "string", validation: (Rule) => Rule.required().uppercase().regex(/^[A-Z0-9]{2}$/, "Use a two-character IATA code.") }),
    defineField({ name: "icaoCode", title: "ICAO code", type: "string", validation: (Rule) => Rule.uppercase().regex(/^[A-Z]{3}$/, "Use a three-character ICAO code.") }),
    defineField({ name: "officialWebsite", type: "url", validation: (Rule) => Rule.required().uri({ scheme: ["https"] }) }),
    defineField({ name: "summary", type: "text", rows: 3, validation: (Rule) => Rule.required().min(20).max(500) }),
    sourceUrlField,
    defineField({ name: "relatedAirports", title: "Related airports", type: "array", of: [{ type: "reference", to: [{ type: "airport" }] }] }),
    ...reviewFields,
  ],
  preview: { select: { title: "name", subtitle: "iataCode", status: "status" }, prepare: ({ title, subtitle, status }) => ({ title, subtitle: `${subtitle ?? "No IATA code"} · ${status ?? "draft"}` }) },
});
