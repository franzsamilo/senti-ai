# Leaderboard & Barkada UI Redesign

**Date:** 2026-04-01
**Scope:** Visual-only redesign of leaderboard page, barkada group component, and landing page nav links. No API changes.

---

## 1. Leaderboard Page (`/leaderboard`)

### Header
- SENTI.AI branding subtitle (monospace, muted)
- GlitchText title: "MOST EMOTIONALLY DAMAGED"
- Live counter: "X profiles in the database" with animated count

### Filter Bar
Horizontal scrollable row of pill toggles:
- **MBTI** — 16 small pills (INFP, ENTJ, etc.)
- **Attachment Style** — 4 pills (Anxious, Avoidant, Disorganized, Secure)
- **Zodiac** — 12 symbol pills
- **Threat Level** — 5 color-coded pills
- Filters use AND logic (combining narrows results)
- "Clear All" reset button when any filter is active
- Pill styling: ghost by default, accent-colored when active

### Top 3 Podium
Three oversized cards in podium layout: `[2nd] [1st] [3rd]`
- 1st place card is taller/larger
- Each card:
  - Rank badge with metallic glow (gold #FFD700, silver #C0C0C0, bronze #CD7F32)
  - Score in large animated text (count-up from 0)
  - MBTI + Attachment + Zodiac as small chips
  - Threat level badge with color glow
  - Deterministic funny title based on data combo (e.g., "Certified Sawi INFP", "Professional Ghoster", "Delulu Hall of Famer")
- Staggered entrance animation (1st reveals first, then 2nd & 3rd)

#### Funny Title Generation (deterministic, no AI)
Map combos to titles client-side:
- Anxious + any Feeler = "Certified Sawi"
- Avoidant + any Thinker = "Professional Ghoster"
- Score >= 9.0 = "Emotional Damage Speedrunner"
- Disorganized + any = "Push-Pull Champion"
- Secure + LOW threat = "Suspiciously Healthy"
- Default fallback by threat level (CRITICAL = "Walking Red Flag", SEVERE = "Therapy Candidate", etc.)

### Entries List (Ranks 4-50)
Ranked cards with staggered fade-up animation:
- Rank number (left, bold, monospace)
- Score with animated count-up (right, colored by threat level)
- MBTI, Attachment, Zodiac as small inline chips
- Threat badge (color-coded with subtle border glow)
- Date (muted, right-aligned)
- Subtle hover: card border glows with threat color

### Empty / Filtered-Out State
- GlitchText: "No emotional damage detected..."
- Subtitle: "...suspicious."

---

## 2. Barkada Group Component

### Awards Section (expanded from 3 to 5)
Grid of 5 award cards (responsive: 2-col mobile with last centered, 3+2 or 5-col desktop):

| Award | Icon | Metric | Description |
|-------|------|--------|-------------|
| Most Sawi | 🏆 | Highest emotional_damage_score | "Hindi na makaget over" |
| Most Delulu | 💀 | Highest drunk_text_probability | "Main character syndrome" |
| Most Likely to Drunk Text | 📱 | Anxious attachment + highest score combo | "3AM warrior" |
| Walking Red Flag | 🚩 | Highest threat level + toxic traits count | "Jowa ng lahat, jowa ng wala" |
| Healthiest (Boring) | 🧘 | Lowest emotional_damage_score | "Touch grass champion" |

Each award card:
- Icon large and centered with subtle glow matching threat color
- Award title in monospace, uppercase
- Winner's nickname in accent color
- Detail metric below (e.g., "Score: 9.4/10")
- Card has a subtle colored top border matching the award theme

### Member Rankings
Richer card per member:
- Top 3 get gold/silver/bronze rank badge (same as leaderboard podium style but smaller)
- Animated score counter (count-up)
- MBTI + Attachment + Zodiac chips inline
- Threat badge with glow
- Mini ThreatMeter bar inside the card (thin, showing their score as % of 10)
- Staggered fade-up animation

### Group Stats Section
Row of animated StatBox components:
- Avg Emotional Damage (animated counter, X.X/10)
- Dominant Attachment Style (text)
- Most Common Zodiac (symbol + name)
- Group Threat Level (computed from avg score, color-coded badge)
- Member Count (X/10)

### Share Section
Clean card with:
- Share URL in monospace
- "Copy Link" button with success toast feedback
- Expiration notice (muted text)

---

## 3. Landing Page Additions

Below the existing "Connect Spotify" and "Manual Input" CTAs, add two ghost-style links:

```
[View the Leaderboard]     [Join a Barkada Group]
```

- Styled as ghost buttons (no background, subtle border, accent text on hover)
- Small size, don't compete with primary CTAs
- "View the Leaderboard" links to `/leaderboard`
- "Join a Barkada Group" links to `/barkada` or opens an inline input for group code

---

## 4. Files to Modify

| File | Change |
|------|--------|
| `src/app/leaderboard/page.tsx` | Full rewrite — new layout with podium, filters, richer cards |
| `src/components/BarkadaGroup.tsx` | Expand awards to 5, richer member cards, animated stats |
| `src/components/steps/LandingStep.tsx` | Add leaderboard + barkada nav links |

No API route changes needed. No new components needed (reuse StatBox, ThreatMeter, GlitchText, Button, etc.).

---

## 5. Animation Spec

- **Podium reveal:** staggered — 1st (0ms), 2nd (150ms), 3rd (300ms), fade-up + scale
- **Entry cards:** staggered fade-up (50ms apart) on scroll/mount
- **Score counters:** count-up from 0 over 1500ms with easeOutCubic
- **Filter pills:** instant toggle, filtered list re-renders with fade transition
- **Award cards (barkada):** staggered fade-up (100ms apart)
- **Threat meters (barkada member cards):** fill from 0 over 1000ms

---

## 6. Responsive Behavior

### Leaderboard
- **Podium:** Horizontal on desktop, stacked vertically on mobile (1st on top, then 2nd, 3rd)
- **Filter bar:** Horizontal scroll on mobile
- **Entry cards:** Full-width stack on mobile

### Barkada
- **Awards grid:** 2-col on mobile (last card full-width centered), up to 5-col on wide desktop
- **Member cards:** Full-width stack
- **Stats row:** Horizontal scroll or 2-col grid on mobile
