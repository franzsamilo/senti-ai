import { NextRequest, NextResponse } from "next/server";

interface SongRequest {
  title: string;
  artist: string;
  requestCount: number;
  firstRequested: string; // ISO timestamp
  lastRequested: string; // ISO timestamp
}

// In-memory store — keyed by `request:{title_lowercase}:{artist_lowercase}`
const requestStore = new Map<string, SongRequest>();

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { title, artist } = body as Record<string, unknown>;

  // Validate presence and type
  if (typeof title !== "string" || typeof artist !== "string") {
    return NextResponse.json(
      { error: "Both title and artist must be strings" },
      { status: 400 }
    );
  }

  const trimmedTitle = title.trim();
  const trimmedArtist = artist.trim();

  // Validate non-empty
  if (!trimmedTitle || !trimmedArtist) {
    return NextResponse.json(
      { error: "Both title and artist must be non-empty" },
      { status: 400 }
    );
  }

  // Validate max length
  if (trimmedTitle.length > 100 || trimmedArtist.length > 100) {
    return NextResponse.json(
      { error: "Title and artist must each be 100 characters or fewer" },
      { status: 400 }
    );
  }

  const key = `request:${trimmedTitle.toLowerCase()}:${trimmedArtist.toLowerCase()}`;
  const now = new Date().toISOString();

  const existing = requestStore.get(key);
  if (existing) {
    existing.requestCount += 1;
    existing.lastRequested = now;
    requestStore.set(key, existing);
    return NextResponse.json({ success: true, requestCount: existing.requestCount });
  }

  const newRequest: SongRequest = {
    title: trimmedTitle,
    artist: trimmedArtist,
    requestCount: 1,
    firstRequested: now,
    lastRequested: now,
  };
  requestStore.set(key, newRequest);

  return NextResponse.json({ success: true, requestCount: 1 });
}

export async function GET() {
  const all = Array.from(requestStore.values()).sort(
    (a, b) => b.requestCount - a.requestCount
  );
  return NextResponse.json({ requests: all });
}
