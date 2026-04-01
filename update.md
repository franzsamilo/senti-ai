# UPDATE.md — International & K-Pop Song Database Expansion

## Instructions

Add these international and K-pop songs to the existing `songs.ts` database. These are artists and tracks that are massively popular with Filipino listeners — confirmed via Spotify PH charts, concert sellouts in Manila, and Filipino internet culture. Same `Song` interface as the OPM database.

---

## Western / International Artists

### Taylor Swift
Filipinos are Swifties to the BONE. She's been the #1 most-streamed artist on Spotify PH for multiple years running.

```typescript
{ title: "All Too Well (10 Minute Version)", artist: "Taylor Swift", mood: "heartbreak", painIndex: 9.5 },
{ title: "Anti-Hero", artist: "Taylor Swift", mood: "existential", painIndex: 6.5 },
{ title: "Cruel Summer", artist: "Taylor Swift", mood: "infatuation", painIndex: 5.0 },
{ title: "Love Story", artist: "Taylor Swift", mood: "kilig", painIndex: 2.5 },
{ title: "Enchanted", artist: "Taylor Swift", mood: "sweet_pining", painIndex: 5.5 },
{ title: "cardigan", artist: "Taylor Swift", mood: "nostalgia", painIndex: 7.5 },
{ title: "exile (feat. Bon Iver)", artist: "Taylor Swift", mood: "heartbreak", painIndex: 8.5 },
{ title: "illicit affairs", artist: "Taylor Swift", mood: "forbidden", painIndex: 8.0 },
{ title: "Would've, Could've, Should've", artist: "Taylor Swift", mood: "heartbreak", painIndex: 9.0 },
{ title: "The 1", artist: "Taylor Swift", mood: "letting_go", painIndex: 7.0 },
{ title: "Fortnight (feat. Post Malone)", artist: "Taylor Swift", mood: "yearning", painIndex: 7.0 },
{ title: "So Long, London", artist: "Taylor Swift", mood: "heartbreak", painIndex: 9.2 },
{ title: "I Can Do It With a Broken Heart", artist: "Taylor Swift", mood: "denial", painIndex: 7.5 },
```

### beabadoobee
Filipino-British artist — Filipinos claim her as their own. Huge following in PH, multiple Manila concerts.

```typescript
{ title: "Glue Song", artist: "beabadoobee", mood: "kilig", painIndex: 2.5 },
{ title: "The Perfect Pair", artist: "beabadoobee", mood: "sweet_pining", painIndex: 4.0 },
{ title: "Cologne", artist: "beabadoobee", mood: "yearning", painIndex: 6.5 },
{ title: "Coffee", artist: "beabadoobee", mood: "nostalgia", painIndex: 7.0 },
{ title: "Ever Seen", artist: "beabadoobee", mood: "heartbreak", painIndex: 7.5 },
{ title: "Coming Home", artist: "beabadoobee", mood: "warmth", painIndex: 3.5 },
{ title: "Real Man", artist: "beabadoobee", mood: "existential", painIndex: 6.0 },
```

### Joji
Another Filipino-Japanese artist Filipinos claim as their own. The sadboy king.

```typescript
{ title: "Glimpse of Us", artist: "Joji", mood: "heartbreak", painIndex: 9.0 },
{ title: "Slow Dancing in the Dark", artist: "Joji", mood: "yearning", painIndex: 8.5 },
{ title: "Die For You", artist: "Joji", mood: "devotion", painIndex: 7.0 },
{ title: "Sanctuary", artist: "Joji", mood: "warmth", painIndex: 4.0 },
{ title: "YEAH RIGHT", artist: "Joji", mood: "denial", painIndex: 7.5 },
{ title: "Worldstar Money", artist: "Joji", mood: "existential", painIndex: 6.5 },
{ title: "Feeling Like the End", artist: "Joji", mood: "heartbreak", painIndex: 8.0 },
```

### wave to earth
Korean indie band but NOT K-pop — filed under international/indie. Sold out SM MOA Arena in Manila. Massive with Filipino indie kids.

```typescript
{ title: "seasons", artist: "wave to earth", mood: "sweet_pining", painIndex: 5.0 },
{ title: "bad", artist: "wave to earth", mood: "yearning", painIndex: 6.5 },
{ title: "homesick", artist: "wave to earth", mood: "nostalgia", painIndex: 7.0 },
{ title: "love", artist: "wave to earth", mood: "devotion", painIndex: 4.5 },
{ title: "butter fly.", artist: "wave to earth", mood: "kilig", painIndex: 3.5 },
{ title: "calm down", artist: "wave to earth", mood: "letting_go", painIndex: 6.0 },
{ title: "pink sky.", artist: "wave to earth", mood: "warmth", painIndex: 3.0 },
```

### Laufey
Icelandic-Chinese jazz artist — 3-night SOLD OUT at MOA Arena Manila in 2026. Filipino Lauvers are INTENSE.

```typescript
{ title: "From the Start", artist: "Laufey", mood: "kilig", painIndex: 3.0 },
{ title: "Goddess", artist: "Laufey", mood: "adoration", painIndex: 3.5 },
{ title: "Letter to My 13 Year Old Self", artist: "Laufey", mood: "nostalgia", painIndex: 6.0 },
{ title: "Falling Behind", artist: "Laufey", mood: "anxiety", painIndex: 6.5 },
{ title: "Dreamer", artist: "Laufey", mood: "sweet_pining", painIndex: 5.0 },
{ title: "Promise", artist: "Laufey", mood: "devotion", painIndex: 4.0 },
{ title: "While You Were Sleeping", artist: "Laufey", mood: "yearning", painIndex: 5.5 },
{ title: "Misty", artist: "Laufey", mood: "warmth", painIndex: 3.0 },
```

### NIKI
Indonesian-American, but HUGE in the Philippines — #5 most-streamed artist on Spotify PH in 2025. Emotional range queen.

```typescript
{ title: "Every Summertime", artist: "NIKI", mood: "nostalgia", painIndex: 5.5 },
{ title: "Before", artist: "NIKI", mood: "yearning", painIndex: 7.5 },
{ title: "Backburner", artist: "NIKI", mood: "heartbreak", painIndex: 8.0 },
{ title: "La La Lost You", artist: "NIKI", mood: "letting_go", painIndex: 7.0 },
{ title: "Hallway Weather", artist: "NIKI", mood: "sweet_pining", painIndex: 5.0 },
{ title: "High School in Jakarta", artist: "NIKI", mood: "nostalgia", painIndex: 6.0 },
{ title: "Buzz", artist: "NIKI", mood: "infatuation", painIndex: 4.0 },
```

### keshi
Vietnamese-American — Filipino listeners absolutely love him. Sold out MOA Arena.

```typescript
{ title: "like i need u", artist: "keshi", mood: "yearning", painIndex: 7.5 },
{ title: "beside you", artist: "keshi", mood: "devotion", painIndex: 5.0 },
{ title: "2 soon", artist: "keshi", mood: "anxiety", painIndex: 7.0 },
{ title: "blue", artist: "keshi", mood: "heartbreak", painIndex: 8.0 },
{ title: "right here", artist: "keshi", mood: "warmth", painIndex: 3.5 },
{ title: "LIMBO", artist: "keshi", mood: "existential", painIndex: 6.5 },
{ title: "GET IT", artist: "keshi", mood: "infatuation", painIndex: 4.0 },
```

### Bruno Mars
#6 most-streamed on Spotify PH. Filipinos treat him like an honorary Pinoy.

```typescript
{ title: "Die With A Smile (with Lady Gaga)", artist: "Bruno Mars", mood: "devotion", painIndex: 5.5 },
{ title: "APT. (with Rosé)", artist: "Bruno Mars", mood: "kilig", painIndex: 3.0 },
{ title: "When I Was Your Man", artist: "Bruno Mars", mood: "heartbreak", painIndex: 9.0 },
{ title: "Talking to the Moon", artist: "Bruno Mars", mood: "yearning", painIndex: 8.5 },
{ title: "It Will Rain", artist: "Bruno Mars", mood: "heartbreak", painIndex: 8.0 },
{ title: "Just the Way You Are", artist: "Bruno Mars", mood: "adoration", painIndex: 2.0 },
{ title: "Grenade", artist: "Bruno Mars", mood: "toxic", painIndex: 8.5 },
```

### SZA
#4 most-streamed on Spotify PH 2025. The sawi queen for international listeners.

```typescript
{ title: "Kill Bill", artist: "SZA", mood: "toxic", painIndex: 7.5 },
{ title: "Snooze", artist: "SZA", mood: "devotion", painIndex: 6.0 },
{ title: "Good Days", artist: "SZA", mood: "letting_go", painIndex: 5.5 },
{ title: "The Weekend", artist: "SZA", mood: "forbidden", painIndex: 7.0 },
{ title: "Nobody Gets Me", artist: "SZA", mood: "heartbreak", painIndex: 8.5 },
{ title: "Shirt", artist: "SZA", mood: "toxic", painIndex: 7.0 },
{ title: "Saturn", artist: "SZA", mood: "existential", painIndex: 8.0 },
```

### Ariana Grande
#3 on Spotify PH. Videoke staple.

```typescript
{ title: "we can't be friends (wait for your love)", artist: "Ariana Grande", mood: "letting_go", painIndex: 8.0 },
{ title: "thank u, next", artist: "Ariana Grande", mood: "letting_go", painIndex: 6.0 },
{ title: "pov", artist: "Ariana Grande", mood: "adoration", painIndex: 4.0 },
{ title: "ghostin", artist: "Ariana Grande", mood: "heartbreak", painIndex: 9.5 },
{ title: "needy", artist: "Ariana Grande", mood: "anxiety", painIndex: 7.0 },
{ title: "One Last Time", artist: "Ariana Grande", mood: "heartbreak", painIndex: 8.0 },
{ title: "imagine", artist: "Ariana Grande", mood: "yearning", painIndex: 7.5 },
```

### Cigarettes After Sex
Dreamy indie — sold out MOA Arena. Filipino late-night playlist staple.

```typescript
{ title: "Apocalypse", artist: "Cigarettes After Sex", mood: "devotion", painIndex: 6.0 },
{ title: "K.", artist: "Cigarettes After Sex", mood: "yearning", painIndex: 7.0 },
{ title: "Nothing's Gonna Hurt You Baby", artist: "Cigarettes After Sex", mood: "warmth", painIndex: 4.0 },
{ title: "Each Time You Fall in Love", artist: "Cigarettes After Sex", mood: "heartbreak", painIndex: 7.5 },
{ title: "Sunsetz", artist: "Cigarettes After Sex", mood: "nostalgia", painIndex: 6.5 },
{ title: "Heavenly", artist: "Cigarettes After Sex", mood: "adoration", painIndex: 4.5 },
```

### Billie Eilish
Massive global + PH following. The existential dread queen.

```typescript
{ title: "when the party's over", artist: "Billie Eilish", mood: "heartbreak", painIndex: 8.0 },
{ title: "BIRDS OF A FEATHER", artist: "Billie Eilish", mood: "devotion", painIndex: 5.0 },
{ title: "lovely (with Khalid)", artist: "Billie Eilish", mood: "existential", painIndex: 8.5 },
{ title: "ocean eyes", artist: "Billie Eilish", mood: "sweet_pining", painIndex: 5.5 },
{ title: "everything i wanted", artist: "Billie Eilish", mood: "anxiety", painIndex: 7.5 },
{ title: "THE GREATEST", artist: "Billie Eilish", mood: "letting_go", painIndex: 8.0 },
```

### TV Girl
First Manila concert in 2025. Filipino indie kids went crazy.

```typescript
{ title: "Lovers Rock", artist: "TV Girl", mood: "kilig", painIndex: 4.0 },
{ title: "Not Allowed", artist: "TV Girl", mood: "forbidden", painIndex: 7.0 },
{ title: "Blue Hair", artist: "TV Girl", mood: "nostalgia", painIndex: 6.5 },
{ title: "Taking What's Not Yours", artist: "TV Girl", mood: "toxic", painIndex: 7.0 },
{ title: "Birds Don't Sing", artist: "TV Girl", mood: "heartbreak", painIndex: 7.5 },
```

### The Weeknd
Global top streamed + massive PH audience.

```typescript
{ title: "Die For You", artist: "The Weeknd", mood: "devotion", painIndex: 6.5 },
{ title: "Call Out My Name", artist: "The Weeknd", mood: "heartbreak", painIndex: 8.5 },
{ title: "After Hours", artist: "The Weeknd", mood: "existential", painIndex: 8.0 },
{ title: "Save Your Tears", artist: "The Weeknd", mood: "letting_go", painIndex: 6.5 },
{ title: "Blinding Lights", artist: "The Weeknd", mood: "nostalgia", painIndex: 5.0 },
```

### Justin Bieber
#7 on Spotify PH 2025 — still massive with Filipinos.

```typescript
{ title: "Ghost", artist: "Justin Bieber", mood: "heartbreak", painIndex: 7.5 },
{ title: "2 Much", artist: "Justin Bieber", mood: "devotion", painIndex: 5.0 },
{ title: "Love Yourself", artist: "Justin Bieber", mood: "letting_go", painIndex: 6.5 },
{ title: "As I Am", artist: "Justin Bieber", mood: "warmth", painIndex: 4.0 },
```

### Olivia Rodrigo
Gen Z anthem machine. Huge PH streaming numbers.

```typescript
{ title: "drivers license", artist: "Olivia Rodrigo", mood: "heartbreak", painIndex: 9.0 },
{ title: "traitor", artist: "Olivia Rodrigo", mood: "heartbreak", painIndex: 9.0 },
{ title: "happier", artist: "Olivia Rodrigo", mood: "jealousy", painIndex: 8.0 },
{ title: "enough for you", artist: "Olivia Rodrigo", mood: "heartbreak", painIndex: 8.5 },
{ title: "favorite crime", artist: "Olivia Rodrigo", mood: "toxic", painIndex: 8.0 },
{ title: "so american", artist: "Olivia Rodrigo", mood: "kilig", painIndex: 4.0 },
{ title: "vampire", artist: "Olivia Rodrigo", mood: "toxic", painIndex: 7.5 },
```

---

## K-Pop

K-pop is MASSIVE in the Philippines. Include these but keep the selection focused on songs with emotional/hugot energy — not just dance bops. The AI should know how to roast someone whose playlist is full of K-pop too.

### BTS
The biggest. Filipino ARMYs are ride-or-die.

```typescript
{ title: "Spring Day", artist: "BTS", mood: "nostalgia", painIndex: 8.0 },
{ title: "The Truth Untold", artist: "BTS", mood: "yearning", painIndex: 8.5 },
{ title: "Fake Love", artist: "BTS", mood: "heartbreak", painIndex: 7.5 },
{ title: "Butterfly", artist: "BTS", mood: "sweet_pining", painIndex: 6.5 },
{ title: "Life Goes On", artist: "BTS", mood: "letting_go", painIndex: 6.0 },
{ title: "Film Out", artist: "BTS", mood: "heartbreak", painIndex: 7.0 },
{ title: "Don't Say You Love Me", artist: "Jin", mood: "heartbreak", painIndex: 7.5 },
{ title: "Who", artist: "Jimin", mood: "yearning", painIndex: 7.0 },
{ title: "Winter Ahead", artist: "V", mood: "nostalgia", painIndex: 6.5 },
```

### BLACKPINK / Soloists

```typescript
{ title: "Stay", artist: "BLACKPINK", mood: "devotion", painIndex: 5.5 },
{ title: "Lovesick Girls", artist: "BLACKPINK", mood: "heartbreak", painIndex: 7.0 },
{ title: "GONE", artist: "Rosé", mood: "heartbreak", painIndex: 8.5 },
{ title: "On The Ground", artist: "Rosé", mood: "existential", painIndex: 6.5 },
{ title: "APT.", artist: "Rosé & Bruno Mars", mood: "kilig", painIndex: 3.0 },
{ title: "SOLO", artist: "Jennie", mood: "letting_go", painIndex: 5.0 },
```

### DAY6
Their 2025 resurgence was massive — Filipinos love this band deeply.

```typescript
{ title: "You Were Beautiful", artist: "DAY6", mood: "heartbreak", painIndex: 9.0 },
{ title: "Letting Go", artist: "DAY6", mood: "letting_go", painIndex: 8.5 },
{ title: "When You Love Someone", artist: "DAY6", mood: "devotion", painIndex: 6.0 },
{ title: "Congratulations", artist: "DAY6", mood: "heartbreak", painIndex: 8.0 },
{ title: "Happy", artist: "DAY6", mood: "warmth", painIndex: 3.0 },
{ title: "Maybe Tomorrow", artist: "DAY6", mood: "anxiety", painIndex: 6.5 },
```

### SEVENTEEN

```typescript
{ title: "Don't Wanna Cry", artist: "SEVENTEEN", mood: "heartbreak", painIndex: 7.5 },
{ title: "Super", artist: "SEVENTEEN", mood: "kilig", painIndex: 3.0 },
{ title: "Love, Money, Fame (feat. DJ Khaled)", artist: "SEVENTEEN", mood: "infatuation", painIndex: 4.0 },
```

### IU
Not exactly K-pop idol but Korean music queen — Filipinos love her.

```typescript
{ title: "Love wins all", artist: "IU", mood: "devotion", painIndex: 5.0 },
{ title: "Through the Night", artist: "IU", mood: "yearning", painIndex: 7.5 },
{ title: "Blueming", artist: "IU", mood: "kilig", painIndex: 3.5 },
{ title: "eight (feat. SUGA)", artist: "IU", mood: "nostalgia", painIndex: 7.0 },
```

### NewJeans

```typescript
{ title: "Ditto", artist: "NewJeans", mood: "sweet_pining", painIndex: 5.0 },
{ title: "Hype Boy", artist: "NewJeans", mood: "infatuation", painIndex: 4.0 },
{ title: "Super Shy", artist: "NewJeans", mood: "kilig", painIndex: 3.0 },
```

### Stray Kids

```typescript
{ title: "Lose My Breath (feat. Charlie Puth)", artist: "Stray Kids", mood: "yearning", painIndex: 6.5 },
{ title: "S-Class", artist: "Stray Kids", mood: "infatuation", painIndex: 3.5 },
```

### TWICE

```typescript
{ title: "What is Love?", artist: "TWICE", mood: "kilig", painIndex: 3.0 },
{ title: "The Feels", artist: "TWICE", mood: "infatuation", painIndex: 3.5 },
```

### ENHYPEN
Big PH following — multiple sold-out Manila shows.

```typescript
{ title: "XO (Only If You Say Yes)", artist: "ENHYPEN", mood: "sweet_pining", painIndex: 5.0 },
{ title: "Polaroid Love", artist: "ENHYPEN", mood: "kilig", painIndex: 3.5 },
```

---

## Prompt Context Update

Add this to the `buildPrompt.ts` context so the AI knows how to roast international music taste specifically:

### International Artist → Behavioral Mapping

Include these in the prompt context alongside the OPM mood mappings:

```
INTERNATIONAL ARTIST ROAST CONTEXT:

- Taylor Swift listener → probably has an ex for every album era, creates "themed breakup playlists," romanticizes suffering as an aesthetic, types in all lowercase when sad, has a "reputation era" personality shift after every breakup
- beabadoobee listener → claims to be "indie" but has 40k followers, probably has a Pinterest board called "soft grunge," wears oversized band tees as personality
- Joji listener → the sadboi final boss, has a Filthy Frank to Joji pipeline that mirrors their own emotional journey, listens to "Glimpse of Us" about someone they dated for 2 weeks
- wave to earth listener → "I only listen to underground music" (they have 8M monthly listeners), probably uses their music as study/cry background simultaneously
- Laufey listener → aestheticizes their sadness with jazz, probably has a "romanticize your life" era, posts coffee shop photos with her music in the background
- NIKI listener → Southeast Asian representation queen, listener probably relates TOO hard to "Backburner," has "Every Summertime" as their "what if" song
- keshi listener → the "I'm emotionally mature" sadboi who is NOT emotionally mature, probably cries to "like i need u" while typing "I'm good" to their situationship
- Bruno Mars listener → videoke warrior, belts "When I Was Your Man" at every inuman, probably has this as their go-to heartbreak song since 2013
- SZA listener → the "I know my worth but I still texted him" person, toxic self-awareness queen
- Cigarettes After Sex listener → their entire personality is "late night drives," probably plays this during moments that aren't actually that deep
- K-pop heavy playlist → different roast angle: "Your parasocial relationships with idols are healthier than your actual relationships," "You project romantic fantasies onto K-pop MVs because your own love life is 6-7," "You went to a fansign instead of therapy"
- DAY6 "You Were Beautiful" specifically → this person is NOT over it and they're using K-rock to pretend they're processing their emotions in a healthy way. They are not.
- BTS "Spring Day" specifically → instant +2 to pain index, this song is a universal cry trigger, if it's on their list they're dealing with loss or longing on a deep level
- Mix of OPM + international sad songs → "Your emotional damage is bilingual. You cry in Tagalog AND English. Internationally sawi."
```

---

## Notes

- This brings the total song database to ~150+ songs which should give excellent autocomplete coverage
- The Spotify integration will catch even more songs automatically — this database is mainly for the manual input autocomplete and for enriching mood/pain metadata when Spotify tracks match known songs
- For songs not in either database (custom entries or unrecognized Spotify tracks), the fallback pain index of 5.5 and mood of "unknown" still applies
- K-pop songs should be searchable by both the song title AND the group name
- Some artists appear in multiple categories (e.g., Rosé appears under both BLACKPINK and Bruno Mars collabs) — deduplicate by title + artist combo
