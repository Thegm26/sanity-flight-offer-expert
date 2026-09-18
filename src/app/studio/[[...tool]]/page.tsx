"use client";

import { NextStudio } from "next-sanity/studio";

import config from "../../../../sanity.config";
import { hasSanityProject } from "@/sanity/env";

export default function StudioPage() {
  if (!hasSanityProject) {
    return (
      <main style={{ fontFamily: "system-ui, sans-serif", margin: "4rem auto", maxWidth: 640, padding: "0 1.5rem" }}>
        <h1>Sanity Studio is not configured</h1>
        <p>Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> and restart the application to load the embedded Studio.</p>
      </main>
    );
  }

  return <NextStudio config={config} />;
}
