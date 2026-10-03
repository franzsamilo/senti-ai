import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import BrandMark from "@/components/ui/BrandMark";
import { IconArrowRight, IconShare, IconTrophy, IconUsers } from "@/components/ui/icons";

/**
 * Landing for barkada mode. The home page linked to /barkada for a long time
 * while only /barkada/[id] existed — this is the page that link always meant.
 */
export default function BarkadaIndexPage() {
  const steps = [
    { Icon: IconUsers, title: "Take your scan", body: "Go through the full assessment and get your report." },
    { Icon: IconShare, title: "Create the group", body: "On your results, tap Barkada mode, add a nickname, share the link." },
    { Icon: IconTrophy, title: "Hand out the awards", body: "Most Sawi, Most Delulu, Most Likely to Drunk Text — up to 10 friends." },
  ];

  return (
    <main className="min-h-screen flex flex-col max-w-[680px] mx-auto px-4">
      <nav className="py-5">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <BrandMark size={32} />
          <span className="font-display font-bold text-[18px] text-text-primary">Senti.AI</span>
        </Link>
      </nav>

      <section className="flex-1 flex flex-col gap-7 py-8">
        <div className="flex flex-col gap-3">
          <span className="self-start text-[13px] font-medium rounded-full px-3 py-1 bg-white/70 border border-white text-text-secondary">
            Barkada mode
          </span>
          <h1 className="text-[38px] sm:text-[48px] font-extrabold leading-[1.05] text-text-primary">
            Sino ang pinaka-<span className="text-dusk">sawi</span>{" "}sa inyo?
          </h1>
          <p className="text-[16px] text-text-secondary leading-relaxed">
            One group link, everyone&apos;s scans side by side, and awards nobody asked for. Groups last a week.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {steps.map(({ Icon, title, body }, i) => (
            <div key={title} className="glass rounded-2xl p-4 flex gap-3.5 items-start">
              <span className="grid place-items-center w-10 h-10 rounded-xl text-white shrink-0" style={{ background: "var(--dusk-button)" }}>
                <Icon size={19} />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[12px] text-text-muted">Step {i + 1}</span>
                <span className="font-display text-[16px] font-semibold text-text-primary">{title}</span>
                <span className="text-[14px] text-text-secondary">{body}</span>
              </span>
            </div>
          ))}
        </div>

        <LinkButton href="/" className="w-full py-4">
          Start my scan <IconArrowRight size={18} />
        </LinkButton>
      </section>
    </main>
  );
}
