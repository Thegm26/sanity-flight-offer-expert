/**
 * Values in this module are safe to use in browser-rendered Studio code. A Sanity
 * project ID and dataset name identify public content; write tokens stay server-only.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";

export const hasSanityProject = Boolean(projectId);
