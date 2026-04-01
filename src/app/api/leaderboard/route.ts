import { NextRequest, NextResponse } from "next/server";
import type { ThreatLevel } from "@/lib/types";

export interface LeaderboardEntry {
  score: number;
  mbti: string;
  attachmentStyle: string;
  zodiac: string;
  threat_level: ThreatLevel;
  timestamp: number;
}

// In-memory store — resets on cold start, fine for this use case
const entries: LeaderboardEntry[] = [];
const MAX_ENTRIES = 100;
const TOP_ENTRIES = 50;

export async function GET() {
  const top = entries
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_ENTRIES);

  return NextResponse.json({ entries: top, total: entries.length });
}

export async function POST(req: NextRequest) {
  let body: Partial<LeaderboardEntry>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { score, mbti, attachmentStyle, zodiac, threat_level } = body;

  if (
    typeof score !== "number" ||
    typeof mbti !== "string" ||
    typeof attachmentStyle !== "string" ||
    typeof zodiac !== "string" ||
    typeof threat_level !== "string"
  ) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const validThreatLevels: ThreatLevel[] = ["CRITICAL", "SEVERE", "ELEVATED", "MODERATE", "LOW"];
  if (!validThreatLevels.includes(threat_level as ThreatLevel)) {
    return NextResponse.json({ error: "Invalid threat_level" }, { status: 400 });
  }

  const newEntry: LeaderboardEntry = {
    score,
    mbti,
    attachmentStyle,
    zodiac,
    threat_level: threat_level as ThreatLevel,
    timestamp: Date.now(),
  };

  entries.push(newEntry);

  // Sort descending, cap at MAX_ENTRIES
  entries.sort((a, b) => b.score - a.score);
  if (entries.length > MAX_ENTRIES) {
    entries.splice(MAX_ENTRIES);
  }

  // Find rank of the new entry (1-indexed)
  const rank =
    entries.findIndex(
      (e) =>
        e.score === newEntry.score &&
        e.timestamp === newEntry.timestamp
    ) + 1;

  return NextResponse.json({ entry: newEntry, rank, total: entries.length }, { status: 201 });
}
