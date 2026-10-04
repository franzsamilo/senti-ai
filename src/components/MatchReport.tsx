"use client";

import { motion } from "framer-motion";
import type { MatchResult, UserProfile } from "@/lib/types";
import RevealText from "@/components/ui/RevealText";
import {
  IconAnxious,
  IconAvoidant,
  IconFlag,
  IconMusic,
  IconSparkle,
  IconTime,
} from "@/components/ui/icons";
import { itemVariants, listVariants, popSpring } from "@/components/ui/motion";
import { ATTACHMENT_LABELS, LOVE_LANGUAGE_SHORT, threatTone } from "@/lib/theme";

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

function languages(profile: UserProfile) {
  const list = Array.isArray(profile.loveLanguage) ? profile.loveLanguage : [profile.loveLanguage];
  return list.map((l) => LOVE_LANGUAGE_SHORT[l] ?? l).join(", ");
}

/**
 * The two profiles as a boxing "tale of the tape": each stat on its own row,
 * corner A on the left, corner B on the right, the label down the middle.
 */
function TaleOfTheTape({ a, b }: { a: UserProfile; b: UserProfile }) {
  const aWins = a.result.emotional_damage_score >= b.result.emotional_damage_score;
  const toneA = threatTone(a.result.threat_level);
  const toneB = threatTone(b.result.threat_level);
  const rows: [string, string, string][] = [
    ["Threat", toneA.label, toneB.label],
    ["Type", a.mbti, b.mbti],
    ["Attachment", ATTACHMENT_LABELS[a.attachmentStyle] ?? a.attachmentStyle, ATTACHMENT_LABELS[b.attachmentStyle] ?? b.attachmentStyle],
    ["Love", languages(a), languages(b)],
    ["Sign", cap(a.zodiac), cap(b.zodiac)],
    ["Tracks", String(a.songs.length), String(b.songs.length)],
  ];
  return (
    <motion.section variants={itemVariants} className="border-[3px] border-ink bg-paper-light">
      <p className="bg-ink text-yellow text-center font-display font-black uppercase tracking-[0.12em] text-[15px] py-1.5">
        Tale of the tape
      </p>
      <div className="grid grid-cols-[1fr_auto_1fr] items-end px-3 pt-3 pb-2 border-b-[3px] border-ink">
        {[
          { label: "Person A", score: a.result.emotional_damage_score, tone: toneA, win: aWins },
          null,
          { label: "Person B", score: b.result.emotional_damage_score, tone: toneB, win: !aWins },
        ].map((corner, i) =>
          corner ? (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="font-display font-extrabold uppercase tracking-[0.06em] text-[13px] text-text-muted">
                {corner.label}
              </span>
              <span className="font-display font-black text-[52px] leading-[0.85] tabular-nums" style={{ color: corner.tone.color }}>
                {corner.score.toFixed(1)}
              </span>
              <span
                className={`font-display font-black uppercase text-[12px] tracking-[0.04em] px-1.5 py-0.5 ${
                  corner.win ? "bg-pink border-2 border-ink text-ink" : "text-transparent"
                }`}
              >
                More sawi
              </span>
            </div>
          ) : (
            <span
              key={i}
              className="mb-6 grid place-items-center w-12 h-12 rounded-full bg-red border-[3px] border-ink font-display font-black text-[20px] text-paper-light -rotate-6"
            >
              VS
            </span>
          )
        )}
      </div>
      <dl>
        {rows.map(([label, va, vb]) => (
          <div key={label} className="grid grid-cols-[1fr_96px_1fr] items-center gap-2 px-3 py-2.5 border-b border-dashed border-ink/25 last:border-b-0">
            <dd className="text-center text-[15px] font-semibold text-ink truncate">{va}</dd>
            <dt className="text-center font-display font-extrabold uppercase tracking-[0.06em] text-[12px] text-text-muted">
              {label}
            </dt>
            <dd className="text-center text-[15px] font-semibold text-ink truncate">{vb}</dd>
          </div>
        ))}
      </dl>
    </motion.section>
  );
}

function DetailCard({
  Icon,
  label,
  value,
  accent,
}: {
  Icon: typeof IconFlag;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={accent ? "border-[3px] border-ink bg-pink-soft p-4 flex gap-3" : "paper p-4 flex gap-3"}
    >
      <Icon size={34} className="text-ink shrink-0" />
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-display font-black uppercase text-[19px] leading-none text-ink">{label}</span>
        <p className="text-[15px] leading-relaxed text-ink">{value}</p>
      </div>
    </motion.div>
  );
}

interface MatchReportProps {
  matchResult: MatchResult;
  profileA: UserProfile;
  profileB: UserProfile;
}

export default function MatchReport({ matchResult, profileA, profileB }: MatchReportProps) {
  const combined = threatTone(matchResult.combined_threat_level);
  const compat = Math.round(matchResult.compatibility_score);

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-5 px-4 py-8 max-w-[680px] mx-auto w-full"
    >
      {/* Fight poster */}
      <motion.header variants={itemVariants} className="paper overflow-hidden" style={{ borderRadius: 4 }}>
        <p className="bg-ink text-yellow text-center font-display font-black uppercase tracking-[0.1em] text-[14px] py-1.5">
          Senti.AI match report
        </p>
        <div className="px-4 sm:px-6 pt-4 pb-5 flex flex-col items-center gap-4 text-center">
          <RevealText
            text={matchResult.match_headline}
            as="h1"
            className="font-display font-black uppercase text-[36px] sm:text-[48px] leading-[0.9] text-ink"
          />
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <span className="font-display font-black text-[88px] leading-[0.8] text-ink misprint tabular-nums">
                {compat}
                <span className="text-[40px]">%</span>
              </span>
              <span className="font-display font-extrabold uppercase tracking-[0.08em] text-[13px] text-text-muted mt-1">
                Compatibility
              </span>
            </div>
            <motion.span
              initial={{ scale: 2.4, rotate: -24, opacity: 0 }}
              animate={{ scale: 1, rotate: -8, opacity: 1 }}
              transition={{ ...popSpring, delay: 0.9 }}
              className="stamp text-[20px]"
              style={{ color: combined.color }}
            >
              {combined.label}
            </motion.span>
          </div>
          <p className="font-hand text-[19px] text-pink-ink">
            {compat >= 70 ? "Suspiciously okay. Mag-ingat." : compat >= 40 ? "Mabubuhay kayo. Barely." : "God help you both."}
          </p>
        </div>
      </motion.header>

      <TaleOfTheTape a={profileA} b={profileB} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DetailCard Icon={IconAnxious} label="Who texts first" value={matchResult.who_texts_first} />
        <DetailCard Icon={IconAvoidant} label="Who ghosts first" value={matchResult.who_ghosts_first} />
      </div>
      <DetailCard Icon={IconTime} label="Talking stage duration" value={matchResult.talking_stage_duration} />
      <DetailCard Icon={IconFlag} label="Biggest red flag combo" value={matchResult.biggest_red_flag_combo} accent />
      <DetailCard Icon={IconMusic} label="Playlist analysis" value={matchResult.song_overlap_roast} />
      <DetailCard Icon={IconSparkle} label="Relationship prediction" value={matchResult.relationship_prediction} />

      <motion.blockquote variants={itemVariants} className="relative paper px-5 sm:px-6 pt-9 pb-5">
        <span aria-hidden className="absolute -top-2 left-3 font-serif font-black text-[104px] leading-none text-pink">
          &ldquo;
        </span>
        <p className="relative font-serif italic text-[22px] sm:text-[25px] leading-[1.25] text-ink">
          {matchResult.final_match_verdict}
        </p>
        <footer className="mt-3 font-display font-extrabold uppercase tracking-[0.05em] text-[14px] text-text-muted">
          — Final match verdict
        </footer>
      </motion.blockquote>
    </motion.div>
  );
}
