import Link from "next/link";
import type { ReactNode } from "react";
import BrandMark, { Wordmark } from "@/components/ui/BrandMark";

/**
 * Masthead for the standalone pages (leaderboard, history): the brand as the
 * paper's nameplate, a section kicker, a headline set in signage caps and a
 * double rule under it — the same front-page grammar as the landing page.
 */
export default function PageHeader({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 pt-3">
      <nav className="flex items-center justify-between gap-3 pb-2 border-b-2 border-ink">
        <Link href="/" className="inline-flex items-center gap-2 min-h-[44px]" aria-label="Senti.AI home">
          <BrandMark size={34} live={false} />
          <Wordmark className="text-[22px]" />
        </Link>
        <span className="font-display font-extrabold uppercase tracking-[0.06em] text-[13px] text-ink">{kicker}</span>
      </nav>
      <h1 className="font-display font-black uppercase text-[46px] sm:text-[64px] leading-[0.86] text-ink pt-2">{title}</h1>
      {subtitle && <p className="text-[16px] text-text-secondary">{subtitle}</p>}
      <div className="border-t-[5px] border-double border-ink mt-1" />
    </header>
  );
}
