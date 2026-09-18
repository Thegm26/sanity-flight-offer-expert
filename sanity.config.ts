import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { dataset, projectId } from "./src/sanity/env";
import { deskStructure } from "./src/sanity/structure";
import { schemaTypes } from "./src/sanity/schemaTypes";

export default defineConfig({
  name: "flight-offer-expert",
  title: "Flight Offer Expert Knowledge Base",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool({ structure: deskStructure })],
  schema: { types: schemaTypes },
});
