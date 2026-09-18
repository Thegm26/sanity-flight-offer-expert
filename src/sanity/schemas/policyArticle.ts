import { defineArrayMember, defineField, defineType } from "sanity";

import { policyTopics, reviewFields, sourceUrlField } from "./shared";

export const policyArticleType = defineType({
  name: "policyArticle",
  title: "Policy article",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (Rule) => Rule.required().min(8).max(140) }),
    defineField({ name: "slug", type: "slug", options: { source: "title", maxLength: 96 }, validation: (Rule) => Rule.required() }),
    defineField({ name: "summary", type: "text", rows: 4, description: "A concise, evidence-backed summary. Do not make offer-specific promises.", validation: (Rule) => Rule.required().min(30).max(700) }),
    defineField({ name: "topic", type: "string", options: { list: policyTopics }, validation: (Rule) => Rule.required() }),
    defineField({ name: "airline", type: "reference", to: [{ type: "airline" }] }),
    defineField({ name: "airports", type: "array", of: [{ type: "reference", to: [{ type: "airport" }] }] }),
    defineField({ name: "body", type: "array", of: [defineArrayMember({ type: "block", styles: [{ title: "Normal", value: "normal" }, { title: "Heading 2", value: "h2" }], marks: { decorators: [{ title: "Strong", value: "strong" }, { title: "Emphasis", value: "em" }], annotations: [{ name: "link", type: "object", fields: [{ name: "href", type: "url", validation: (Rule) => Rule.uri({ scheme: ["https"] }) }] }] } })], validation: (Rule) => Rule.required().min(1) }),
    sourceUrlField,
    defineField({ name: "sourceTitle", type: "string", validation: (Rule) => Rule.required().min(3).max(160) }),
    ...reviewFields,
  ],
  preview: { select: { title: "title", topic: "topic", status: "status", airline: "airline.name" }, prepare: ({ title, topic, status, airline }) => ({ title, subtitle: [airline, topic, status].filter(Boolean).join(" · ") }) },
});
