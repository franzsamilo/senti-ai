# UPDATE2.md — Handling Unknown / Unmapped Songs

## The Problem

When a user picks songs not in our database (via Spotify import or manual input), we currently default to `painIndex: 5.5` and `mood: "unknown"`. This is lazy and produces weaker roasts because the AI has no emotional context for those songs.

## The Solution: A Two-Layer Classification System

### Layer 1: Batch Claude Classification (Cheap + Fast)

When the user submits their final song list and any songs are unmatched against the database, make a **single lightweight Claude API call** to classify them BEFORE the main roast call. This is a separate, tiny call — fast and cheap.

#### API Route

Create `/api/classify-songs` as a new Next.js API route.

#### When To Trigger

In the analysis flow, right after the user finalizes their song list (Step 1) and before the loading screen (Step 6). This call can happen silently in the background while the user is still picking MBTI/attachment/etc — by the time they finish all 5 steps, the classification is already done.

#### Request

Send only the unmatched songs:

```typescript
// Filter out songs already in our database
const unmatchedSongs = selectedSongs.filter(song => !songDatabase.find(
  db => db.title.toLowerCase() === song.title.toLowerCase() && 
        db.artist.toLowerCase() === song.artist.toLowerCase()
));

// Only call the API if there are unmatched songs
if (unmatchedSongs.length > 0) {
  const classified = await fetch('/api/classify-songs', {
    method: 'POST',
    body: JSON.stringify({ songs: unmatchedSongs })
  });
}
```

#### The Classification Prompt

```
You are a music mood classifier. For each song, determine its emotional mood and pain index based on the song's lyrics, themes, and general vibe.

Classify each song into exactly ONE mood from this list:
yearning, heartbreak, letting_go, kilig, toxic, denial, nostalgia, devotion, infatuation, existential, hopeless_crush, forbidden, sweet_pining, loyalty, anxiety, lost_love, adoration, warmth, obsession, belonging, tragic_hope

And assign a painIndex from 0.0 to 10.0 where:
- 0-3: Happy, warm, kilig songs
- 4-6: Bittersweet, longing, hopeful but tinged with sadness
- 7-8: Real heartbreak, nostalgia, anxiety
- 9-10: Emotional devastation, "I need therapy" tier

If you genuinely don't recognize a song, make your best guess based on the title and artist's general style. If the title itself is emotionally suggestive (e.g. "Don't Leave Me" or "Last Goodbye"), use that as a signal.

Respond ONLY with a JSON array, no markdown, no backticks:
[
  { "title": "...", "artist": "...", "mood": "...", "painIndex": 0.0 }
]

Songs to classify:
```

#### Response Handling

```typescript
interface ClassifiedSong {
  title: string;
  artist: string;
  mood: string;
  painIndex: number;
}
```

- Parse the JSON response
- Merge the classified songs back into the user's song list, replacing the default values
- These enriched songs are then passed to the main `/api/analyze` roast call with full mood + pain data

#### Cost

This call uses a very short prompt and expects a tiny JSON response. With Sonnet, it should cost well under $0.01 per call — effectively free. It also does NOT count toward the user's 2-analysis rate limit since it's a classification helper, not a roast.

#### Caching

To avoid re-classifying the same songs repeatedly across different users:

- Maintain a server-side classification cache (in-memory object or Vercel KV)
- Key: `classify:{title_lowercase}:{artist_lowercase}`
- Value: `{ mood, painIndex }`
- Before calling Claude, check the cache for each unmatched song
- After getting results, write new classifications to the cache
- This means if 100 people all have "Glimpse of Us" by Joji but it somehow isn't in our database, only the first person triggers a Claude call — everyone else gets the cached result

```typescript
// Pseudocode
const uncached = unmatchedSongs.filter(s => !classificationCache.has(cacheKey(s)));
if (uncached.length > 0) {
  const results = await classifySongs(uncached); // Claude API call
  results.forEach(r => classificationCache.set(cacheKey(r), r));
}
const enriched = unmatchedSongs.map(s => classificationCache.get(cacheKey(s)) || s);
```

### Layer 2: Spotify Audio Data as Fallback Signal (If Available)

Spotify's audio features API (`/v1/audio-features`) is restricted for new apps created after November 2024. However, IF the app gets approved for access (or if you registered your Spotify app before that date), you can use Spotify's `valence` score as a secondary signal.

#### How Valence Maps to Pain Index

```typescript
function valenceToPainIndex(valence: number): number {
  // valence: 0.0 (sad/angry) to 1.0 (happy/euphoric)
  // painIndex: 0.0 (no pain) to 10.0 (maximum suffering)
  // Inverse relationship with some curve
  return Math.round((1 - valence) * 10 * 10) / 10;
}
```

- Valence 0.1 (very sad) → Pain Index ~9.0
- Valence 0.5 (neutral) → Pain Index ~5.0
- Valence 0.9 (very happy) → Pain Index ~1.0

#### How Energy + Valence Map to Mood

```typescript
function inferMood(valence: number, energy: number): string {
  if (valence < 0.3 && energy < 0.4) return "heartbreak";
  if (valence < 0.3 && energy >= 0.4) return "toxic";
  if (valence < 0.5 && energy < 0.4) return "yearning";
  if (valence < 0.5 && energy >= 0.4) return "anxiety";
  if (valence >= 0.5 && energy < 0.5) return "sweet_pining";
  if (valence >= 0.5 && energy >= 0.5) return "kilig";
  return "unknown";
}
```

This is a rough heuristic — Claude's classification (Layer 1) will always be more accurate for mood since it understands lyrics and cultural context. Use Spotify data as a sanity check or as fallback if Claude somehow fails.

**Important:** Since this endpoint is restricted, treat it as optional. The app must work fully without it. The classification flow should be:

```
1. Check local database → match found? Use it.
2. No match → Check classification cache → cached? Use it.
3. Not cached → Call Claude to classify → cache result, use it.
4. (Optional) If Spotify audio features available → use valence as a secondary validation signal.
```

### Layer 3: Manual Input Edge Case — Completely Unknown Songs

For songs entered manually that Claude also doesn't recognize (extremely niche or made-up titles), Claude will still return its best guess based on the title alone. This is actually fine for two reasons:

1. The title itself often carries emotional weight ("Don't Leave Me Alone" is clearly sad, "Summer Love" is clearly kilig)
2. The main roast prompt already knows which songs are "unrecognized" and can roast the user for their obscure taste: *"You submitted a song literally nobody has heard of. Ang hipster mo naman. Na para bang ikaw lang ang may feelings sa mundo."*

If Claude truly can't even guess (like a song titled "XKCD123"), assign `painIndex: 5.0` and `mood: "existential"` as the ultimate default — existential covers the widest ground and 5.0 is neutral enough.

---

## Updated Flow Diagram

```
User selects songs
        │
        ▼
Match against local song database (songs.ts)
        │
  ┌─────┴─────┐
  │ Matched    │ Unmatched
  │ (use DB    │     │
  │  values)   │     ▼
  │            │ Check classification cache
  │            │     │
  │            │ ┌───┴───┐
  │            │ │Cached  │ Not cached
  │            │ │(use it)│     │
  │            │ │        │     ▼
  │            │ │        │ Claude classify call
  │            │ │        │ (tiny, cheap, fast)
  │            │ │        │     │
  │            │ │        │     ▼
  │            │ │        │ Cache the result
  │            │ │        │     │
  └────────────┴─┴────────┴─────┘
                 │
                 ▼
     All songs now have mood + painIndex
                 │
                 ▼
     User continues flow (MBTI → Attachment → etc.)
                 │
                 ▼
     Main /api/analyze roast call (with enriched song data)
```

---

## Architecture Changes

### New Files
- `src/app/api/classify-songs/route.ts` — the classification API route
- `src/lib/classifySongs.ts` — prompt builder + response parser for classification
- `src/lib/classificationCache.ts` — in-memory or KV-backed cache

### Modified Files
- `src/lib/buildPrompt.ts` — no longer needs to handle "unknown" mood songs specially, since they'll all be classified by this point
- `src/components/steps/SongInputStep.tsx` — trigger background classification when songs are confirmed
- `src/hooks/useAnalysis.ts` — add classification step between song selection and analysis

### Timing
- Fire the classification call as soon as the user confirms their song list (end of Step 1)
- It runs in the background while they pick MBTI, attachment, love language, zodiac (Steps 2-5)
- By the time they finish Step 5 and hit "Analyze," the classification is already complete
- If somehow it's still pending, show a brief extra loading step: `"Analyzing your niche music taste... respect"`
