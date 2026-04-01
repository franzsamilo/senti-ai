# UPDATE3.md — Spotify Flow Restructure + New Songs (April 2026)

## Spotify Flow Restructure

### The Problem

As of February 2026, Spotify's Developer Mode has been severely restricted:
- App owner must have **Spotify Premium**
- Only **5 users** can be allowlisted (down from 25)
- Extended quota requires a **registered business with 250K MAU** — not accessible for individual developers or portfolio projects
- `localhost` is no longer a valid redirect URI — must use `http://127.0.0.1:PORT/callback`

This means Spotify integration works for the developer + 4 friends only. It cannot be used as the public-facing primary flow.

### The Fix

Restructure the landing page and flow so **manual input is the primary experience** and Spotify is a bonus feature.

#### Updated Landing Page CTAs

Replace the current two-button layout with:

```
[Primary CTA — large, prominent, full-width]
"Start Emotional Assessment"
→ Goes directly to manual song input (Step 1)

[Secondary — smaller, below, muted styling]
"or connect Spotify for auto-import"
→ Small text beneath: "Limited to invited testers only"
```

The Spotify button should feel like a nice extra, not the main door. Most users will never use it and that's fine.

#### Updated Redirect URI

In the Spotify dashboard and `.env.local`, use:
```env
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/callback
```

**Not** `localhost` — Spotify no longer accepts it.

#### When Spotify IS Connected (for allowlisted users)

The experience stays the same: fetch top tracks, display with album art, let user pick 3-5. But add a "Switch to manual input" escape hatch in case the Spotify results don't have the right songs.

#### Portfolio Presentation

When presenting this project in your portfolio or interviews, the Spotify integration is still a flex — it demonstrates OAuth PKCE flow knowledge, API integration, and graceful degradation. Frame it as: "I built full Spotify OAuth integration but designed the app to work independently due to API access limitations — the manual input flow with AI-powered song classification ensures every user gets the full experience regardless."

---

## New Songs — fitterkarma

Fitterkarma is THE breakout OPM act of 2025-2026. 9.4M monthly Spotify listeners. Their sound blends dark folklore-inspired lyrics with catchy alt-rock — the morbid-but-fun energy is uniquely Filipino.

```typescript
{ title: "Pag-Ibig ay Kanibalismo II", artist: "fitterkarma", mood: "toxic", painIndex: 8.0 },
// Breakout mega-hit. Released Valentine's Day 2025, went #1 on Spotify PH and Billboard PH Hot 100. 
// Morbid love-as-cannibalism metaphor disguised as a singalong banger. 
// If someone has this on their list, they romanticize destructive love and think it's quirky.

{ title: "Kalapastangan", artist: "fitterkarma", mood: "existential", painIndex: 7.0 },
// Their first charting song from 2023. Dark, intense energy. Set the stage for their breakout.

{ title: "Sumpa", artist: "fitterkarma", mood: "heartbreak", painIndex: 7.5 },
// October 2025 release. Folk-influenced rock. "Sumpa" means curse — the title says it all.

{ title: "Pag-Ibig ay Kanibalismo I", artist: "fitterkarma", mood: "obsession", painIndex: 7.5 },
// The prequel. Same universe of destructive love imagery.

{ title: "Aswang sa Maynila", artist: "fitterkarma", mood: "existential", painIndex: 7.0 },
// February 2026 release. Folklore-horror meets urban Manila. Their most recent single.

{ title: "Multo, Pt. 1", artist: "fitterkarma", mood: "nostalgia", painIndex: 6.5 },
// Earlier track from their 2022 EP. "Multo" means ghost — haunted by memories.
```

### fitterkarma Roast Context (add to prompt)

```
- fitterkarma listener → the "I'm not like other Filipinos, I listen to dark music" person who is absolutely like other Filipinos because fitterkarma has 9.4M monthly listeners. They think romanticizing toxic love through folklore metaphors makes them deep. They posted "Pag-Ibig ay Kanibalismo II" on their story with a black heart emoji and thought that was a personality. They're the type to say "love is pain" unironically while ordering samgyupsal for one.
```

---

## New Songs — BTS ARIRANG (Released March 20, 2026)

BTS's comeback album literally dropped 12 days ago. This is the biggest music event of 2026 so far — 110M first-day Spotify streams, #1 Billboard 200. Filipino ARMYs are going INSANE. Not having these songs in the database would be a crime.

```typescript
{ title: "Swim", artist: "BTS", mood: "letting_go", painIndex: 6.0 },
// Lead single / title track. Lo-fi synths, comforting vibe about not comparing your pace to others.
// The "it's okay to go slow" anthem. Sounds healing but the listener is probably NOT healed.

{ title: "Merry Go Round", artist: "BTS", mood: "heartbreak", painIndex: 7.5 },
// Melancholic melodies, searching for escape from a painful routine. Kevin Parker (Tame Impala) produced.

{ title: "Please", artist: "BTS", mood: "yearning", painIndex: 8.0 },
// The title alone screams desperation. Late-album emotional gut punch.

{ title: "Into the Sun", artist: "BTS", mood: "tragic_hope", painIndex: 6.5 },
// Album closer. Anthemic, forward-looking but tinged with everything that came before.

{ title: "Normal", artist: "BTS", mood: "existential", painIndex: 6.0 },
// Reflective track about wanting normalcy after years of extraordinary pressure.

{ title: "they don't know 'bout us", artist: "BTS", mood: "devotion", painIndex: 5.0 },
// Jimin co-wrote. About the bond between BTS and ARMY. Will make fans cry instantly.

{ title: "2.0", artist: "BTS", mood: "loyalty", painIndex: 4.5 },
// About reinvention and coming back stronger. V co-wrote. Uplifting but with weight behind it.

{ title: "Body to Body", artist: "BTS", mood: "infatuation", painIndex: 4.0 },
// Opening track. More energetic and sensual. The rare BTS song that isn't about crying.

{ title: "Hooligan", artist: "BTS", mood: "toxic", painIndex: 5.5 },
// Aggressive, experimental. Clash of blades in the production. Jungkook co-wrote.

{ title: "One More Night", artist: "BTS", mood: "yearning", painIndex: 7.0 },
// The "just one more night" energy. Classic BTS emotional territory.

{ title: "Like Animals", artist: "BTS", mood: "infatuation", painIndex: 4.5 },
// Diplo produced. More primal energy. Not the usual BTS sadness.

{ title: "FYA", artist: "BTS", mood: "devotion", painIndex: 5.0 },
// "For You, ARMY" — at least that's what fans believe. Emotional dedication track.
```

### BTS ARIRANG Roast Context (add to prompt)

```
- BTS ARIRANG listener → if their list is dominated by ARIRANG tracks, they're in their "BTS is back and nothing else matters" era. They watched the Netflix comeback livestream at 3AM Manila time and cried. They have strong opinions about which track is the best and will fight you in the replies. If they picked "Merry Go Round" specifically, they're projecting their own relationship trauma onto a Kevin Parker beat. If they picked "Swim," they're telling themselves they're healing when they're really just floating. If they picked "Please," they ARE the yearning. There's no separation between them and the song anymore.
- BTS listener in general (ARIRANG + older songs combined) → "Your parasocial relationship with 7 Korean men is more stable than any actual relationship you've had. You call them by first name like you're friends. You are not friends. But honestly? They've done more for your mental health than your actual support system, and that's both beautiful and concerning."
```

---

## Other Recent/Trending Songs to Add

### Cup of Joe
Most-streamed OPM artist of 2025. "Multo" was THE #1 song on Spotify PH.

```typescript
{ title: "Multo", artist: "Cup of Joe", mood: "yearning", painIndex: 7.5 },
// THE song of 2025 in the Philippines. 500M+ streams. First OPM song to reach that milestone that fast.
// About being haunted by a past love. If this is on their list, they are NOT over it.

{ title: "Sandali", artist: "Cup of Joe", mood: "sweet_pining", painIndex: 5.5 },
{ title: "Buhay Ka Pa Naman", artist: "Cup of Joe", mood: "devotion", painIndex: 5.0 },
```

### Dionela
#10 most-streamed artist on Spotify PH 2025.

```typescript
{ title: "Sining", artist: "Dionela", mood: "adoration", painIndex: 4.0 },
{ title: "Nang Dahil Sa'yo", artist: "Dionela", mood: "devotion", painIndex: 5.0 },
```

### Any Name's Okay
Rising Filipino indie act, big streaming numbers.

```typescript
{ title: "Sige", artist: "Any Name's Okay", mood: "letting_go", painIndex: 7.0 },
{ title: "Magkabilang Mundo", artist: "Any Name's Okay", mood: "heartbreak", painIndex: 8.0 },
```

### BLACKPINK (2025 comeback)
Their DEADLINE world tour launched in 2025 and they dropped new music.

```typescript
{ title: "JUMP", artist: "BLACKPINK", mood: "infatuation", painIndex: 3.5 },
// 2025 comeback track. More hype than sad but still emotionally charged for fans.
```

### Rosé (solo — massive in PH)
"APT." was the #1 K-pop song globally in 2025.

```typescript
{ title: "number one girl", artist: "Rosé", mood: "anxiety", painIndex: 7.5 },
// From her solo album Rosie. About insecurity and needing validation. Relatable for the sawi crowd.

{ title: "toxic till the end", artist: "Rosé", mood: "toxic", painIndex: 8.0 },
// The title is the roast. If this is on their list they're self-aware about being toxic and STILL not changing.
```

### Jennie (solo)
"like JENNIE" was #5 most-streamed K-pop song globally 2025.

```typescript
{ title: "like JENNIE", artist: "Jennie", mood: "infatuation", painIndex: 3.0 },
```

---

## New Songs — sombr

American indie artist who went MEGA viral globally in 2025. "Back to Friends" charted top 5 in the Philippines, was in the Spotify PH Top 10 for 2025 Wrapped. Grammy-nominated Best New Artist. 1 billion+ streams on "Back to Friends" alone.

```typescript
{ title: "back to friends", artist: "sombr", mood: "letting_go", painIndex: 7.0 },
// THE breakout song of 2025 globally. About the melodrama of teenage love ending.
// If someone has this, they're romanticizing their situationship ending "maturely."

{ title: "undressed", artist: "sombr", mood: "yearning", painIndex: 7.5 },
// Second massive hit. Went viral alongside "back to friends" on TikTok.

{ title: "we never dated", artist: "sombr", mood: "denial", painIndex: 6.5 },
// Title says it all. The "we were never official so I can't be heartbroken" cope.

{ title: "12 to 12", artist: "sombr", mood: "heartbreak", painIndex: 7.0 },
// Upbeat arrangement masking emotional turmoil. Featured Addison Rae in the MV.

{ title: "Caroline", artist: "sombr", mood: "nostalgia", painIndex: 6.5 },
// Earlier viral hit from 2022. Bon Iver-inspired ballad that put him on the map.
```

### sombr Roast Context
```
- sombr listener → they discovered him through TikTok and now act like they've been a fan since 2021. "back to friends" is their anthem because they're stuck in the "we're better as friends" denial arc. They screenshot their Spotify listening stats for this song and post it unironically. They're 100% the type to say "we never dated" about someone they were clearly emotionally involved with for 8 months.
```

---

## New Songs — Currently on Spotify PH Daily Chart (March 2026)

These are literally charting RIGHT NOW. Pulled from kworb.net Spotify PH daily chart, March 26, 2026.

### El Manu
```typescript
{ title: "Tahanan", artist: "El Manu", mood: "belonging", painIndex: 5.0 },
// #5 on Spotify PH daily chart. 74M+ total streams. Different "Tahanan" from Adie's version.
```

### Kyle Raphael
```typescript
{ title: "Libu-Libong Buwan (Uuwian)", artist: "Kyle Raphael", mood: "devotion", painIndex: 5.5 },
// #6 on Spotify PH daily. 68M+ streams. Sweet devotion track — "a thousand moons, I'll come home to you."
```

### nicole (Filipino artist)
```typescript
{ title: "Panaginip", artist: "nicole", mood: "sweet_pining", painIndex: 5.0 },
// #7 on Spotify PH daily. 55M+ streams. "Panaginip" means dream. Dreamy pining energy.
```

### Skusta Clee & Flow G
```typescript
{ title: "Since Day One", artist: "Skusta Clee & Flow G", mood: "loyalty", painIndex: 4.0 },
// #3 on Spotify PH daily. 21M+ streams in 45 days. Filipino hip-hop loyalty anthem.
// The rapper version of "ride or die."
```

### Bruno Mars (new single)
```typescript
{ title: "Risk It All", artist: "Bruno Mars", mood: "devotion", painIndex: 5.0 },
// #4 on Spotify PH daily. Currently #1 on Billboard PH Hot 100. 18M+ streams in 28 days.
// Brand new single. Bruno is practically a Filipino national treasure at this point.
```

### Olivia Dean
```typescript
{ title: "So Easy (To Fall In Love)", artist: "Olivia Dean", mood: "kilig", painIndex: 3.0 },
// #10 on Spotify PH daily. 61M+ streams. Pure kilig energy. 
// British soul singer who's become a PH favorite.
```

### Yuridope
```typescript
{ title: "Rosas", artist: "Yuridope", mood: "adoration", painIndex: 4.0 },
// Climbing the Spotify PH chart. Filipino rapper known for romantic hip-hop.
```

### HELLMERRY
One of Billboard PH's Top Artists of 2025. Viral Filipino rapper.

```typescript
{ title: "My Day", artist: "HELLMERRY", mood: "warmth", painIndex: 3.5 },
// Biggest hit. Charted on Billboard PH Hot 100 for months. Feel-good melodic rap.

{ title: "4:AM", artist: "HELLMERRY", mood: "yearning", painIndex: 6.5 },
// Late-night vibes. Went viral on TikTok. The 4AM hour is when feelings hit different.
```

### Earl Agustin
```typescript
{ title: "Tibok", artist: "Earl Agustin", mood: "kilig", painIndex: 3.5 },
// Was #1 on Billboard PH Hot 100 for multiple weeks. "Tibok" means heartbeat.

{ title: "Dalangin", artist: "Earl Agustin", mood: "yearning", painIndex: 7.0 },
// "Dalangin" means prayer. Emotional plea track. Also charted in top 10.
```

### Dionela (expanded)
Already in update.md with 2 songs, adding more hits:

```typescript
{ title: "Marilag", artist: "Dionela", mood: "adoration", painIndex: 3.5 },
// Won R&B Song of the Year at Filipino Music Awards 2025. Was #1 on Billboard PH.
// "Marilag" means beautiful/graceful. The ultimate "you're beautiful" serenade.

{ title: "Oksihina", artist: "Dionela", mood: "devotion", painIndex: 4.5 },
// Also charted in Billboard PH top 10. "Oksihina" — she's his oxygen.
```

### Amiel Sol
```typescript
{ title: "Sa Bawat Sandali", artist: "Amiel Sol", mood: "devotion", painIndex: 5.0 },
// Was #2 on Billboard PH Hot 100. "In every moment" — sweet dedication track.
```

### Maki (expanded)
Already in the main database, adding newer hits:

```typescript
{ title: "Bughaw", artist: "Maki", mood: "sweet_pining", painIndex: 5.0 },
// Follow-up to "Dilaw." "Bughaw" means blue. Color-themed heartfelt tracks are his brand.

{ title: "Saan Man Ako Magpunta", artist: "Maki", mood: "devotion", painIndex: 5.5 },
// "Wherever I go" — carried the devotion energy from his debut album Kolorcaster.
```

### Shanti Dope
Billboard PH Top 10 Artist of 2025.

```typescript
{ title: "Amatz", artist: "Shanti Dope", mood: "existential", painIndex: 5.5 },
// Classic Shanti Dope. "Amatz" means intoxicated/high. Hazy, introspective Filipino rap.

{ title: "Norem", artist: "Shanti Dope", mood: "loyalty", painIndex: 4.5 },
// "Norem" is backwards for "Meron" (to have). Wordplay-heavy Filipino hip-hop.
```

### La Mave
Featured on Rolling Stone PH Music Forecast 2026.

```typescript
{ title: "Dominga", artist: "La Mave & Nateman", mood: "nostalgia", painIndex: 5.5 },
// Blends traditional Filipino musical elements with contemporary production.
// Charted on Billboard PH. Named after the Filipino concept of Sunday/rest day.
```

### Taylor Swift (new)
```typescript
{ title: "Opalite", artist: "Taylor Swift", mood: "yearning", painIndex: 7.0 },
// Charting in PH top 10 as of February 2026. Latest era continues.
```

---

## Updated Prompt Context for New Releases

Add this to the prompt so the AI can make timely references:

```
TIMELY CULTURAL CONTEXT (as of April 2026):

- BTS just released ARIRANG on March 20, 2026 — their first group album in nearly 4 years after military service. It's the biggest music event of the year. If someone's playlist is heavy on ARIRANG tracks, reference the comeback hype, the Netflix livestream, the fact that they probably haven't slept since March 20, and that their emotional state is "reunion euphoria mixed with 4 years of accumulated feelings."

- fitterkarma is the breakout OPM act — "Pag-Ibig ay Kanibalismo II" went from Valentine's Day release to #1 on Billboard PH. Their dark folklore-meets-alt-rock style has created a new wave of "morbid hugot." If someone listens to them, they think their taste is unique (it's not — 9.4M monthly listeners).

- Cup of Joe's "Multo" was literally THE song of 2025 in the Philippines — first OPM track to hit 500M streams that fast. If it's on someone's list, they're processing a haunting from a past relationship and calling it "vibes."

- sombr's "back to friends" went viral on TikTok, hit 1B+ streams, charted top 5 in PH. If it's on their list, they're telling themselves the situationship ending was "mutual."

- The BTS x Spotify "Swimside" event is fresh (March 23, 2026). Filipino ARMYs who couldn't attend are coping through parasocial streaming.
```

---

## "I Can't Find My Song" — Song Request System

### The Problem

Even with 200+ songs in the database and Claude classification for unknowns, some users will want to flag that their song is missing. This is also a goldmine of data for knowing what to add next.

### User-Facing Flow

On the Song Input step (Step 1), after the search field shows no autocomplete results, show a subtle prompt:

```
Can't find your song?
[Type it anyway and press Enter to add it]
or
[Request it to be added →]
```

The "Request it" link opens a tiny inline form (not a modal — keep it lightweight):

```
┌─────────────────────────────────────────┐
│ 📝 Request a song                       │
│                                         │
│ Song title: [________________]          │
│ Artist:     [________________]          │
│                                         │
│ [Submit Request]                        │
│                                         │
│ We'll consider adding it! Your song     │
│ will still work — our AI will analyze   │
│ it on the fly.                          │
└─────────────────────────────────────────┘
```

Important: make it clear that submitting a request does NOT block them. They can still add the song manually and the Claude classification system (update2.md) will handle it. The request is just feedback data.

### Storage

- Store requests in Vercel KV or Supabase
- Schema:

```typescript
interface SongRequest {
  id: string;             // auto-generated
  title: string;
  artist: string;
  requestCount: number;   // increment if same song requested multiple times
  firstRequested: string; // ISO timestamp
  lastRequested: string;  // ISO timestamp
  status: "pending" | "added" | "dismissed";
}
```

- Key: `request:{title_lowercase}:{artist_lowercase}`
- If the same song is requested again, just increment `requestCount` and update `lastRequested`
- This naturally surfaces the most-requested songs so you know what to prioritize adding

### API Route

`POST /api/song-request` — accepts title + artist, upserts into storage.

No rate limiting needed here since it's just a lightweight write with no AI call. But do basic validation (non-empty strings, max 100 chars each).

---

## Admin Analytics Dashboard

### Why

This is portfolio gold. When you present Senti.AI, being able to pull up a dashboard showing "X total analyses run, Y unique users, Z shares generated" is infinitely more impressive than just showing the app itself. It proves real usage and traction.

### Route

`/admin` — protected by a simple password or env-based auth check. Not a full auth system — just:

```typescript
// In the admin page
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
// Simple password prompt on first visit, store in sessionStorage
```

Or even simpler: check for a `?key=YOUR_SECRET` query param. This is an internal tool, not a user-facing feature.

### What to Track

Store these metrics in Vercel KV or Supabase. Increment on each relevant event via lightweight API calls from the app.

#### Core Metrics

```typescript
interface Analytics {
  // Usage
  totalAnalyses: number;          // total roast API calls made
  totalUniqueUsers: number;       // unique browser fingerprints
  totalMatchesCreated: number;    // "Challenge a Friend" links generated
  totalMatchesCompleted: number;  // both sides completed
  totalBarkadaGroups: number;     // group links created
  totalLeaderboardEntries: number;
  
  // Sharing (the virality proof)
  totalShareCardGenerated: number;   // share image was created
  totalShareTapped: number;          // user tapped a share button (IG/FB/copy/download)
  totalWebShareAPIUsed: number;      // native share sheet opened (mobile)
  totalImageDownloaded: number;      // desktop fallback download
  
  // Song data
  totalSongRequests: number;         // "I can't find my song" submissions
  topRequestedSongs: SongRequest[];  // sorted by requestCount desc
  
  // Spotify
  totalSpotifyConnects: number;      // how many people connected Spotify
  totalSpotifyFallbacks: number;     // how many fell back to manual
  
  // Rate limiting
  totalRateLimitHits: number;        // how many people hit the "'D ako bobo" screen
  
  // Engagement
  avgEmotionalDamageScore: number;   // running average across all analyses
  threatLevelDistribution: {         // what % of users get each level
    CRITICAL: number;
    SEVERE: number;
    ELEVATED: number;
    MODERATE: number;
    LOW: number;
  };
  topMBTI: Record<string, number>;            // which MBTIs are most common
  topAttachment: Record<string, number>;      // which attachment styles
  topZodiac: Record<string, number>;          // which zodiac signs
  topSongs: { title: string; artist: string; count: number }[];  // most selected songs
}
```

#### Time-Series (if using Supabase)

If using a proper database, also store timestamped events so you can show trends:

```typescript
interface AnalyticsEvent {
  id: string;
  type: "analysis" | "share" | "match_created" | "match_completed" | "barkada_created" | "rate_limit_hit" | "song_request";
  timestamp: string;
  metadata?: Record<string, any>;  // optional extra data per event type
}
```

This lets you build charts like "analyses per day" or "shares per week" on the admin dashboard.

### Dashboard UI

Same dark aesthetic as the main app but with data visualization:

- **Hero stats row:** Total Analyses | Unique Users | Shares | Matches
- **Virality funnel:** Analyses → Share Cards Generated → Shares Tapped → Match Links Created → Matches Completed (show conversion rates)
- **Charts:**
  - Analyses per day (line chart)
  - Threat level distribution (pie/donut chart)
  - MBTI distribution (bar chart)
  - Top 20 most-selected songs (horizontal bar chart)
  - Top 10 most-requested missing songs (table with request counts)
- **Song request queue:** Table of pending requests sorted by requestCount, with "Add" and "Dismiss" buttons (these would just update the status — you'd still need to manually add the song to `songs.ts` and redeploy)

### Implementation

- Use Recharts (already in the React artifact dependencies) for charts
- All data fetched from a single `/api/admin/analytics` GET endpoint
- Event tracking: fire lightweight POST calls to `/api/admin/track` from the client at key moments (analysis complete, share tapped, match created, etc.)
- Keep the tracking calls fire-and-forget (don't await them, don't block the UX)

### Portfolio Presentation

When showing this in your portfolio or an interview, open the admin dashboard and walk through:
- "Here's the total usage since launch"
- "This is the virality funnel — X% of users shared their results"
- "The most common MBTI among users is INFP (shocking no one)"
- "These are the top requested songs users want added"

Numbers tell the story better than any explanation.

---

## Optional Personal Context Input — "Ano Nangyari Sa'yo?"

### The Concept

After the zodiac step (Step 5) and before the analysis, add an **optional** step where the user can share a brief personal context about what they're going through. This makes the roast dramatically more personal and accurate — the AI can reference their actual situation instead of guessing.

### Why Optional

Not everyone wants to share. The app must work perfectly without this. It's a bonus for users who want to get absolutely destroyed with precision.

### UI — Step 5.5 (Optional, Skippable)

Insert between Zodiac (Step 5) and the Loading Screen (Step 6):

```
┌─────────────────────────────────────────────┐
│ STEP [OPTIONAL]                             │
│                                             │
│ Ano nangyari sa'yo?                         │
│ Tell us what you're going through rn.       │
│ (This makes the roast more personal.)       │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ │ e.g., "nag-break kami after 3 years"    │ │
│ │ or "MU kami for 2 years walang label"   │ │
│ │ or "crush ko yung best friend ko"      │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ 🔒 This stays between you and the AI.      │
│ Nothing is stored or shared.                │
│                                             │
│ [Skip — Analyze without context]            │
│ [Include & Analyze →]                       │
│                                             │
│ 150 characters max                          │
└─────────────────────────────────────────────┘
```

### Security & Privacy

This is sensitive data. Handle it carefully:

1. **Never store it.** The personal context is included in the Claude API prompt for that one request and then discarded. It is not written to any database, KV store, log, or analytics system.

2. **Never include it in share cards.** The AI-generated roast may reference the situation, but the raw input text itself never appears on any shareable image or public-facing output.

3. **Never include it in match/barkada results.** If the user does a match or barkada group, their personal context is only used for their own individual roast, not passed to the comparison prompt.

4. **Client-side only until the API call.** The text lives in React state, gets sent to `/api/analyze` in the request body, gets included in the Claude prompt, and is never persisted anywhere.

5. **Explicit privacy messaging.** The lock icon + "Nothing is stored or shared" text must be visible. Keep it honest — this builds trust and makes users more willing to share something real.

6. **Input sanitization.** Strip any potential PII patterns (phone numbers, emails, full names) before sending to the API. Basic regex: if the input contains something that looks like a phone number or email, strip it and replace with [redacted].

```typescript
function sanitizePersonalContext(input: string): string {
  let sanitized = input;
  // Strip phone numbers (PH format: 09XX, +63)
  sanitized = sanitized.replace(/(\+?63|0)[\d\s-]{9,12}/g, "[redacted]");
  // Strip email addresses
  sanitized = sanitized.replace(/[\w.-]+@[\w.-]+\.\w+/g, "[redacted]");
  // Strip anything that looks like a full name with @ (social media handles)
  sanitized = sanitized.replace(/@[\w.]+/g, "[redacted]");
  return sanitized.trim().slice(0, 150);
}
```

### How It's Used in the Prompt

If personal context is provided, append it to the main analysis prompt:

```
OPTIONAL PERSONAL CONTEXT (provided by the user — use this to make the roast laser-targeted):
"[sanitized user input]"

Use this context to make the behavioral predictions and final verdict specifically about their situation. Don't just repeat what they said — read between the lines and call out the patterns they can't see themselves. Be savage but never cruel about genuinely traumatic situations. If they mention a breakup, roast their coping mechanisms, not the pain itself. If they mention a crush, roast their approach (or lack thereof), not the feeling.
```

### Important Tone Note for the Prompt

Add this instruction:

```
PERSONAL CONTEXT RULES:
- If the user shares something genuinely heavy (death, abuse, serious mental health), DO NOT roast it. Acknowledge it briefly with warmth, then pivot to roasting their music taste and personality combo as usual. The app is for fun, not for causing real harm.
- If the user shares normal dating/relationship stuff (breakups, crushes, situationships, ghosting, MU drama), GO ALL IN. This is what the app is built for. Be devastatingly specific.
- Never repeat their exact words back to them. Paraphrase and reframe their situation through the lens of their MBTI + attachment + songs combo. Show them a mirror they didn't ask for.
```

### Analytics Note

While we don't store the personal context text, we CAN track:
- `totalWithPersonalContext: number` — how many users opted to include it (just a count, no content)
- This is useful for the admin dashboard to show engagement depth
