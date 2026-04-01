import { NextRequest, NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  let body: { type: string; metadata?: Record<string, unknown> };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.type || typeof body.type !== "string") {
    return NextResponse.json({ error: "Missing event type" }, { status: 400 });
  }

  trackEvent(body.type, body.metadata);

  return NextResponse.json({ success: true });
}
