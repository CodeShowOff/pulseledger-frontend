import Link from "next/link";
import { Check } from "lucide-react";
import {
  cardShadowClass,
  headingClass,
  primaryGradientButtonClass,
  primaryGradientButtonStyle,
  sectionPad,
  textMuted,
} from "@/components/home/homeTheme";

const plans = [
  {
    name: "Free Trial",
    price: "₹0",
    note: "for 30 days",
    audience: "For coaches getting started",
    features: [
      "Unlimited active clients",
      "All Coach Basic features included",
      "Plans, reminders, and progress tracking",
    ],
    cta: "Start 30-day trial",
  },
  {
    name: "Coach Basic",
    price: "₹99",
    note: "per month",
    audience: "Platform fee for active coaches",
    features: [
      "Unlimited active clients",
      "No feature restrictions on core tools",
      "Plans, reminders, and progress tracking",
    ],
    cta: "Choose ₹99 plan",
  },
  {
    name: "Coach Pro",
    price: "₹199",
    note: "per month",
    tag: "Upcoming",
    audience: "For coaches who need advanced insights",
    features: [
      "Everything in Coach Basic",
      "AI features",
      "Priority customer support",
    ],
    cta: "Choose ₹199 plan",
  },
];

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className={`${sectionPad} bg-gradient-to-br from-[#EEF2FF] via-[#EDE9FE] to-[#F8FAFC] py-14 md:py-20`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="mb-4">
            <span className="inline-flex items-center rounded-full border border-[#6366F14D] bg-[#F8FAFC] px-3.5 py-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-[#6366F1]">
              Simple pricing
            </span>
          </p>

          <h2 className={`${headingClass} mb-4 text-[clamp(1.9rem,4.6vw,3rem)]`}>
            Choose a plan that fits your stage.
          </h2>

          <p className={`mx-auto max-w-[62ch] text-base sm:text-lg ${textMuted}`}>
            Client app access is free. Coaches get a 30-day free trial, then choose ₹99 or ₹199
            per month.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative rounded-2xl border border-[#1116111A] bg-[#F6F7F6] p-6 text-[#111611] md:p-7 ${cardShadowClass}`}
            >
              {plan.tag && (
                <span className="absolute right-6 top-0 z-10 inline-flex -translate-y-1/2 items-center rounded-full border border-[#6366F14D] bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4338CA] md:right-7">
                  {plan.tag}
                </span>
              )}

              <h3 className={`${headingClass} mb-3 text-2xl`}>{plan.name}</h3>

              <div className="mb-4">
                <span className={`${headingClass} text-4xl`}>{plan.price}</span>
                <span className={`ml-2 text-sm ${textMuted}`}>{plan.note}</span>
              </div>

              <p className={`mb-5 text-sm ${textMuted}`}>{plan.audience}</p>

              <ul className="mb-7 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 text-[#111611]" strokeWidth={2} />
                    <span className="text-sm leading-relaxed text-[#111611]">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.tag === "Upcoming" ? (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className={`inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl px-5 py-3 text-sm font-medium opacity-60 ${primaryGradientButtonClass}`}
                  style={primaryGradientButtonStyle}
                >
                  {plan.cta}
                </button>
              ) : (
                <Link
                  href="/auth/register"
                  className={`inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-medium ${primaryGradientButtonClass}`}
                  style={primaryGradientButtonStyle}
                >
                  {plan.cta}
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
