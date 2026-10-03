/**
 * The dusk sky behind every page: a few large, heavily blurred colour fields
 * drifting slowly, plus a whisper of grain so the gradients don't band.
 *
 * Pure CSS (transform-only keyframes) instead of the old canvas network — no
 * per-frame JavaScript, nothing to tear down between routes, and it stops
 * entirely under prefers-reduced-motion via the global rule in globals.css.
 */

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.3 0 0 0 0 0.1 0 0 0 0 0.35 0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export default function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
    >
      <div
        className="aurora-blob"
        style={{
          width: "60vmax",
          height: "60vmax",
          top: "-22vmax",
          left: "-16vmax",
          background: "radial-gradient(circle, #ffb199 0%, transparent 65%)",
          animation: "drift-a 26s ease-in-out infinite",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          width: "55vmax",
          height: "55vmax",
          top: "-10vmax",
          right: "-22vmax",
          background: "radial-gradient(circle, #ff8fb8 0%, transparent 65%)",
          animation: "drift-b 32s ease-in-out infinite",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          width: "65vmax",
          height: "65vmax",
          bottom: "-30vmax",
          left: "10vmax",
          background: "radial-gradient(circle, #c4a8ff 0%, transparent 65%)",
          animation: "drift-c 38s ease-in-out infinite",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.18] mix-blend-multiply"
        style={{ backgroundImage: GRAIN }}
      />
    </div>
  );
}
