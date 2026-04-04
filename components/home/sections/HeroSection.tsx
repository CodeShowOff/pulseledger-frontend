import Link from "next/link";
import { cardShadowClass, headingClass, textMuted } from "@/components/home/homeTheme";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] pt-10 pb-12 sm:pt-14 md:h-[calc(100svh-68px)] md:pt-0 md:pb-0">
      <div className="px-4 sm:px-6 md:hidden">
        <div className="mx-auto max-w-2xl">
          <div className="mb-5">
            <span className="inline-flex items-center rounded-full border border-[#6366F14D] bg-[#F8FAFC] px-3.5 py-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-[#6366F1]">
              Health Coaching Platform
            </span>
          </div>

          <h1 className={`${headingClass} mb-5 text-[clamp(2rem,9vw,3.25rem)]`}>
            Your health journey, guided.
          </h1>

          <p className={`${textMuted} mb-7 text-base leading-relaxed sm:text-lg`}>
            A calm, modern space where coaches build programs and clients stay consistent—without
            the noise.
          </p>

          <div className="mb-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link
              href="/auth/register"
              className="inline-flex w-full items-center justify-center rounded-xl border border-[#6366F14D] bg-white/70 px-6 py-3.5 text-sm font-medium text-[#312E81] sm:w-auto sm:text-base"
            >
              Get started
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-flex w-full items-center justify-center rounded-xl border border-[#6366F14D] bg-white/70 px-6 py-3.5 text-sm font-medium text-[#312E81] sm:w-auto sm:text-base"
            >
              See how it works
            </Link>
          </div>

          <div
            className={`relative h-[44vh] min-h-[320px] max-h-[520px] overflow-hidden rounded-3xl ${cardShadowClass}`}
          >
            <img
              src="/images/hero_stretch_outdoor.jpg"
              alt="Woman stretching outdoors"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#11161173] via-[#1116111A] to-transparent" />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 hidden md:block">
        <img
          src="/images/hero_stretch_outdoor.jpg"
          alt="Woman stretching outdoors"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "right center" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(246,247,246,1) 0%, rgba(246,247,246,1) 25%, rgba(246,247,246,0.65) 36%, rgba(246,247,246,0.18) 50%, transparent 100%)",
          }}
        />

        <div
          className="absolute z-10"
          style={{
            left: "7vw",
            top: "50%",
            transform: "translateY(-50%)",
            width: "min(520px, 38vw)",
          }}
        >
          <div className="mb-6">
            <span className="inline-flex items-center rounded-full border border-[#6366F14D] bg-[#F8FAFC] px-3.5 py-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-[#6366F1]">
              Health Coaching Platform
            </span>
          </div>

          <h1 className={`${headingClass} mb-6 text-[clamp(44px,5vw,76px)]`}>
            Your health journey, guided.
          </h1>

          <p className={`${textMuted} mb-8 text-lg leading-relaxed md:text-xl`}>
            A calm, modern space where coaches build programs and clients stay consistent—without
            the noise.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-xl border border-[#6366F14D] bg-white/70 px-6 py-3.5 text-base font-medium text-[#312E81]"
            >
              Get started
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-flex items-center justify-center rounded-xl border border-[#6366F14D] bg-white/70 px-6 py-3.5 text-base font-medium text-[#312E81]"
            >
              See how it works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
