import { NextRequest, NextResponse } from "next/server";
import { getAnalytics } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || key !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(getAnalytics());
}
