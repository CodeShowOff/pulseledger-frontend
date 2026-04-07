import Link from "next/link";
import Image from "next/image";
import { BarChart3, LayoutTemplate, MessageCircle } from "lucide-react";
import {
  cardShadowClass,
  headingClass,
  primaryGradientButtonClass,
  primaryGradientButtonStyle,
  textMuted,
} from "@/components/home/homeTheme";

const coachFeatures = [
  { icon: LayoutTemplate, text: "Plan builder with templates" },
  { icon: BarChart3, text: "Client progress at a glance" },
  { icon: MessageCircle, text: "Built-in chat + reminders" },
];

export default function CoachesSection() {
  return (
    <section
      id="coaches"
      className="relative bg-[#F8FAFC] py-12 md:min-h-[100svh] md:overflow-hidden md:py-0"
    >
      <div className="px-4 sm:px-6 md:hidden">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-8 lg:grid-cols-2">
          <div>
            <h2 className={`${headingClass} mb-4 text-[clamp(1.85rem,7.5vw,2.6rem)]`}>
              Everything you need to coach with clarity.
            </h2>

            <p className={`${textMuted} mb-6 text-base leading-relaxed sm:text-lg`}>
              Programs, scheduling, messaging, and progress—organized so you can focus on people.
            </p>

            <div className="mb-7 space-y-3">
              {coachFeatures.map((feature) => (
                <div key={feature.text} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1116111A] bg-[#F6F7F6]">
                    <feature.icon className="h-4 w-4 text-[#111611]" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-[#111611] sm:text-base">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/auth/register"
              className={`inline-flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-sm font-medium sm:w-auto ${primaryGradientButtonClass}`}
              style={primaryGradientButtonStyle}
            >
              Start coaching
            </Link>
          </div>

          <div
            className={`relative h-[44vh] min-h-[320px] max-h-[520px] overflow-hidden rounded-[24px] ${cardShadowClass}`}
          >
            <Image
              src="/images/coach_dashboard_ui.jpg"
              alt="Coach dashboard"
              fill
              sizes="(max-width: 768px) 100vw, 46vw"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute left-5 top-5">
              <span className="inline-flex items-center rounded-full border border-[#6366F14D] bg-white/70 px-3.5 py-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-[#312E81]">
                Coach Dashboard
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 hidden md:block">
        <div
          className="absolute"
          style={{
            left: "7vw",
            top: "50%",
            transform: "translateY(-50%)",
            width: "min(520px, 36vw)",
          }}
        >
          <h2 className={`${headingClass} mb-6 text-[clamp(32px,3.2vw,52px)]`}>
            Everything you need to coach with clarity.
          </h2>

          <p className={`${textMuted} mb-8 text-lg leading-relaxed`}>
            Programs, scheduling, messaging, and progress—organized so you can focus on people.
          </p>

          <div className="mb-8 space-y-4">
            {coachFeatures.map((feature) => (
              <div key={feature.text} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1116111A] bg-[#F6F7F6]">
                  <feature.icon className="h-4 w-4 text-[#111611]" strokeWidth={1.5} />
                </div>
                <span className="font-medium text-[#111611]">{feature.text}</span>
              </div>
            ))}
          </div>

          <Link
            href="/auth/register"
            className={`inline-flex items-center justify-center rounded-xl px-6 py-3.5 font-medium ${primaryGradientButtonClass}`}
            style={primaryGradientButtonStyle}
          >
            Start coaching
          </Link>
        </div>

        <div
          className={`absolute overflow-hidden rounded-[28px] ${cardShadowClass}`}
          style={{
            right: "7vw",
            top: "50%",
            transform: "translateY(-50%)",
            width: "46vw",
            height: "62vh",
          }}
        >
          <Image
            src="/images/coach_dashboard_ui.jpg"
            alt="Coach dashboard"
            fill
            sizes="46vw"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute left-6 top-6">
            <span className="inline-flex items-center rounded-full border border-[#6366F14D] bg-white/70 px-3.5 py-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-[#312E81]">
              Coach Dashboard
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
