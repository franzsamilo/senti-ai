"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/**
 * The "'D ako bobo" screen — built to be screenshotted. It's the sign a
 * sari-sari store hangs on the grille when it's closed: painted board on a
 * string from a nail, with the house rule underneath ("Bawal ang utang",
 * here "Bawal ang pang-tatlo").
 */
export default function RateLimitBlock() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-5 py-10 text-center gap-8">
      <motion.div
        initial={{ rotate: -14, y: -40, opacity: 0 }}
        animate={{ rotate: [-14, 5, -3.5, 1.5, -2], y: 0, opacity: 1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        style={{ transformOrigin: "50% -60px" }}
        className="relative w-full max-w-[360px]"
      >
        {/* nail + string */}
        <svg viewBox="0 0 200 64" className="absolute -top-[62px] left-0 w-full h-[64px]" aria-hidden="true">
          <path d="M100 6 L30 62 M100 6 L170 62" stroke="#1d1932" strokeWidth={2} fill="none" />
          <circle cx={100} cy={6} r={5} fill="#8c8597" stroke="#1d1932" strokeWidth={2} />
        </svg>
        <div
          className="rounded-[10px] border-[3px] border-ink bg-yellow px-5 pt-4 pb-5 flex flex-col items-center gap-1"
          style={{ boxShadow: "inset 0 0 0 5px var(--yellow), inset 0 0 0 7px rgba(29,25,50,0.55), 6px 6px 0 var(--ink)" }}
        >
          <h1 className="signpaint font-display font-black uppercase text-[78px] sm:text-[92px] leading-[0.85]" style={{ color: "#e2402b" }}>
            Sarado
          </h1>
          <p className="font-display font-black uppercase text-[26px] leading-none text-ink mt-2">
            Bawal ang pang-tatlo.
          </p>
          <p className="font-display font-black uppercase text-[22px] leading-none text-pink-ink">Bukas pwede.</p>
        </div>
      </motion.div>

      <blockquote className="paper px-5 py-4 max-w-sm text-left -rotate-1">
        <p className="font-serif italic text-[20px] leading-snug text-ink">
          &ldquo;The creator of Senti.AI believed in second chances… …not a third though. &apos;D ako
          bobo.&rdquo;
        </p>
        <footer className="mt-2 font-display font-extrabold uppercase tracking-[0.05em] text-[14px] text-text-muted">
          — Management
        </footer>
      </blockquote>

      <div className="flex flex-col gap-1 font-hand text-[18px] text-text-secondary">
        <p>[Your emotional damage has been noted.]</p>
        <p>[Come back tomorrow or use a different browser idc]</p>
      </div>

      <Link
        href="/history"
        className="min-h-[44px] inline-flex items-center font-display font-extrabold uppercase tracking-[0.04em] text-[15px] text-pink-ink underline decoration-2 underline-offset-4"
      >
        Revisit your past reports
      </Link>
    </div>
  );
}
