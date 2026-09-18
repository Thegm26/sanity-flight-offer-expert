import { defineField } from "sanity";

export const locales = [
  { title: "English", value: "en" },
  { title: "French", value: "fr" },
  { title: "Spanish", value: "es" },
  { title: "Turkish", value: "tr" },
];

export const editorialStatuses = [
  { title: "Draft", value: "draft" },
  { title: "Reviewed", value: "reviewed" },
  { title: "Published", value: "published" },
  { title: "Archived", value: "archived" },
];

export const policyTopics = [
  { title: "Checked baggage", value: "checked_baggage" },
  { title: "Cabin baggage", value: "cabin_baggage" },
  { title: "Changes", value: "changes" },
  { title: "Refunds", value: "refunds" },
  { title: "Fare brands", value: "fare_brand" },
  { title: "General fare guidance", value: "general_fare_guidance" },
];

export const sourceUrlField = defineField({
  name: "sourceUrl",
  title: "Official source URL",
  type: "url",
  description: "Use the official airline, airport, or regulator page that supports this entry.",
  validation: (Rule) => Rule.required().uri({ scheme: ["https"] }),
});

export const reviewFields = [
  defineField({ name: "locale", type: "string", initialValue: "en", options: { list: locales }, validation: (Rule) => Rule.required() }),
  defineField({ name: "status", type: "string", initialValue: "draft", options: { list: editorialStatuses, layout: "radio" }, validation: (Rule) => Rule.required() }),
  defineField({ name: "reviewedAt", title: "Reviewed at", type: "datetime", validation: (Rule) => Rule.required() }),
];
