import { defineField, defineType } from "sanity";

import { policyTopics, reviewFields, sourceUrlField } from "./shared";

export const glossaryTermType = defineType({
  name: "glossaryTerm",
  title: "Glossary term",
  type: "document",
  fields: [
    defineField({ name: "term", type: "string", validation: (Rule) => Rule.required().min(2).max(80) }),
    defineField({ name: "slug", type: "slug", options: { source: "term", maxLength: 80 }, validation: (Rule) => Rule.required() }),
    defineField({ name: "definition", type: "text", rows: 4, validation: (Rule) => Rule.required().min(20).max(600) }),
    defineField({ name: "topic", type: "string", options: { list: policyTopics }, validation: (Rule) => Rule.required() }),
    defineField({ name: "relatedAirlines", title: "Related airlines", type: "array", of: [{ type: "reference", to: [{ type: "airline" }] }] }),
    defineField({ name: "relatedPolicies", title: "Related policy articles", type: "array", of: [{ type: "reference", to: [{ type: "policyArticle" }] }] }),
    sourceUrlField,
    ...reviewFields,
  ],
  preview: { select: { title: "term", subtitle: "topic", status: "status" }, prepare: ({ title, subtitle, status }) => ({ title, subtitle: [subtitle, status].filter(Boolean).join(" · ") }) },
});
