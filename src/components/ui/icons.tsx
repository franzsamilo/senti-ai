/**
 * The icon set, drawn for this app on a 24×24 grid.
 *
 * Every glyph is two print passes: a flat spot-colour shape, then bold ink
 * line art laid over it 1.4px out of register — the riso look the rest of
 * the UI is printed in. Line art uses `currentColor`, so selection state
 * still flows from the parent; the spot colour comes from the `tone` prop or
 * the `--icon-spot` custom property (pink by default). `tone="none"` prints
 * the ink pass only.
 *
 * The subjects are specific on purpose: anxious is a phone vibrating with
 * "typing…", avoidant is a door already open, disorganized is a yo-yo,
 * gifts is a pasalubong box, edit is a No. 2 pencil, share is an
 * eroplanong papel.
 */

import type { ReactNode, SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  /** Spot-ink colour under the line art; "none" to omit it. */
  tone?: string;
};

function Icon({
  size = 24,
  tone,
  spot,
  strokeWidth = 2,
  children,
  ...props
}: IconProps & { spot?: ReactNode }) {
  const fill = tone ?? "var(--icon-spot, #ff4f9a)";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {spot && fill !== "none" && (
        <g transform="translate(1.4 1.4)" fill={fill} stroke="none">
          {spot}
        </g>
      )}
      <g
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </g>
    </svg>
  );
}

/* ────────────────────────────────────────────────
   Attachment styles
   ──────────────────────────────────────────────── */

/** Anxious — a phone buzzing with "typing…" that never becomes a message. */
export const IconAnxious = (p: IconProps) => (
  <Icon {...p} spot={<rect x={5.5} y={2} width={11} height={19.5} rx={2.5} />}>
    <rect x={5.5} y={2} width={11} height={19.5} rx={2.5} />
    <path d="M9.5 18.2h3" />
    <circle cx={8.6} cy={10.5} r={0.6} fill="currentColor" />
    <circle cx={11} cy={10.5} r={0.6} fill="currentColor" />
    <circle cx={13.4} cy={10.5} r={0.6} fill="currentColor" />
    <path d="M19.5 8v4.5M21.8 6.8v6.9M2.6 9v3" />
  </Icon>
);

/** Avoidant — the door's already open and someone's already gone. */
export const IconAvoidant = (p: IconProps) => (
  <Icon {...p} spot={<path d="M4.5 3.5 11 6v16l-6.5-1.5z" />}>
    <path d="M4.5 3.5h9.5V21" />
    <path d="M4.5 3.5 11 6v16l-6.5-1.5z" />
    <circle cx={9.3} cy={13.5} r={0.5} fill="currentColor" />
    <path d="M16 12.5h5.5M19 10l2.5 2.5L19 15M2.5 21h4" />
  </Icon>
);

/** Disorganized — a yo-yo: away, back, away, back. */
export const IconDisorganized = (p: IconProps) => (
  <Icon {...p} spot={<circle cx={12} cy={15.5} r={5.5} />}>
    <circle cx={12} cy={15.5} r={5.5} />
    <circle cx={12} cy={15.5} r={1.5} />
    <path d="M12 10V2.5M10.3 2.5h3.4" />
    <path d="M4.2 9.5c.5-1.4 1.4-2.6 2.6-3.5M19.8 9.5c-.5-1.4-1.4-2.6-2.6-3.5" />
  </Icon>
);

/** Secure — locked, with a heart for a keyhole. Allegedly. */
export const IconSecure = (p: IconProps) => (
  <Icon {...p} spot={<rect x={4.5} y={10.5} width={15} height={10.5} rx={2} />}>
    <rect x={4.5} y={10.5} width={15} height={10.5} rx={2} />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    <path d="M12 18.4s-2.5-1.5-2.5-3.2a1.25 1.25 0 0 1 2.5-.4 1.25 1.25 0 0 1 2.5.4c0 1.7-2.5 3.2-2.5 3.2z" />
  </Icon>
);

/* ────────────────────────────────────────────────
   Love languages
   ──────────────────────────────────────────────── */

const BUBBLE =
  "M4 4.5h16A1.5 1.5 0 0 1 21.5 6v9a1.5 1.5 0 0 1-1.5 1.5h-10L5.5 20v-3.5H4A1.5 1.5 0 0 1 2.5 15V6A1.5 1.5 0 0 1 4 4.5z";

/** Words — a speech bubble, mid-paragraph. */
export const IconWords = (p: IconProps) => (
  <Icon {...p} spot={<path d={BUBBLE} />}>
    <path d={BUBBLE} />
    <path d="M6.5 9h11M6.5 12.5h7" />
  </Icon>
);

const WRENCH =
  "M14.5 4.5a4.5 4.5 0 0 0-5.8 5.6L3.5 15.3a2.1 2.1 0 0 0 3 3l5.2-5.2a4.5 4.5 0 0 0 5.6-5.8l-2.7 2.7-2.6-.4-.4-2.6z";

/** Acts of service — a wrench. You fixed their sink; they fixed nothing. */
export const IconActs = (p: IconProps) => (
  <Icon {...p} spot={<path d={WRENCH} />}>
    <path d={WRENCH} />
    <path d="M18.5 15.5v3M17 17h3" />
  </Icon>
);

/** Gifts — a pasalubong box, ribbon and all. */
export const IconGifts = (p: IconProps) => (
  <Icon {...p} spot={<rect x={4} y={10.5} width={16} height={10} rx={1} />}>
    <rect x={4} y={10.5} width={16} height={10} rx={1} />
    <rect x={3} y={7} width={18} height={3.5} rx={1} />
    <path d="M12 7v13.5" />
    <path d="M12 7c-1.4-3.4-5.4-3.6-5.1-1.2.2 1.4 2.9 1.2 5.1 1.2zm0 0c1.4-3.4 5.4-3.6 5.1-1.2-.2 1.4-2.9 1.2-5.1 1.2z" />
  </Icon>
);

/** Quality time — an alarm clock that went off at 3AM for no reason. */
export const IconTime = (p: IconProps) => (
  <Icon {...p} spot={<circle cx={12} cy={13} r={7} />}>
    <circle cx={12} cy={13} r={7.2} />
    <path d="M12 9.3V13l2.6 1.8" />
    <path d="M3.8 6.8 6.6 4M20.2 6.8 17.4 4M7.2 19.4l-1.6 2.1M16.8 19.4l1.6 2.1" />
  </Icon>
);

/** Physical touch — an open hand, waiting. */
export const IconTouch = (p: IconProps) => (
  <Icon {...p} spot={<path d="M7.5 12.5h12v2.5c0 4-3 6.5-7 6.5-3 0-4.8-1.8-6-4z" />}>
    <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10.5V4a1.5 1.5 0 0 1 3 0v6.5M14 10.5V5.5a1.5 1.5 0 0 1 3 0V12" />
    <path d="M17 9.5a1.5 1.5 0 0 1 3 0V14c0 4-3 7-7 7h-1c-3 0-4.5-1.5-6-4l-2.3-4a1.5 1.5 0 0 1 2.6-1.5L8 13" />
  </Icon>
);

/* ────────────────────────────────────────────────
   Interface
   ──────────────────────────────────────────────── */

export const IconSearch = (p: IconProps) => (
  <Icon {...p} spot={<circle cx={10.5} cy={10.5} r={6} />}>
    <circle cx={10.5} cy={10.5} r={6.5} />
    <path d="m15.5 15.5 5 5" />
  </Icon>
);

export const IconClose = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const IconCheck = (p: IconProps) => (
  <Icon {...p}>
    <path d="m4.5 12.5 4.5 4.5L19.5 6.5" />
  </Icon>
);

export const IconArrowLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19.5 12h-15M10.5 6l-6 6 6 6" />
  </Icon>
);

export const IconArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </Icon>
);

export const IconLock = (p: IconProps) => (
  <Icon {...p} spot={<rect x={5} y={10.5} width={14} height={10} rx={2} />}>
    <rect x={5} y={10.5} width={14} height={10} rx={2} />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5V17" />
  </Icon>
);

/** A banderitas pennant. */
export const IconFlag = (p: IconProps) => (
  <Icon {...p} tone={p.tone ?? "#e2402b"} spot={<path d="M6 4l13 4-13 4z" />}>
    <path d="M6 21V3" />
    <path d="M6 4l13 4-13 4" />
  </Icon>
);

/** Eroplanong papel. */
export const IconShare = (p: IconProps) => (
  <Icon {...p} spot={<path d="M21 3 3 10.5l7.5 3L14 21z" />}>
    <path d="M21 3 3 10.5l7.5 3L14 21 21 3z" />
    <path d="M10.5 13.5 21 3" />
  </Icon>
);

/** A transistor-radio antenna, broadcasting. */
export const IconSignal = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 21v-9.5" />
    <circle cx={12} cy={9} r={1.6} fill="currentColor" />
    <path d="M8 5.2a5.8 5.8 0 0 0 0 7.6M16 5.2a5.8 5.8 0 0 1 0 7.6M5 2.6a9.8 9.8 0 0 0 0 12.8M19 2.6a9.8 9.8 0 0 1 0 12.8" />
  </Icon>
);

export const IconTarget = (p: IconProps) => (
  <Icon {...p} spot={<circle cx={12} cy={12} r={4} />}>
    <circle cx={12} cy={12} r={8.5} />
    <circle cx={12} cy={12} r={4} />
    <path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4" />
  </Icon>
);

/** Music is a cassette here. Of course it is. */
export const IconMusic = (p: IconProps) => (
  <Icon {...p} spot={<rect x={2.5} y={5.5} width={19} height={13} rx={2} />}>
    <rect x={2.5} y={5.5} width={19} height={13} rx={2} />
    <circle cx={8.5} cy={11.5} r={2} />
    <circle cx={15.5} cy={11.5} r={2} />
    <path d="M10.5 11.5h3M6.5 18.5l1.5-3h8l1.5 3" />
  </Icon>
);

export const IconPlus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

const SPARK = "M11 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7z";

export const IconSparkle = (p: IconProps) => (
  <Icon {...p} tone={p.tone ?? "#ffd23a"} spot={<path d={SPARK} />}>
    <path d={SPARK} />
    <path d="M19 15.5v4M17 17.5h4" />
  </Icon>
);

/** The videoke trophy — singing's only reward. */
export const IconTrophy = (p: IconProps) => (
  <Icon {...p} tone={p.tone ?? "#ffd23a"} spot={<path d="M7 3.5h10v5.5a5 5 0 0 1-10 0z" />}>
    <path d="M7 3.5h10v5.5a5 5 0 0 1-10 0V3.5z" />
    <path d="M7 5.5H4.5V7a3 3 0 0 0 2.8 3M17 5.5h2.5V7a3 3 0 0 1-2.8 3" />
    <path d="M12 14v3.5M8 20.5h8M9.6 20.5l.5-3h3.8l.5 3" />
  </Icon>
);

export const IconHistory = (p: IconProps) => (
  <Icon {...p} spot={<circle cx={12.5} cy={12} r={7} />}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
    <path d="M3.5 4v4h4M12 7.5V12l3 2" />
  </Icon>
);

/** A tear-off kalendaryo from the sari-sari store. */
export const IconCalendar = (p: IconProps) => (
  <Icon {...p} spot={<rect x={4} y={5} width={16} height={5} />}>
    <rect x={4} y={5} width={16} height={15.5} rx={1.5} />
    <path d="M4 10h16M8 3v4M16 3v4M8 14h3M13 14h3M8 17h3" />
  </Icon>
);

export const IconDownload = (p: IconProps) => (
  <Icon {...p} spot={<rect x={4} y={15.5} width={16} height={5} rx={1.5} />}>
    <path d="M12 3.5v11M7.5 10.5 12 15l4.5-4.5" />
    <path d="M4 15.5V19a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-3.5" />
  </Icon>
);

export const IconLink = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 14a4.2 4.2 0 0 0 6 0l3-3a4.2 4.2 0 0 0-6-6l-1 1" />
    <path d="M14 10a4.2 4.2 0 0 0-6 0l-3 3a4.2 4.2 0 0 0 6 6l1-1" />
  </Icon>
);

export const IconRefresh = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9" />
    <path d="M18.5 3v4.5H14M5.5 21v-4.5H10" />
  </Icon>
);

const HEART =
  "M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z";

export const IconHeart = (p: IconProps) => (
  <Icon {...p} spot={<path d={HEART} />}>
    <path d={HEART} />
  </Icon>
);

/** Sawi. */
export const IconBrokenHeart = (p: IconProps) => (
  <Icon {...p} spot={<path d={HEART} />}>
    <path d={HEART} />
    <path d="m12 7-1.6 4 3 2-1.6 3.6" />
  </Icon>
);

/** A No. 2 pencil — the one you shade answer sheets with. */
export const IconEdit = (p: IconProps) => (
  <Icon {...p} tone={p.tone ?? "#ffd23a"} spot={<path d="m15.5 4.5 4 4L9 19l-5 1 1-5z" />}>
    <path d="m15.5 4.5 4 4L9 19l-5 1 1-5L15.5 4.5z" />
    <path d="m13.5 6.5 4 4M5 15l4 4" />
  </Icon>
);

/* ────────────────────────────────────────────────
   Zodiac — glyphs set on a spot disc, like the
   horoscope column in a tabloid
   ──────────────────────────────────────────────── */

function Glyph({ d, ...p }: IconProps & { d: string }) {
  return (
    <Icon {...p} spot={<circle cx={12} cy={12} r={8.5} />}>
      <path d={d} />
    </Icon>
  );
}

export const IconAries = (p: IconProps) => (
  <Glyph
    {...p}
    d="M12 20V10.5M12 10.5C12 6.5 10.3 4.5 7.8 4.5S4.5 6.4 4.5 8.4c0 1.8 1.2 3 2.6 3.1M12 10.5c0-4 1.7-6 4.2-6s3.3 1.9 3.3 3.9c0 1.8-1.2 3-2.6 3.1"
  />
);

export const IconTaurus = (p: IconProps) => (
  <Glyph
    {...p}
    d="M16.8 15a4.8 4.8 0 1 1-9.6 0 4.8 4.8 0 0 1 9.6 0zM4.5 4.5c.8 3.6 3.6 5.7 7.5 5.7s6.7-2.1 7.5-5.7"
  />
);

export const IconGemini = (p: IconProps) => (
  <Glyph {...p} d="M5 4.5c4.5 1.6 9.5 1.6 14 0M5 19.5c4.5-1.6 9.5-1.6 14 0M9 5.6v12.8M15 5.6v12.8" />
);

export const IconCancer = (p: IconProps) => (
  <Glyph
    {...p}
    d="M10 9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM19 14.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM7.5 7c3-2.7 9-3 12.5.2M16.5 17c-3 2.7-9 3-12.5-.2"
  />
);

export const IconLeo = (p: IconProps) => (
  <Glyph
    {...p}
    d="M10.3 15.5a2.8 2.8 0 1 1-5.6 0 2.8 2.8 0 0 1 5.6 0zM10.3 15.5c0-3-1.8-5-1.8-7.6a3.9 3.9 0 0 1 7.8 0c0 3.3-3 6.1-3 9.6a2.3 2.3 0 0 0 4.6.1"
  />
);

export const IconVirgo = (p: IconProps) => (
  <Glyph
    {...p}
    d="M3.5 6.5c1.4 0 2.3.9 2.3 2.5V19M5.8 9.5a2.4 2.4 0 0 1 4.8 0V19M10.6 9.5a2.4 2.4 0 0 1 4.8 0v6c0 2.4 1.4 4 3.6 4M15.4 15c1.4-2.6 4.6-3.2 4.6-.8 0 2-2.4 3.9-5.6 5.8"
  />
);

export const IconLibra = (p: IconProps) => (
  <Glyph {...p} d="M4 19.5h16M4 15.5h4.6a4.3 4.3 0 1 1 6.8 0H20" />
);

export const IconScorpio = (p: IconProps) => (
  <Glyph
    {...p}
    d="M3.5 6.5c1.4 0 2.3.9 2.3 2.5V19M5.8 9.5a2.4 2.4 0 0 1 4.8 0V19M10.6 9.5a2.4 2.4 0 0 1 4.8 0v7c0 1.8 1 2.8 2.8 2.8h2M18.8 17.3l2.2 2-2.2 2"
  />
);

export const IconSagittarius = (p: IconProps) => (
  <Glyph {...p} d="M5 19 19 5M12.5 5H19v6.5M7 11.5l5.5 5.5" />
);

export const IconCapricorn = (p: IconProps) => (
  <Glyph
    {...p}
    d="M3.5 6c1.6 0 2.6 1.2 3 3l2.5 9 3-11.5c.3-1.2 1.2-1.8 2.2-1.8s1.8.8 1.8 2v8.3c0 2.2 1 3.5 2.6 3.5a2.6 2.6 0 1 0-2.6-3.2"
  />
);

export const IconAquarius = (p: IconProps) => (
  <Glyph
    {...p}
    d="m3.5 10 2.8-2.8L9.2 10 12 7.2l2.9 2.8 2.8-2.8 2.8 2.8M3.5 16.5l2.8-2.8 2.9 2.8 2.8-2.8 2.9 2.8 2.8-2.8 2.8 2.8"
  />
);

export const IconPisces = (p: IconProps) => (
  <Glyph {...p} d="M6 4c3.2 4.2 3.2 11.8 0 16M18 4c-3.2 4.2-3.2 11.8 0 16M4.5 12h15" />
);

export const ZODIAC_ICONS: Record<string, (p: IconProps) => React.ReactElement> = {
  aries: IconAries,
  taurus: IconTaurus,
  gemini: IconGemini,
  cancer: IconCancer,
  leo: IconLeo,
  virgo: IconVirgo,
  libra: IconLibra,
  scorpio: IconScorpio,
  sagittarius: IconSagittarius,
  capricorn: IconCapricorn,
  aquarius: IconAquarius,
  pisces: IconPisces,
};
