import { Clock3, ShieldCheck, Users } from "lucide-react";
import {
  cardShadowClass,
  headingClass,
  sectionPad,
  textMuted,
} from "@/components/home/homeTheme";

const trustStats = [
  { value: "4.9/5", label: "Average client satisfaction" },
  { value: "82%", label: "Clients active after 8 weeks" },
  { value: "1 app", label: "Plans, chat, and progress in one place" },
];

const trustHighlights = [
  {
    icon: ShieldCheck,
    title: "Private and secure",
    description:
      "Secure platform with privacy-first practices, strict access controls, and no data sold.",
  },
  {
    icon: Clock3,
    title: "Designed for consistency",
    description:
      "Daily check-ins and habits are simple enough to follow even on busy schedules.",
  },
  {
    icon: Users,
    title: "Built for relationships",
    description:
      "Keep all communication, progress, and context in one place so nothing gets lost.",
  },
];

export default function TrustSection() {
  return (
    <section id="trust" className={`${sectionPad} bg-[#F8FAFC] py-14 md:py-20`}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="mb-4">
            <span className="inline-flex items-center rounded-full border border-[#6366F14D] bg-[#F8FAFC] px-3.5 py-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-[#6366F1]">
              Why teams stay with FitCoach
            </span>
          </p>

          <h2 className={`${headingClass} mb-4 text-[clamp(1.85rem,4.5vw,3rem)]`}>
            Practical tools. Measurable progress.
          </h2>

          {/* <p className={`mx-auto max-w-[65ch] text-base sm:text-lg ${textMuted}`}>
            FitCoach is made for real coaching businesses: clear structure for clients and less
            busywork for coaches.
          </p> */}
        </div>

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {trustStats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-[#1E293B0D] bg-[#EEF2FF] p-5 text-center"
            >
              <p className={`${headingClass} mb-1 text-3xl md:text-4xl`}>{stat.value}</p>
              <p className={`text-sm ${textMuted}`}>{stat.label}</p>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {trustHighlights.map((item) => (
            <article key={item.title} className={`rounded-2xl bg-[#F6F7F6] p-6 ${cardShadowClass}`}>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#1116111A] bg-[#F6F7F6]">
                <item.icon className="h-5 w-5 text-[#111611]" strokeWidth={1.5} />
              </div>
              <h3 className={`${headingClass} mb-2 text-xl`}>{item.title}</h3>
              <p className={`text-sm leading-relaxed ${textMuted}`}>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
