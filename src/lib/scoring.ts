import type {
  AttachmentStyle,
  LoveLanguage,
  Metrics,
  MetricKey,
  Mood,
  Song,
  ThreatLevel,
} from "./types";

/**
 * Deterministic scoring.
 *
 * Before this existed the model invented every number from scratch, and the
 * five threat meters were the damage score multiplied by five different
 * constants, so they always rose and fell together. Two people with opposite
 * playlists could land on the same 8.4 for no reason they could see.
 *
 * Now the numbers start here, from the inputs, and each meter reads a
 * different dimension of them. The model is handed this baseline and may move
 * each number only inside a band, for a reason it has to name (the user's
 * written context, a specific song). The result: scores that differ between
 * people for legible reasons, and that the model can't push to 9.8 for
 * everyone because a high score reads as funnier.
 *
 * Runs on both sides — the server feeds it to the prompt, the client uses it
 * for the offline report — so it must stay free of server-only imports.
 */

export const METRIC_KEYS: MetricKey[] = [
  "instability",
  "toxicity",
  "delulu",
  "sadness",
  "healing",
];

export const METRIC_LABELS: Record<MetricKey, string> = {
  instability: "Emotional instability",
  toxicity: "Toxic trait concentration",
  delulu: "Delulu index",
  sadness: "Sadboi / sadgirl rating",
  healing: "Healing progress",
};

/** How far the model may move each number away from the baseline. */
export const BANDS = {
  damage: 1.2,
  drunkText: 15,
  metric: 15,
} as const;

/**
 * What each mood says about the listener, 0–1 per dimension. Hand-tuned to the
 * behavioural mapping in the prompt: `toxic` and `obsession` drive toxicity,
 * `hopeless_crush` and `denial` drive delulu, `warmth` is the only real
 * healing signal.
 */
type MoodVector = Record<MetricKey, number>;

const MOOD_VECTORS: Record<Mood, MoodVector> = {
  heartbreak: { instability: 0.6, toxicity: 0.2, delulu: 0.3, sadness: 0.9, healing: 0.2 },
  letting_go: { instability: 0.4, toxicity: 0.1, delulu: 0.45, sadness: 0.8, healing: 0.45 },
  yearning: { instability: 0.5, toxicity: 0.2, delulu: 0.65, sadness: 0.7, healing: 0.2 },
  kilig: { instability: 0.25, toxicity: 0.1, delulu: 0.7, sadness: 0.1, healing: 0.6 },
  toxic: { instability: 0.8, toxicity: 1.0, delulu: 0.6, sadness: 0.6, healing: 0.05 },
  denial: { instability: 0.6, toxicity: 0.5, delulu: 0.95, sadness: 0.6, healing: 0.1 },
  nostalgia: { instability: 0.4, toxicity: 0.2, delulu: 0.5, sadness: 0.7, healing: 0.2 },
  devotion: { instability: 0.3, toxicity: 0.3, delulu: 0.55, sadness: 0.3, healing: 0.5 },
  infatuation: { instability: 0.6, toxicity: 0.3, delulu: 0.85, sadness: 0.2, healing: 0.35 },
  existential: { instability: 0.7, toxicity: 0.2, delulu: 0.3, sadness: 0.7, healing: 0.3 },
  hopeless_crush: { instability: 0.5, toxicity: 0.2, delulu: 0.9, sadness: 0.6, healing: 0.2 },
  forbidden: { instability: 0.7, toxicity: 0.85, delulu: 0.7, sadness: 0.6, healing: 0.1 },
  sweet_pining: { instability: 0.4, toxicity: 0.1, delulu: 0.7, sadness: 0.45, healing: 0.4 },
  loyalty: { instability: 0.2, toxicity: 0.3, delulu: 0.4, sadness: 0.3, healing: 0.5 },
  anxiety: { instability: 0.95, toxicity: 0.4, delulu: 0.5, sadness: 0.6, healing: 0.2 },
  lost_love: { instability: 0.5, toxicity: 0.2, delulu: 0.5, sadness: 0.9, healing: 0.15 },
  adoration: { instability: 0.3, toxicity: 0.2, delulu: 0.75, sadness: 0.2, healing: 0.5 },
  warmth: { instability: 0.1, toxicity: 0.05, delulu: 0.3, sadness: 0.2, healing: 0.85 },
  obsession: { instability: 0.85, toxicity: 0.85, delulu: 0.8, sadness: 0.5, healing: 0.05 },
  belonging: { instability: 0.3, toxicity: 0.3, delulu: 0.4, sadness: 0.4, healing: 0.5 },
  tragic_hope: { instability: 0.5, toxicity: 0.3, delulu: 0.8, sadness: 0.8, healing: 0.3 },
  jealousy: { instability: 0.8, toxicity: 0.8, delulu: 0.5, sadness: 0.6, healing: 0.1 },
  unknown: { instability: 0.5, toxicity: 0.35, delulu: 0.5, sadness: 0.5, healing: 0.3 },
};

/** Additive nudges per attachment style, on the 0–100 meter scale. */
const ATTACHMENT_EFFECTS: Record<
  AttachmentStyle,
  MoodVector & { damage: number; drunkText: number }
> = {
  anxious: { instability: 15, toxicity: 5, delulu: 10, sadness: 6, healing: -5, damage: 0.8, drunkText: 20 },
  disorganized: { instability: 18, toxicity: 10, delulu: 8, sadness: 5, healing: -8, damage: 0.9, drunkText: 12 },
  avoidant: { instability: 4, toxicity: 12, delulu: -4, sadness: 0, healing: -3, damage: 0.4, drunkText: -6 },
  secure: { instability: -15, toxicity: -10, delulu: -10, sadness: -6, healing: 15, damage: -1.0, drunkText: -15 },
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

export interface PainStats {
  /** Plain mean of every track. */
  average: number;
  /**
   * Top-heavy mean: the heaviest third of the list counts for 60%. One Paubaya
   * in a playlist of kilig songs is the whole story, and a plain average would
   * bury it.
   */
  weighted: number;
  min: number;
  max: number;
  /** Tracks at 8.0+ — the "therapy tier". */
  devastating: number;
}

export interface ScoreProfile {
  pain: PainStats;
  damage: number;
  drunkText: number;
  metrics: Record<MetricKey, number>;
  threat: ThreatLevel;
  /** Human-readable reasons the baseline landed where it did, biggest first. */
  factors: string[];
}

export function painStats(songs: Song[]): PainStats {
  if (songs.length === 0) {
    return { average: 5.5, weighted: 5.5, min: 5.5, max: 5.5, devastating: 0 };
  }
  const pains = songs.map((s) => clamp(s.painIndex, 0, 10)).sort((a, b) => b - a);
  const average = pains.reduce((a, b) => a + b, 0) / pains.length;
  const topCount = Math.max(1, Math.ceil(pains.length / 3));
  const topMean = pains.slice(0, topCount).reduce((a, b) => a + b, 0) / topCount;
  return {
    average: round1(average),
    weighted: round1(0.6 * topMean + 0.4 * average),
    min: pains[pains.length - 1],
    max: pains[0],
    devastating: pains.filter((p) => p >= 8).length,
  };
}

/** One shared ladder so the badge, the leaderboard and the barkada agree. */
export function threatFromScore(score: number): ThreatLevel {
  if (score >= 8.5) return "CRITICAL";
  if (score >= 7) return "SEVERE";
  if (score >= 5.5) return "ELEVATED";
  if (score >= 3.5) return "MODERATE";
  return "LOW";
}

export function computeScoreProfile(
  songs: Song[],
  mbti: string,
  attachmentStyle: AttachmentStyle,
  loveLanguage: LoveLanguage[]
): ScoreProfile {
  const pain = painStats(songs);
  const type = mbti.toUpperCase();
  const factors: { weight: number; text: string }[] = [];

  // Mood profile, weighted so heavier songs say more about the listener.
  const mood: MoodVector = { instability: 0, toxicity: 0, delulu: 0, sadness: 0, healing: 0 };
  let totalWeight = 0;
  const moodCounts = new Map<Mood, number>();
  for (const song of songs) {
    const vector = MOOD_VECTORS[song.mood] ?? MOOD_VECTORS.unknown;
    const weight = 0.5 + clamp(song.painIndex, 0, 10) / 10;
    totalWeight += weight;
    for (const key of METRIC_KEYS) mood[key] += vector[key] * weight;
    if (song.mood !== "unknown") moodCounts.set(song.mood, (moodCounts.get(song.mood) ?? 0) + 1);
  }
  if (totalWeight > 0) for (const key of METRIC_KEYS) mood[key] /= totalWeight;
  else Object.assign(mood, MOOD_VECTORS.unknown);

  // A list stuck on one mood is a loop, not a taste.
  const [topMood, topMoodCount] =
    [...moodCounts.entries()].sort((a, b) => b[1] - a[1])[0] ?? ["unknown", 0];
  const looping = songs.length >= 3 && topMoodCount / songs.length >= 0.5;
  const whiplash = pain.max - pain.min;

  const attach = ATTACHMENT_EFFECTS[attachmentStyle];
  const feeler = type.includes("F");
  const intuitive = type.includes("N");
  const thinker = type.includes("T");
  const perceiver = type.includes("P");
  const extravert = type.startsWith("E");
  const extraLanguages = Math.max(0, loveLanguage.length - 2);

  const metrics: Record<MetricKey, number> = {
    instability: Math.round(
      clamp(
        12 + mood.instability * 40 + pain.weighted * 3 + whiplash * 1.5 + attach.instability + (perceiver ? 4 : 0) + (loveLanguage.includes("words") ? 4 : 0),
        3,
        99
      )
    ),
    toxicity: Math.round(
      clamp(
        8 + mood.toxicity * 55 + pain.weighted * 1.5 + attach.toxicity + (thinker ? 5 : 0) + (loveLanguage.includes("time") ? 3 : 0) + (loveLanguage.includes("acts") ? 2 : 0),
        3,
        99
      )
    ),
    delulu: Math.round(
      clamp(
        10 + mood.delulu * 55 + (looping ? 8 : 0) + attach.delulu + (intuitive ? 6 : 0) + (feeler ? 3 : 0) + extraLanguages * 5 + (loveLanguage.includes("gifts") ? 3 : 0),
        3,
        99
      )
    ),
    sadness: Math.round(
      clamp(pain.weighted * 7 + mood.sadness * 25 + pain.devastating * 1.5 + attach.sadness + (feeler ? 6 : 0), 3, 99)
    ),
    // Allowed to be honest at the low end and capped at the top — nobody
    // running an emotional damage scan is 90% healed.
    healing: Math.round(
      clamp(18 + mood.healing * 40 - pain.weighted * 2.5 + attach.healing, 3, 62)
    ),
  };

  const damage = round1(
    clamp(
      0.45 * pain.weighted +
        0.25 * (metrics.sadness / 10) +
        0.15 * (metrics.instability / 10) +
        0.15 * (metrics.toxicity / 10) +
        attach.damage +
        (feeler ? 0.3 : 0) +
        (intuitive ? 0.15 : 0),
      0.5,
      9.9
    )
  );

  const drunkText = Math.round(
    clamp(
      pain.weighted * 5 + metrics.instability * 0.25 + attach.drunkText + (loveLanguage.includes("touch") ? 8 : 0) + (extravert ? 5 : 0),
      4,
      98
    )
  );

  // ── Why it landed here, in plain words, for the prompt and the UI ──
  if (songs.length > 0) {
    const heaviest = songs.reduce((a, b) => (b.painIndex > a.painIndex ? b : a));
    factors.push({
      weight: pain.max,
      text: `heaviest track "${heaviest.title}" sits at ${heaviest.painIndex.toFixed(1)}/10 pain`,
    });
  }
  if (pain.devastating >= 2) {
    factors.push({ weight: 6 + pain.devastating, text: `${pain.devastating} tracks in the 8.0+ therapy tier` });
  }
  if (looping) {
    factors.push({
      weight: 7 + topMoodCount,
      text: `mood loop — ${topMood.replace(/_/g, " ")} is ${Math.round((topMoodCount / songs.length) * 100)}% of the list`,
    });
  }
  if (whiplash >= 5) {
    factors.push({ weight: 5 + whiplash / 2, text: `pain whiplash from ${pain.min.toFixed(1)} to ${pain.max.toFixed(1)}` });
  }
  factors.push({
    weight: Math.abs(attach.damage) * 10,
    text: `${attachmentStyle} attachment (${attach.damage >= 0 ? "+" : ""}${attach.damage.toFixed(1)} damage)`,
  });
  if (extraLanguages > 0) {
    factors.push({ weight: 4 + extraLanguages, text: `${loveLanguage.length} love languages at once` });
  }
  if (feeler && intuitive) {
    factors.push({ weight: 3, text: `${type}: feeling + intuition, the over-reading combo` });
  }

  return {
    pain,
    damage,
    drunkText,
    metrics,
    threat: threatFromScore(damage),
    factors: factors.sort((a, b) => b.weight - a.weight).map((f) => f.text),
  };
}

/**
 * Fold the model's numbers back onto the baseline: anything outside the band
 * is pulled to its edge, anything missing falls back to the baseline itself.
 */
export function reconcileScores(
  baseline: ScoreProfile,
  model: {
    damage?: unknown;
    drunkText?: unknown;
    metrics?: Partial<Record<MetricKey, { value?: unknown; note?: unknown }>>;
  }
): { damage: number; drunkText: number; metrics: Metrics } {
  const within = (value: unknown, center: number, band: number, min: number, max: number) => {
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n)) return center;
    return clamp(clamp(n, center - band, center + band), min, max);
  };

  const metrics = {} as Metrics;
  for (const key of METRIC_KEYS) {
    const entry = model.metrics?.[key];
    const note = typeof entry?.note === "string" ? entry.note.trim() : "";
    metrics[key] = {
      value: Math.round(
        within(entry?.value, baseline.metrics[key], BANDS.metric, 1, key === "healing" ? 70 : 99)
      ),
      note,
    };
  }

  return {
    damage: round1(within(model.damage, baseline.damage, BANDS.damage, 0.1, 10)),
    drunkText: Math.round(within(model.drunkText, baseline.drunkText, BANDS.drunkText, 1, 99)),
    metrics,
  };
}

/**
 * Meters for a result stored before metrics existed — a match partner's old
 * profile, an old history entry. Derived from the damage score alone, which
 * is what the app used to show.
 */
export function legacyMetrics(score: number, avgPain: number): Metrics {
  return {
    instability: { value: Math.min(99, Math.round(score * 10.5)), note: "" },
    toxicity: { value: Math.min(99, Math.round(score * 9.2)), note: "" },
    delulu: { value: Math.min(99, Math.round(score * 11)), note: "" },
    sadness: { value: Math.min(99, Math.round(avgPain * 10)), note: "" },
    healing: { value: Math.max(5, Math.min(20, Math.round((10 - score) * 2))), note: "" },
  };
}
