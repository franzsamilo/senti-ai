/**
 * Hand-drawn icon set. Every glyph is line art on a 24×24 grid, stroked with
 * `currentColor` so it inherits selection state from its parent — no emoji, no
 * icon-font dependency, nothing that ships with a template.
 *
 * Zodiac signs are drawn as star charts rather than the usual astrological
 * glyphs: dots for stars, thin lines for the constellation. It reads as
 * instrumentation rather than horoscope, which is the register the rest of the
 * dashboard is in.
 */

import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/* ────────────────────────────────────────────────
   Attachment styles
   ──────────────────────────────────────────────── */

/** Anxious — a heartbeat trace that spikes past its own baseline. */
export const IconAnxious = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2 12h3.5l2-6 3 13 2.5-9 2 5 2-3H22" />
  </Svg>
);

/** Avoidant — a figure already through the doorway, arrow pointing out. */
export const IconAvoidant = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13 3H5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8" />
    <path d="M16 12h6" />
    <path d="m19 9 3 3-3 3" />
  </Svg>
);

/** Disorganized — arrows pulling toward and away at the same time. */
export const IconDisorganized = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 8h7" />
    <path d="m7.5 5 3 3-3 3" />
    <path d="M21 16h-7" />
    <path d="m16.5 13-3 3 3 3" />
    <path d="M12 3.5v3M12 17.5v3" />
  </Svg>
);

/** Secure — a plumb line at rest, weight centred. */
export const IconSecure = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v11" />
    <circle cx="12" cy="17" r="3.2" />
    <path d="M5 8h14" />
    <path d="M7.5 8a4.5 4.5 0 0 1-3 4M16.5 8a4.5 4.5 0 0 0 3 4" />
  </Svg>
);

/* ────────────────────────────────────────────────
   Love languages
   ──────────────────────────────────────────────── */

/** Words — a speech bubble mid-sentence. */
export const IconWords = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 4H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3v4l4.5-4H20a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1Z" />
    <path d="M7 8.5h10M7 12h6" />
  </Svg>
);

/** Acts of service — a wrench, doing the thing nobody asked for. */
export const IconActs = (p: IconProps) => (
  <Svg {...p}>
    <path d="M15.5 3a5.5 5.5 0 0 0-5 7.8L3.6 17.7a2 2 0 0 0 2.8 2.8l6.9-6.9A5.5 5.5 0 0 0 20.5 6l-3 3-2.5-2.5 3-3A5.5 5.5 0 0 0 15.5 3Z" />
  </Svg>
);

/** Gifts — a wrapped box, ribbon crossing the lid. */
export const IconGifts = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 9.5h18v3H3z" />
    <path d="M4.5 12.5v7a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-7" />
    <path d="M12 9.5v11" />
    <path d="M12 9.5C10.5 6 9 4.5 7.5 5s-1 4 4.5 4.5ZM12 9.5c1.5-3.5 3-5 4.5-4.5s1 4-4.5 4.5Z" />
  </Svg>
);

/** Quality time — an hourglass, sand already committed. */
export const IconTime = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 3h11M6.5 21h11" />
    <path d="M7.5 3v3.2c0 1 .4 1.9 1.1 2.6L12 12l-3.4 3.2c-.7.7-1.1 1.6-1.1 2.6V21" />
    <path d="M16.5 3v3.2c0 1-.4 1.9-1.1 2.6L12 12l3.4 3.2c.7.7 1.1 1.6 1.1 2.6V21" />
    <path d="M9.5 18.5h5" />
  </Svg>
);

/** Physical touch — two hands almost meeting. */
export const IconTouch = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9.5 13V5.5a1.5 1.5 0 0 1 3 0V11" />
    <path d="M12.5 10.5V9a1.5 1.5 0 0 1 3 0v2.5" />
    <path d="M15.5 11.5v-.5a1.5 1.5 0 0 1 3 0V16a5 5 0 0 1-5 5h-1.6a5 5 0 0 1-3.9-1.9l-2.7-3.4a1.5 1.5 0 0 1 2.2-2l1.9 1.8" />
  </Svg>
);

/* ────────────────────────────────────────────────
   UI
   ──────────────────────────────────────────────── */

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 4.5 4.5" />
  </Svg>
);

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="m4 12.5 5 5L20 6.5" />
  </Svg>
);

export const IconArrowLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 12H5" />
    <path d="m11 6-6 6 6 6" />
  </Svg>
);

export const IconArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </Svg>
);

export const IconLock = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4.5" y="10" width="15" height="10.5" rx="1.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    <path d="M12 14v2.5" />
  </Svg>
);

export const IconSpotify = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M7.5 9.2c3-.8 6.2-.5 8.9 1M8 12.4c2.5-.7 5.1-.4 7.3.9M8.6 15.5c2-.5 4.1-.3 5.9.7" />
  </Svg>
);

export const IconFlag = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 21V4" />
    <path d="M5 4.5h11l-2.2 3.6L16 12H5" />
  </Svg>
);

export const IconShare = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 15V3" />
    <path d="m8 7 4-4 4 4" />
    <path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
  </Svg>
);

/** Signal bars — used for the intensity meter label. */
export const IconSignal = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 19v-4M9.3 19v-8M14.7 19v-11M20 19V5" />
  </Svg>
);

/** Crosshair — section marker for assessment readouts. */
export const IconTarget = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </Svg>
);

/* ────────────────────────────────────────────────
   Zodiac — constellation charts
   ──────────────────────────────────────────────── */

type Star = [number, number];

/** Renders a constellation: polyline first, stars on top. */
function Constellation({
  stars,
  links,
  ...props
}: IconProps & { stars: Star[]; links: number[][] }) {
  return (
    <Svg {...props}>
      <g opacity={0.55}>
        {links.map((path, i) => (
          <polyline
            key={i}
            points={path.map((s) => stars[s].join(",")).join(" ")}
            fill="none"
          />
        ))}
      </g>
      {stars.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={1.15} fill="currentColor" stroke="none" />
      ))}
    </Svg>
  );
}

export const IconAries = (p: IconProps) => (
  <Constellation
    {...p}
    stars={[[5, 7], [9, 5], [14, 7], [18, 6], [16, 12], [12, 16]]}
    links={[[0, 1, 2, 3], [2, 4, 5]]}
  />
);

export const IconTaurus = (p: IconProps) => (
  <Constellation
    {...p}
    stars={[[4, 6], [8, 9], [12, 11], [16, 9], [20, 6], [12, 16], [9, 18]]}
    links={[[0, 1, 2, 3, 4], [2, 5, 6]]}
  />
);

export const IconGemini = (p: IconProps) => (
  <Constellation
    {...p}
    stars={[[7, 4], [7, 11], [7, 18], [16, 4], [16, 11], [16, 18]]}
    links={[[0, 1, 2], [3, 4, 5], [1, 4]]}
  />
);

export const IconCancer = (p: IconProps) => (
  <Constellation
    {...p}
    stars={[[5, 8], [10, 10], [14, 7], [17, 12], [12, 15], [7, 18]]}
    links={[[0, 1, 2], [1, 3], [1, 4, 5]]}
  />
);

export const IconLeo = (p: IconProps) => (
  <Constellation
    {...p}
    stars={[[6, 6], [10, 4], [14, 6], [15, 11], [11, 13], [7, 12], [19, 16]]}
    links={[[0, 1, 2, 3, 4, 5, 0], [3, 6]]}
  />
);

export const IconVirgo = (p: IconProps) => (
  <Constellation
    {...p}
    stars={[[4, 5], [8, 8], [12, 6], [15, 10], [12, 14], [17, 17], [8, 17]]}
    links={[[0, 1, 2, 3, 5], [1, 6], [3, 4]]}
  />
);

export const IconLibra = (p: IconProps) => (
  <Constellation
    {...p}
    stars={[[12, 5], [6, 10], [18, 10], [5, 16], [19, 16]]}
    links={[[1, 0, 2], [1, 3], [2, 4]]}
  />
);

export const IconScorpio = (p: IconProps) => (
  <Constellation
    {...p}
    stars={[[4, 5], [7, 8], [10, 11], [13, 14], [16, 16], [19, 14], [18, 10]]}
    links={[[0, 1, 2, 3, 4, 5, 6]]}
  />
);

export const IconSagittarius = (p: IconProps) => (
  <Constellation
    {...p}
    stars={[[5, 18], [9, 13], [14, 9], [19, 5], [15, 5], [19, 9]]}
    links={[[0, 1, 2, 3], [3, 4], [3, 5]]}
  />
);

export const IconCapricorn = (p: IconProps) => (
  <Constellation
    {...p}
    stars={[[5, 7], [9, 5], [14, 8], [18, 6], [16, 13], [10, 16], [6, 13]]}
    links={[[0, 1, 2, 3, 4, 5, 6, 0]]}
  />
);

export const IconAquarius = (p: IconProps) => (
  <Constellation
    {...p}
    stars={[[4, 9], [7, 6], [10, 9], [13, 6], [16, 9], [19, 6], [11, 16]]}
    links={[[0, 1, 2, 3, 4, 5], [2, 6]]}
  />
);

export const IconPisces = (p: IconProps) => (
  <Constellation
    {...p}
    stars={[[5, 5], [8, 9], [12, 12], [16, 15], [19, 19], [17, 9], [7, 17]]}
    links={[[0, 1, 2, 3, 4], [2, 5], [2, 6]]}
  />
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
