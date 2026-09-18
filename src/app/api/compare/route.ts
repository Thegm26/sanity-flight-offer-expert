import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { compareFlightOffers } from "@/lib/compare";
import { parseCompareRequest } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const input = parseCompareRequest(body);
    return NextResponse.json(await compareFlightOffers(input));
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Invalid comparison request.", details: error.issues }, { status: 400 });
    const message = error instanceof Error ? error.message : "Unable to compare flight offers.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
