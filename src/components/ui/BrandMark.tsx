interface BrandMarkProps {
  size?: number;
  /** Animate the equalizer bars. */
  live?: boolean;
}

/**
 * The mark: an equalizer inside a rounded tile — a song playing, read as a
 * signal. Bars use CSS keyframes, so they stop under reduced motion.
 */
export default function BrandMark({ size = 40, live = true }: BrandMarkProps) {
  const heights = [0.45, 0.85, 0.6, 1, 0.55];
  return (
    <span
      aria-hidden="true"
      className="inline-grid place-items-center rounded-[30%] shrink-0"
      style={{
        width: size,
        height: size,
        background: "var(--dusk-button)",
        boxShadow: "var(--shadow-glow)",
      }}
    >
      <span className="flex items-end gap-[8%]" style={{ height: "46%", width: "56%" }}>
        {heights.map((h, i) => (
          <span
            key={i}
            className={`flex-1 rounded-full bg-white ${live ? "eq-bar" : ""}`}
            style={{
              height: `${h * 100}%`,
              animationDelay: `${i * 0.13}s`,
              opacity: 0.95,
            }}
          />
        ))}
      </span>
    </span>
  );
}
