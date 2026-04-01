# CLAUDE.md — Senti.AI

## What Is This?

**Senti.AI** is an emotional profiling web app that psychoanalyzes Filipinos based on their OPM (Original Pilipino Music) listening habits combined with their full personality profile — MBTI, Attachment Style, Love Language, and Zodiac Sign. It generates a brutally honest, funny, and devastatingly accurate roast/callout of the user's emotional patterns, dating behavior, and red flags — then makes it dead simple to share on IG/FB stories and challenge friends to take it too.

## Aesthetic & Vibe

**Visual:** Military/intelligence threat dashboard. Think NORAD situation room meets Filipino hugot culture. Dark UI, neural network animations in the background, threat-level meters, clinical step labels, glitch text effects — all in service of emotional damage.

**Tone of AI-generated content:** Brutally honest. Savage but funny. Heavy natural Taglish (Tagalog-English code-switching). Culturally hyper-specific to Filipino dating and hugot culture. Should feel like your most walang-awa na tropa who also has a psychology degree. NOT generic AI voice — see the Tone & Language Guide section for detailed prompt engineering instructions.

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** Anthropic Claude API (`claude-sonnet-4-20250514`) for generating personalized roasts
- **Auth/Music:** Spotify Web API (OAuth 2.0 PKCE flow) for pulling user's top tracks
- **Animations:** Framer Motion
- **Image Generation:** html2canvas or `@vercel/og` / satori for shareable story cards
- **Audio:** Tone.js for ambient sound design and UI sound effects
- **Rate Limiting:** Browser fingerprinting + localStorage + server-side IP check
- **Storage:** Vercel KV or Supabase for leaderboard + comparison link data
- **Deployment:** Vercel

---

## Rate Limiting System

### Why
Each analysis triggers a Claude API call which costs real money. Users get **2 free analyses** per browser. On the 3rd attempt, they're blocked with a funny message.

### Implementation
- Use browser fingerprinting (canvas fingerprint + navigator properties + screen resolution hash) combined with localStorage to track usage count per browser.
- Store a counter in localStorage keyed to the fingerprint hash.
- Also set an HTTP-only cookie as a secondary check.
- On the backend API route (`/api/analyze`), implement IP-based rate limiting as a server-side fallback using an in-memory store (or Vercel KV if available). Limit: 2 successful calls per IP per 24-hour rolling window.
- The client-side check happens first (faster UX), the server-side check is the real enforcement.

### The Block Message
When a user hits their 3rd attempt, instead of the analysis loading screen, display a full-screen cinematic block message with the same dark aesthetic:

```
🚫 ACCESS DENIED

"The creator of Senti.AI believed in second chances...

...not a third though. 'D ako bobo."

— Management

[Your emotional damage has been noted.]
[Come back tomorrow or use a different browser idc]
```

Style this with the same glitch text effect as the main title. Make it feel like a classified document redaction. The tone should be funny, not hostile — the user should screenshot it and share it because it's hilarious.

### Edge Cases
- If localStorage is cleared, the server-side IP check still enforces the limit.
- If someone uses a VPN, that's fine — they earned it. That's commitment to emotional damage.
- The 24-hour window resets server-side. Client-side, the localStorage counter resets on a new calendar day (midnight local time).
- Display a small counter somewhere subtle in the UI: "Analyses remaining: 2/2" → "1/2" → blocked.

---

## Core User Flow

### Step 0: Landing / Intro
- Dark, dramatic landing screen
- Animated neural network background (canvas-based: floating nodes connected by faint red lines, slow drift, low opacity ~0.3)
- App name **"Senti.AI"** in large display text with glitch text effect (RGB split using CSS pseudo-elements)
- Tagline: `Emotional Damage Assessment System v6.9` in monospace
- A badge/pill: `CLASSIFIED` or `THREAT LEVEL: UNKNOWN`
- Two CTAs:
  - Primary: **"Connect Spotify"** — initiates OAuth flow to pull top tracks
  - Secondary: **"Manual Input"** — skip Spotify, add songs manually
- Subtle disclaimer at bottom: `"Warning: This system is brutally honest. Proceed at your own emotional risk."`
- Show remaining analyses count: `"2 free scans remaining"`

### Step 1: Song Input (Step 01/05)
**If Spotify connected:**
- Automatically fetch user's top tracks (short_term, limit 20-30)
- Display them in a scrollable list with album art, title, artist
- User selects 3-5 songs from the list that "represent their current emotional state"
- Also allow manual additions from the built-in OPM database
- Cross-reference fetched tracks against the built-in song database for mood/pain metadata; for unmatched songs, assign default values or use the Claude API to infer mood

**If manual input:**
- Search field with autocomplete against built-in OPM song database (see Song Database section)
- Users can also type custom song titles + artist and press Enter to add
- Each added song appears as a chip/tag with artist name and a remove (×) button
- Show pain index rating next to database songs
- Display: `"{n}/5 songs added"`

**UI Details:**
- Step label in monospace: `STEP 01 / 05`
- Title: `"Your Hugot Playlist"`
- Subtitle: `"Select 3-5 songs that define your emotional state rn"`
- Suggestion dropdown: dark card below input, hover highlight, shows song title in accent color + artist in muted + pain index right-aligned

### Step 2: MBTI Selection (Step 02/05)
- 4×4 grid of all 16 MBTI types as buttons
- Highlight selected with accent border + background
- Subtitle: `"Select your personality type (or the one you identify with after 3AM)"`

### Step 3: Attachment Style (Step 03/05)
- 4 options as vertical list cards with emoji + label + funny description:
  - Anxious 😰 — `"'Bakit hindi ka nagrereply?!' energy"`
  - Avoidant 🚪 — `"'I need space' pero nagsstalk sa socmed"`
  - Disorganized 🌀 — `"Push-pull champion of the world"`
  - Secure 🧘 — `"Allegedly healthy... sus"`
- Subtitle: `"Be honest. The algorithm knows if you're lying."`

### Step 4: Love Language (Step 04/05)
- 5 options as vertical list cards with emoji:
  - Words of Affirmation 💬
  - Acts of Service 🛠️
  - Receiving Gifts 🎁
  - Quality Time ⏰
  - Physical Touch 🤗
- Subtitle: `"How do you express the love that no one asked for?"`

### Step 5: Zodiac Sign (Step 05/05)
- 4×3 grid with zodiac symbols (♈♉♊♋♌♍♎♏♐♑♒♓)
- Subtitle: `"The stars don't lie. Neither does this algorithm."`

### Step 6: Analysis Loading Screen
This is where the over-engineering shines. The loading screen IS the experience.

- Centered spinner (ring with red gradient border, spinning)
- Sequential loading messages appear one by one (~1.5-2s apart)
- Completed steps: green checkmark ✓
- Active step: red pulsing/blinking arrow ▶
- Pending steps: not yet visible (appear one at a time)

**Loading messages:**
```
✓ Initializing Emotional Damage Protocol v6.9...
✓ Scanning your Spotify wrapped for emotional damage...
✓ Cross-referencing attachment issues with zodiac toxicity index...
✓ Checking kung ilang beses mo na ni-replay yung last song...
✓ Computing probability of 'kumusta ka na?' text at 3AM...
✓ Analyzing hugot concentration per song... WARNING: lethal levels detected
✓ Calibrating delulu-to-reality ratio...
✓ Fetching data from your barkada GC... (charot)
✓ Mapping your red flags to a geographic heat map...
▶ Generating emotional damage report...
▶ Consulting the stars... they said 'yikes'
▶ Final scan complete. You're not okay, bestie.
```

**Timing:** The API call runs concurrently with the loading animation. If the API finishes before all messages display, wait for the messages to complete — the drama is non-negotiable. If the API takes longer, loop the final few messages.

### Step 7: Results Dashboard
The main payoff. Should feel like a military intelligence briefing about someone's love life.

#### Header Section
- AI-generated headline (devastating one-liner) displayed in large glitch text
- Threat level badge with color coding:
  - CRITICAL → `#ff0040` (red)
  - SEVERE → `#ff3252` (orange-red)
  - ELEVATED → `#ff8c00` (orange)
  - MODERATE → `#ffd000` (yellow)
  - LOW → `#00cc88` (green — almost never given lmao)

#### Quick Stats Row
3-4 stat boxes side by side:
- **Emotional Damage Score:** X.X / 10
- **Drunk Text Probability:** XX%
- **Ex-Stalking Frequency:** (funny text from AI)
- **Avg Pain Index:** X.X / 10 (computed from songs)

#### Threat Assessment Meters
Horizontal animated progress bars (animate from 0 → value on reveal):
- Emotional Instability
- Toxic Trait Concentration
- Delulu Index
- Sadboi/Sadgirl Rating
- Healing Progress (always ironically low)

Values should be weighted based on input combination to feel dramatic.

#### Song Diagnosis
- Card with AI's psychoanalysis of their specific song choices
- Show selected songs as small chips within the card

#### Behavioral Predictions
- 5 brutally specific predictions based on the full combo
- These are the main roast — culturally specific, funny, devastating
- Each 1-2 sentences

#### Toxic Traits + Red Flags
- Two sections or columns
- 3 toxic traits
- 3 red flags for their future jowa

#### Final Verdict
- Large card at the bottom
- AI's devastating closing statement (2-3 sentences, Taglish)
- Recommended action (absurd, e.g., "Uninstall Spotify. Touch grass. Call your lola.")
- Compatibility warning label for anyone who might date them

#### Actions (this is the most important part — see Sharing & Social section)
- **"Share to IG Story"** — primary CTA, big and prominent
- **"Share to FB Story"**
- **"Challenge a Friend"** — generates a comparison/match link
- **"Post to Leaderboard"** — submit score anonymously
- **"Run Again"** — if analyses remaining

---

## Sharing & Social Features

This is the growth engine. Every feature here is designed to get users to share results and pull friends into the app. Filipinos LOVE sharing personality test results, tagging friends, and comparing — this section capitalizes on that entirely.

### 1. Story-Ready Share Cards

The #1 priority feature. When users tap "Share to IG Story" or "Share to FB Story," generate a beautifully designed image card optimized for social media posting.

#### Card Formats
Generate **two card sizes** so the user can choose:
- **Story card (1080×1920):** Vertical, full-screen story format for IG/FB stories
- **Post card (1080×1080):** Square format for IG feed posts, FB posts, Twitter

#### Card Content (Story — 1080×1920)
```
[Top section]
SENTI.AI logo/wordmark (small, top center)
"EMOTIONAL DAMAGE REPORT" label in monospace

[Hero section]
The AI-generated headline in large bold text
Threat level badge (color-coded)

[Stats strip]
Emotional Damage: X.X/10 | Drunk Text Prob: XX% | Pain Index: X.X/10

[Main content]
2-3 of the most savage behavioral predictions
(picked automatically — choose the shortest, punchiest ones)

[Bottom section]
Final verdict quote in slightly smaller text
"—— SENTI.AI ——"
QR code linking to senti.ai OR just the URL text
Small text: "Take yours → senti.ai"
```

#### Card Content (Post — 1080×1080)
- Condensed version: headline, threat level, top 2 stats, 1-2 predictions, CTA to the app
- Must be legible at small sizes (IG feed thumbnail)

#### Card Design
- Same dark theme (#0a0a0f background) with the red accent palette
- The card should look premium and designed — not like a screenshot
- Subtle neural network pattern or noise texture in the background
- Clear visual hierarchy so it's readable even at phone-screen size
- The Senti.AI branding and URL should be visible but not overpowering — the roast content is the star

#### Implementation
- Render the card as a hidden `<div>` with fixed pixel dimensions styled with inline styles (not Tailwind, since html2canvas needs computed styles)
- Use `html2canvas` to capture it as a PNG
- Alternatively, use `@vercel/og` or `satori` on the server to generate the image via an API route (`/api/share-card`) — this is more reliable and consistent across browsers
- After generating the image:

**On mobile (primary):**
- Use the **Web Share API** (`navigator.share()`) with the image file — this opens the native share sheet so users can post directly to IG Stories, FB Stories, Messenger, WhatsApp, etc.
- This is the smoothest experience and should be the default on mobile
- Web Share API supports sharing files (images) on most modern mobile browsers

**On desktop / fallback:**
- "Download Image" button — saves the card as a PNG
- "Copy to Clipboard" button — copies the image to clipboard so they can paste into any app
- Show brief instruction text: "Download and post to your story!"

**Share flow UX:**
1. User taps "Share to IG Story" → image generates (show a brief loading state, maybe a cheeky "Packaging your emotional damage for public consumption...")
2. On mobile: native share sheet opens with the image pre-loaded → user picks IG/FB/etc
3. On desktop: image downloads automatically + a toast notification says "Downloaded! Post it to your story 🔥"

### 2. "Challenge a Friend" / Compatibility Match

This is the viral loop. After getting results, users can challenge a specific friend to take the test, and then both get a compatibility/comparison report.

#### Flow
1. User A finishes their analysis and taps **"Challenge a Friend"**
2. App generates a unique link: `senti.ai/match/[unique-id]`
3. User A shares this link via any method (copy link, share sheet, DM, etc.)
4. The share message is pre-written and copy-pasteable:
   - `"I just got psychoanalyzed by Senti.AI and my Emotional Damage Score is [X.X]/10 😭 Take yours and let's see kung sino mas sawi sa ating dalawa → senti.ai/match/abc123"`
5. User B opens the link → lands on a special version of the app that says:
   - `"[User A's first name or 'Someone'] challenged you to a Senti.AI match"`
   - `"Their threat level: [CRITICAL]. Can you beat that?"`
   - User B goes through the same full flow (songs → MBTI → attachment → love language → zodiac → analysis)
6. After User B gets their results, BOTH profiles are displayed in a **side-by-side comparison view** with an AI-generated compatibility roast

#### Comparison / Match Report
Generate a second Claude API call (counts toward User B's rate limit) that takes both profiles and generates:

```typescript
interface MatchResult {
  match_headline: string;           // "Dalawang sawi, isang universe. Charot."
  combined_threat_level: string;    // The relationship's danger rating
  compatibility_score: number;      // 0-100 (ironic — even high scores get roasted)
  who_texts_first: string;          // "Si [A] — 100%. Anxious attachment doesn't sleep."
  who_ghosts_first: string;         // "Si [B] — avoidant + Sagittarius = flight risk"
  talking_stage_duration: string;   // "8 months. Neither of you will DTR."
  biggest_red_flag_combo: string;   // The most dangerous trait overlap
  relationship_prediction: string;  // 2-3 sentences of savage fortune-telling
  song_overlap_roast: string;       // If they share songs: "Pareho kayong nakikinig ng Paubaya? Therapy for two, please."
  final_match_verdict: string;      // Devastating closing for the pair
}
```

#### Match Report UI
- **Side-by-side layout** (or stacked on mobile)
- Left: User A's key stats (score, threat level, MBTI, attachment)
- Right: User B's key stats
- Center/below: The AI-generated match analysis
- Progress bars comparing their individual metrics
- "Who wins" indicators on each stat (higher emotional damage = "wins" lol)
- **Shareable match card** — same as the individual share card but with BOTH profiles side by side (1080×1920 for stories)

#### Match Card Content (Story — 1080×1920)
```
SENTI.AI MATCH REPORT

[Left]                    [Right]
User A                    User B
INFP                      ENTJ
Anxious                   Avoidant
Score: 8.7               Score: 6.2
CRITICAL                  ELEVATED

Compatibility: 34%
"Walang forever sa inyo. Pero the talking stage will last 2 years."

Who texts first after a fight: User A (always)
Who ghosts first: User B (week 3)

Take yours → senti.ai
```

#### Storage
- Store User A's results temporarily keyed to the unique match ID
- 48-hour TTL (enough time for the friend to respond)
- Use Vercel KV or Supabase
- After User B completes, store the match result so both can revisit via the same URL

### 3. "Tag Your Barkada" Group Mode

After getting individual results, offer a **group link** that multiple friends can use.

#### Flow
1. User taps **"Create Barkada Group"**
2. App generates a group link: `senti.ai/barkada/[group-id]`
3. Anyone who opens the link and completes the flow is added to the group
4. The group page shows:
   - All members' threat levels and scores in a ranking/leaderboard
   - "Most Sawi" award (highest emotional damage)
   - "Most Delulu" award (AI picks based on profiles)
   - "Most Likely to Text Their Ex Tonight" award
   - "Healthiest (Boring)" award (lowest score, roasted for being too normal)
   - Group stats: average emotional damage, most common attachment style, etc.
5. The group page updates in real-time as more friends complete the flow

#### Group Share Card (Story — 1080×1920)
```
SENTI.AI BARKADA REPORT

🏆 Most Sawi: [Name] — 9.4/10
💀 Most Delulu: [Name]
📱 Most Likely to Drunk Text: [Name]
🧘 Healthiest (Boring): [Name]

Avg Emotional Damage: 7.8/10
Dominant Attachment: Anxious (4/6)
Barkada Threat Level: SEVERE

Who's next? → senti.ai/barkada/abc123
```

#### Storage
- Group data in Vercel KV or Supabase
- Each group stores: group ID, array of member results (name/nickname + key stats + profile data)
- 7-day TTL for groups
- Max 10 members per group

### 4. Leaderboard

#### Anonymous Emotional Damage Leaderboard
- After receiving results, users can opt to submit their Emotional Damage Score to a public leaderboard
- Data stored: score, MBTI, attachment style, zodiac, threat level, timestamp. No PII.
- Display on a separate `/leaderboard` page
- Columns: Rank, Score, MBTI, Attachment, Zodiac, Threat Level, Date
- Top 50 entries
- Highlight top 3 with gold/silver/bronze accents
- "Submit Your Score" CTA on the results page
- Show where the user's score would rank before they submit

### 5. History / Emotional Deterioration Tracker

- If a user returns and runs another analysis (on a different day after their limit resets), compare their new results with previous ones
- Show a timeline: "Your Emotional Damage Score over time" as a line chart
- "Your delulu index has increased 23% since last week. Seek help."
- Store past results in localStorage keyed to browser fingerprint
- Max 10 entries (rolling)
- Show on a `/history` page or as a collapsible section on the results page

---

## Spotify Integration

### OAuth Flow
- Use Spotify's Authorization Code with PKCE flow (no client secret needed on frontend)
- Scopes needed: `user-top-read`
- Store access token in session/memory only (not persisted)
- Create a callback route to handle the redirect

### API Endpoints Used
- `GET /v1/me/top/tracks?time_range=short_term&limit=30` — recent top tracks
- `GET /v1/me/top/tracks?time_range=medium_term&limit=30` — fallback if short_term is sparse

### Song Matching
- After fetching Spotify tracks, cross-reference against the built-in OPM database by title + artist (fuzzy match)
- Matched songs get their mood and pain index from the database
- Unmatched songs: display normally but assign a default pain index of 5.5 and mood of "unknown" — the Claude API prompt should note these as "unrecognized" so the AI can still roast creatively

### Environment Variables
```env
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

### Fallback
- If Spotify auth fails or user declines, seamlessly fall back to manual input mode
- No broken states — the app must work fully without Spotify

---

## Sound Design

Using Tone.js for ambient audio and UI feedback:

### Ambient
- Subtle low-frequency hum/drone during the analysis loading screen
- Builds slightly in intensity as more loading messages appear
- Cuts off dramatically when results appear

### UI Sounds
- Soft click/tap on button selections
- Satisfying "lock-in" sound when completing each step
- Dramatic "threat detected" alert sound when results first render
- Glitch/static sound effect on the threat level badge reveal

### Implementation Notes
- All sounds should be opt-in (muted by default, with a subtle speaker icon toggle)
- Use Tone.js synthesis (oscillators + effects) rather than audio files to keep bundle small
- Keep everything subtle — enhance the experience, don't annoy

---

## Song Database

Built-in database of 50+ popular OPM/Filipino songs with metadata.

```typescript
interface Song {
  title: string;
  artist: string;
  mood: "yearning" | "heartbreak" | "letting_go" | "kilig" | "toxic" | "denial" | "nostalgia" | "devotion" | "infatuation" | "existential" | "hopeless_crush" | "forbidden" | "sweet_pining" | "loyalty" | "anxiety" | "lost_love" | "adoration" | "warmth" | "obsession" | "belonging" | "tragic_hope";
  painIndex: number; // 0-10
}
```

### Include songs from:
- **Arthur Nery:** Pagsamo (8.5), Isa Lang (8.0), Higa, Pelikula
- **Moira Dela Torre:** Paubaya (9.8), Kumpas, Patawad, Torete
- **Ben&Ben:** Kathang Isip (8.5), Sa Susunod Na Habang Buhay (9.2), Araw-Araw (6.0), Leaves, Pagtingin
- **Juan Karlos:** Buwan (7.2), Ere (6.5), Demonyo (8.8)
- **Zack Tabudlo:** Binibini (4.5), Saan (8.2), Habang Buhay (6.0), Nangangamba (7.5), Give Me Your Forever
- **December Avenue:** Kung Di Rin Lang Ikaw ft. Moira (9.5), Eroplanong Papel (7.8), Sa Ngalan Ng Pag-ibig
- **Adie:** Tahanan (5.5), Paraluman (3.5), Daylight (3.0), Mahika ft. Janine Berdin (3.0)
- **IV of Spades:** Mundo (7.0), Come Inside of My Heart, Bawat Kaluluwa
- **SB19:** Hanggang Sa Huli (5.0), MAPA
- **Maki:** Dilaw (5.5), Saan Man Ako Magpunta
- **Dilaw:** Uhaw (4.0)
- **Cup of Joe:** Tingin (7.0)
- **NOBITA:** Ikaw Lang (6.2), Duas
- **TJ Monterde:** Palagi (6.8)
- **The Juans:** Hindi Tayo Pwede (9.0)
- **Silent Sanctuary:** Pasensya Ka Na, Sa'yo
- **John Roa:** Oks Lang (8.0)
- **BINI:** Salamin (Salamin), Pantropiko
- **Flow G / Skusta Clee:** for rap/hip-hop hugot entries
- **Classic OPM:** Eraserheads (Ang Huling El Bimbo, With A Smile), Rivermaya, Parokya ni Edgar (Harana, Your Song)
- **fitterkarma, Any Name's Okay** and other newer 2025-2026 OPM acts — search for current trending artists when building the database

Pain index guidelines:
- 0-3: Kilig, happy, warm songs
- 4-6: Bittersweet, longing, hopeful pining
- 7-8: Real heartbreak, nostalgia, anxiety
- 9-10: Emotional devastation, letting go, "I need therapy" tier

---

## Claude API Integration

### API Route
Create `/api/analyze` as a Next.js API route that:
1. Validates the request body (all fields present)
2. Checks server-side rate limit (IP-based, 2 per 24h)
3. Constructs the prompt with all user inputs
4. Calls the Anthropic API
5. Parses the JSON response
6. Returns it to the client

### Request Body
```typescript
interface AnalysisRequest {
  songs: { title: string; artist: string; mood: string; painIndex: number }[];
  mbti: string;
  attachmentStyle: "anxious" | "avoidant" | "disorganized" | "secure";
  loveLanguage: "words" | "acts" | "gifts" | "time" | "touch";
  zodiac: string;
  fingerprint: string;
}
```

### Response Shape
```typescript
interface ProfileResult {
  headline: string;
  threat_level: "CRITICAL" | "SEVERE" | "ELEVATED" | "MODERATE" | "LOW";
  drunk_text_probability: number;
  ex_stalking_frequency: string;
  emotional_damage_score: number;
  behavioral_predictions: string[];
  toxic_traits: string[];
  red_flags: string[];
  song_diagnosis: string;
  final_verdict: string;
  recommended_action: string;
  compatibility_warning: string;
}
```

### Rate Limit Denied Response
If the user has exceeded their limit, the API route returns a `429` with:
```json
{
  "error": "rate_limited",
  "message": "The creator of Senti.AI believed in second chances... not a third though. 'D ako bobo."
}
```

The frontend renders this as a full-screen cinematic block (see Rate Limiting System section).

### Match Analysis API Route
Create `/api/match` for the compatibility comparison:
- Takes both User A and User B's full profiles
- Generates the `MatchResult` using a second Claude API call
- Counts toward User B's rate limit

### Environment Variables
```env
ANTHROPIC_API_KEY=your-api-key-here
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

### Fallback Content
If the Claude API call fails (network error, timeout, etc.), generate a static but still funny fallback roast using template strings filled with the user's actual input data. The user should never see a broken state or error screen — they should always get a result, even if it's from the fallback system.

---

## The Prompt — Tone & Language Guide

This is the most important section. The quality of the roasts IS the product. Generic AI output kills the app.

### System Prompt for Claude API

```
You are SENTI.AI — an absurdly over-engineered emotional damage profiling system that psychoanalyzes Filipinos based on their OPM music taste combined with their full personality profile.

CRITICAL TONE RULES:

1. VOICE: Write like a brutally honest Filipino best friend who's had 3 San Mig Lights, NOT like an AI assistant. Never use phrases like "it appears that," "based on the analysis," "it's worth noting," "interestingly enough," or "this combination suggests." Use Taglish NATURALLY — the way actual Filipinos code-switch mid-sentence without thinking about it.

2. REFERENCE SPECIFIC, REAL FILIPINO BEHAVIORS — not generic personality descriptions:
   - Checking ex's Spotify activity / last active status at 2AM
   - Having a "healing era" playlist that's just the same sad songs repackaged
   - Screenshotting conversations to send to the barkada GC for group analysis
   - Typing "haha okay" when you're actually dying inside
   - The urge to text "kumusta ka na?" after 6 months of no contact
   - Posting cryptic IG stories with song lyrics as indirect messages (pasaring)
   - Having a finsta specifically for emotional breakdowns
   - Stalking through 3 years of someone's tagged photos at 3AM
   - The "I'm fine naman" while listening to Paubaya on repeat
   - Making hugot captions out of literally anything including Grab receipts
   - Saving voice messages from your ex in a hidden folder
   - Going to videoke and choosing the saddest song to belt out while ugly-crying
   - Sending TikTok reels to your crush as a love language and waiting for them to react
   - Having a "Para sa'yo 'to" playlist you'll never actually send
   - Ordering samgyupsal or milk tea to cope with heartbreak
   - The tito/tita at every family gathering asking "May jowa ka na ba?"
   - Being "MU" for 2 years straight without a DTR conversation
   - The "Ano ba tayo?" conversation that never happens
   - Posting a glow-up selfie right after a breakup
   - The "last song syndrome" that's always a heartbreak anthem
   - Monitoring who views your IG story (specifically waiting for one person)

3. USE CURRENT SLANG NATURALLY (2025-2026 era). Don't force it, but weave it in:
   - "na-ick" (got turned off), "delulu" (delusional), "sawi" (unlucky in love)
   - "talking stage," "MU," "DTR," "ghosting," "breadcrumbing," "situationship"
   - "awit" (expression of pain/resignation), "charot" (just kidding), "naol / sana all"
   - "marites" (gossip/chismosa), "over naman sa ___" (doing too much)
   - "na para bang" (as if / used for dramatic exaggeration)
   - "What hafen?" (expression of confusion/disbelief — 2025 viral meme)
   - "touch grass," "brain rot," "aura farming," "6-7" (so-so / idk)
   - "shot puno" (bottoms up), "bet kita" (I'm into you, casual)
   - "jowa" (bf/gf), "jowable" (dating material), "torpe" (too shy to confess)
   - "pa-fall" (making someone fall for you), "tampo" (sulking/silent treatment)
   - "seen-zoned" (left on read/seen), "bitter" (not over it)
   - Example of natural usage: "Bestie, ang delulu mo na. Hindi 'talking stage' yan, niloloko ka lang."
   - Example: "Na-ick ka na sa kanya 3 months ago pero pinapakinggan mo pa rin yung Pagsamo every night. Make it make sense."
   - Example: "Over naman sa pag-stalk, na para bang detective ka ng NBI."
   - Example: "Touch grass ka muna bago ka mag-compose ng paragraphs sa Notes app."

4. Be SPECIFIC to the COMBINATION. Don't describe MBTI or attachment style generically. COMBINE all four inputs + songs into a single psychographic roast:
   - INFP + Anxious + Words of Affirmation + Pisces = "You write unsent letters in your Notes app at 3AM, re-read them, cry, then save them in a folder called 'Drafts Na Hindi Masesend.' You have 14 drafts. I counted."
   - ENTJ + Avoidant + Quality Time + Capricorn = "You schedule heartbreak into your Google Calendar and then cancel on it. 'Quality time' for you is making someone emotionally dependent on you then saying 'I think we need space' the moment they get comfortable."
   - ENFP + Disorganized + Physical Touch + Sagittarius = "You fall in love every 2 weeks and each time you're convinced it's 'the one.' Your love language is physical touch pero you can't even hold onto a relationship longer than your Spotify free trial."
   - ISTJ + Anxious + Acts of Service + Virgo = "You have a spreadsheet tracking your crush's average response time. The standard deviation is 47 minutes and yes, you calculated it."

5. Reference the SPECIFIC SONGS they chose:
   - Don't just say "your playlist is sad." Be specific:
   - "You have Paubaya AND Kung Di Rin Lang Ikaw in the same list? That's not a playlist, that's a cry for help with a 4/4 time signature."
   - "Listening to Kathang Isip unironically in 2026? Bestie, the 'kathang isip' here is you thinking they'll come back."
   - "Demonyo sa playlist, 'I'm healing' sa bio. Sure, Jan."

6. NEVER USE THESE AI PATTERNS:
   - "Based on the analysis..."
   - "It's worth noting that..."
   - "This combination suggests..."
   - "Interestingly enough..."
   - "It's clear that..."
   - Generic zodiac horoscope descriptions
   - Textbook MBTI personality descriptions
   - Numbered lists with clinical labels
   Just GO for the jugular immediately. Start with the callout, not the setup.

7. The overall tone should make someone screenshot the result, send it to their barkada GC with "TANGINA TOTOO 😭😭😭", and then everyone else wants to try the app. That's the success metric.
```

### Song Mood → Behavioral Mapping (Include in Prompt Context)

- **yearning** → loves from a distance, probably hasn't confessed, stalks from afar, torpe energy
- **heartbreak** → recently damaged, NOT over it despite claims, the "I'm healing" person who is NOT healing
- **letting_go** → they SAY they're letting go but absolutely not, performance healing
- **kilig** → either in a new relationship and insufferable about it, or painfully single and projecting
- **toxic** → they KNOW the relationship is bad and they're staying anyway, "pero mahal ko eh" energy
- **denial** → literally in denial, will say "I'm fine" while their Spotify wrapped is 95% sad songs
- **nostalgia** → living in the past, probably still has their ex's hoodie
- **devotion** → either genuinely sweet or dangerously obsessive, no in-between
- **existential** → quarter-life crisis + relationship crisis combo
- **anxiety** → overthinking every text, screenshot-to-barkada-GC pipeline running 24/7
- **forbidden** → attracted to unavailable people as a lifestyle, "bakit siya pa" energy

### MBTI + Attachment Combo Cheat Sheet (Include in Prompt Context)

- **Any Feeler (F) + Anxious** = the "double texter who pretends they accidentally sent it"
- **Any Thinker (T) + Avoidant** = "I have commitment issues but I've intellectualized them into a philosophy"
- **Any Introvert (I) + Disorganized** = "push-pull through IG stories, never through actual conversation"
- **Any Extrovert (E) + Secure** = actually the healthiest combo but suspiciously so
- **INFP + Anxious** = the protagonist of every hugot tweet ever written
- **ENTJ + Avoidant** = treats relationships like quarterly business reviews
- **ENFP + Disorganized** = falls in love every 2 weeks, each time convinced it's "the one"
- **ISTJ + Anxious** = has a spreadsheet tracking response times of their crush
- **ISFP + Any** = expressed their feelings through a Spotify playlist shared on their IG story and is now waiting

---

## Design System

### Colors
```css
--bg-primary: #0a0a0f;
--bg-card: rgba(255,255,255,0.02);
--border-subtle: rgba(255,255,255,0.06);
--accent-primary: #ff3252;
--accent-secondary: #ff0844;
--accent-success: #22aa55;
--text-primary: #e8e8e8;
--text-secondary: #888888;
--text-muted: #555555;
--threat-critical: #ff0040;
--threat-severe: #ff3252;
--threat-elevated: #ff8c00;
--threat-moderate: #ffd000;
--threat-low: #00cc88;
```

### Typography
- **Display / Headings:** A bold, distinctive sans-serif (try Outfit, Syne, or Clash Display — pick one that feels right, avoid generic choices like Inter or Roboto)
- **Monospace / Labels:** JetBrains Mono or IBM Plex Mono
- **Body:** Same as display font at weight 400

### Visual Effects
- **Neural network background:** Canvas-based, ~40 floating nodes with connecting lines when within proximity, red-tinted, opacity ~0.3
- **Glitch text:** CSS pseudo-elements with slight positional offset + clip-path, red and cyan color channels
- **Threat meters:** Thin horizontal progress bars, animate from 0 → value on reveal, subtle glow
- **Cards:** Near-transparent background with thin border, 8-12px border radius
- **Buttons:** Gradient on enabled state with box-shadow glow, muted/dark when disabled
- **Step transitions:** Framer Motion — fade + slide up with spring easing
- **Results reveal:** Staggered section animation
- **Number counters:** Animate from 0 to final value on stat boxes

### Responsive Design
- Max-width container: ~680px centered
- Mobile-first (most users will be on phones sharing to stories)
- Touch-friendly: minimum 44px tap targets
- Share buttons should be thumb-reachable (bottom of screen on mobile)
- Stats row: horizontal scroll or stack vertically on narrow screens

---

## Component Architecture

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                        # Main app — multi-step flow
│   ├── leaderboard/
│   │   └── page.tsx                    # Public leaderboard
│   ├── match/
│   │   └── [id]/
│   │       └── page.tsx                # 1v1 match challenge (receives shared link)
│   ├── barkada/
│   │   └── [id]/
│   │       └── page.tsx                # Group barkada page
│   ├── history/
│   │   └── page.tsx                    # Personal history tracker
│   ├── callback/
│   │   └── page.tsx                    # Spotify OAuth callback
│   └── api/
│       ├── analyze/
│       │   └── route.ts                # Claude API proxy + rate limiting
│       ├── match/
│       │   └── route.ts                # Store/retrieve match profiles + generate comparison
│       ├── barkada/
│       │   └── route.ts                # Group management
│       ├── leaderboard/
│       │   └── route.ts                # GET/POST leaderboard entries
│       └── share-card/
│           └── route.ts                # Server-side image generation (optional, if using satori)
├── components/
│   ├── NeuralNetworkBg.tsx
│   ├── GlitchText.tsx
│   ├── StepIndicator.tsx
│   ├── RateLimitBlock.tsx              # The "'D ako bobo" screen
│   ├── steps/
│   │   ├── LandingStep.tsx
│   │   ├── SongInputStep.tsx
│   │   ├── MbtiStep.tsx
│   │   ├── AttachmentStep.tsx
│   │   ├── LoveLanguageStep.tsx
│   │   └── ZodiacStep.tsx
│   ├── AnalysisLoader.tsx
│   ├── ResultsDashboard.tsx
│   ├── ShareActions.tsx                # Share to IG/FB/copy/download buttons
│   ├── ShareCard.tsx                   # Hidden div rendered as share image
│   ├── MatchChallenge.tsx              # "Challenge a Friend" flow
│   ├── MatchReport.tsx                 # Side-by-side comparison view
│   ├── BarkadaGroup.tsx                # Group leaderboard + awards
│   ├── BarkadaShareCard.tsx            # Group share image template
│   ├── HistoryChart.tsx
│   └── ui/
│       ├── ThreatMeter.tsx
│       ├── StatBox.tsx
│       ├── SongChip.tsx
│       ├── Button.tsx
│       └── SoundToggle.tsx
├── data/
│   └── songs.ts                        # OPM song database
├── lib/
│   ├── buildPrompt.ts                  # Constructs the Claude API prompt
│   ├── buildMatchPrompt.ts             # Constructs the match/compatibility prompt
│   ├── types.ts
│   ├── fallbackResults.ts
│   ├── fingerprint.ts
│   ├── rateLimit.ts
│   ├── spotify.ts
│   ├── shareImage.ts                   # html2canvas / share logic
│   └── webShare.ts                     # Web Share API wrapper with fallbacks
├── hooks/
│   ├── useAnalysis.ts
│   ├── useSpotify.ts
│   └── useSound.ts
└── styles/
    └── globals.css
```

---

## Getting Started

```bash
npx create-next-app@latest senti-ai --typescript --tailwind --app --src-dir
cd senti-ai
npm install framer-motion tone html2canvas
# Add ANTHROPIC_API_KEY and SPOTIFY_CLIENT_ID to .env.local
npm run dev
```

---

## Definition of Done

The app is "done" when:
1. A user can go through the full flow without any broken states
2. Spotify OAuth works and pulls real top tracks
3. Manual song input works with autocomplete from the OPM database
4. The Claude API generates a unique, culturally specific, Taglish roast every time
5. Rate limiting works (2 per browser per day, funny "'D ako bobo" block on 3rd)
6. **Share cards generate correctly and can be posted directly to IG/FB stories via Web Share API on mobile**
7. **"Challenge a Friend" match flow works end-to-end with AI-generated compatibility roast**
8. **Barkada group mode works with awards and group share card**
9. Leaderboard stores and displays anonymous scores
10. History page tracks emotional deterioration over time
11. Fully responsive — optimized for mobile (that's where sharing happens)
12. Loading screen is dramatic and entertaining
13. Fallback system ensures results always appear even if API fails
14. Sound design enhances the experience (muted by default)
15. **Someone uses it, screenshots/shares the results, tags their barkada, and makes everyone else want to try it. That's the real KPI.**
