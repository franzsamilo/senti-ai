interface BrandMarkProps {
  size?: number;
  /** Spin the reels. */
  live?: boolean;
}

/**
 * The mark: a mixtape. Pink shell printed a hair out of register with its
 * ink outline (two riso passes), cream label, two reels that turn while
 * something's playing. Reels use CSS keyframes, so they stop under reduced
 * motion.
 */
export default function BrandMark({ size = 40, live = true }: BrandMarkProps) {
  const reel = (cx: number) => (
    <g className={live ? "reel-spin" : undefined}>
      <circle cx={cx} cy={18.5} r={4} fill="#fffaf2" stroke="#1d1932" strokeWidth={1.6} />
      <path
        d={`M${cx} 15.6v5.8M${cx - 2.5} 17.05l5 2.9M${cx - 2.5} 19.95l5-2.9`}
        stroke="#1d1932"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
      {/* pink pass, offset */}
      <rect x={4.6} y={8.6} width={33} height={24} rx={3.5} fill="#ff4f9a" />
      {/* ink pass */}
      <rect x={3} y={7} width={33} height={24} rx={3.5} fill="none" stroke="#1d1932" strokeWidth={2} />
      <rect x={7} y={11} width={25} height={13.5} rx={2} fill="#fffaf2" stroke="#1d1932" strokeWidth={1.6} />
      <rect x={14.5} y={16.5} width={10} height={4} rx={2} fill="#1d1932" />
      {reel(12.5)}
      {reel(26.5)}
      <path d="M10 31l2.2-4.2h14.6L29 31" fill="none" stroke="#1d1932" strokeWidth={1.8} strokeLinejoin="round" />
    </svg>
  );
}

/** "SENTI.AI" set in signage caps, the dot printed in pink. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-black uppercase tracking-[0.02em] leading-none text-ink ${className}`}>
      Senti<span className="text-pink">.</span>AI
    </span>
  );
}
