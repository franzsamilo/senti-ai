import { NextRequest, NextResponse } from "next/server";
import { UserProfile } from "@/lib/types";

export interface BarkadaMember {
  nickname: string;
  profile: UserProfile;
}

interface BarkadaGroup {
  members: BarkadaMember[];
  createdAt: number;
}

// In-memory store — survives the process lifetime (single serverless instance)
const groups = new Map<string, BarkadaGroup>();

const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_MEMBERS = 10;

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function cleanup() {
  const now = Date.now();
  for (const [id, group] of groups) {
    if (now - group.createdAt > TTL_MS) {
      groups.delete(id);
    }
  }
}

export async function GET(req: NextRequest) {
  cleanup();

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const group = groups.get(id);
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  return NextResponse.json({ members: group.members });
}

export async function POST(req: NextRequest) {
  cleanup();

  const body = await req.json();
  const { action } = body as { action: string };

  if (action === "create") {
    const { member } = body as { member: BarkadaMember };
    if (!member?.nickname || !member?.profile) {
      return NextResponse.json({ error: "Invalid member data" }, { status: 400 });
    }

    let id = generateId();
    // Ensure uniqueness (collision is extremely unlikely but guard anyway)
    while (groups.has(id)) {
      id = generateId();
    }

    groups.set(id, {
      members: [member],
      createdAt: Date.now(),
    });

    return NextResponse.json({ id });
  }

  if (action === "join") {
    const { id, member } = body as { id: string; member: BarkadaMember };
    if (!id || !member?.nickname || !member?.profile) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const group = groups.get(id);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (group.members.length >= MAX_MEMBERS) {
      return NextResponse.json(
        { error: "Group is full (max 10 members)" },
        { status: 409 }
      );
    }

    group.members.push(member);
    return NextResponse.json({ success: true, members: group.members });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
