export interface SpotifyTrack {
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
}

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SCOPES = "user-top-read";

// ─── PKCE helpers ────────────────────────────────────────────────────────────

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generateCodeVerifier(): string {
  const buffer = new Uint8Array(64);
  crypto.getRandomValues(buffer);
  return base64urlEncode(buffer.buffer);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoded = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return base64urlEncode(digest);
}

// ─── OAuth flow ───────────────────────────────────────────────────────────────

export async function initiateSpotifyAuth(): Promise<void> {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error("Missing Spotify env vars: NEXT_PUBLIC_SPOTIFY_CLIENT_ID or NEXT_PUBLIC_SPOTIFY_REDIRECT_URI");
    return;
  }

  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  sessionStorage.setItem("spotify_code_verifier", verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    code_challenge_method: "S256",
    code_challenge: challenge,
    scope: SCOPES,
  });

  window.location.href = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<string | null> {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
  const verifier = sessionStorage.getItem("spotify_code_verifier");

  if (!clientId || !redirectUri || !verifier) {
    console.error("Missing clientId, redirectUri, or code verifier for token exchange");
    return null;
  }

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  try {
    const res = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      console.error("Token exchange failed:", await res.text());
      return null;
    }

    const data = await res.json();
    sessionStorage.removeItem("spotify_code_verifier");
    return data.access_token as string;
  } catch (err) {
    console.error("Token exchange error:", err);
    return null;
  }
}

// ─── Track fetching ───────────────────────────────────────────────────────────

async function fetchTracks(token: string, timeRange: string): Promise<SpotifyTrack[]> {
  const res = await fetch(
    `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=30`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    console.error(`fetchTracks (${timeRange}) failed:`, res.status);
    return [];
  }

  const data = await res.json();
  return (data.items ?? []) as SpotifyTrack[];
}

export async function fetchTopTracks(token: string): Promise<SpotifyTrack[]> {
  const shortTerm = await fetchTracks(token, "short_term");
  if (shortTerm.length >= 5) return shortTerm;

  // Fall back to medium_term if short_term is sparse
  const mediumTerm = await fetchTracks(token, "medium_term");
  return mediumTerm;
}
