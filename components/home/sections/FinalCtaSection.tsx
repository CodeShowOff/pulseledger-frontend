import Link from "next/link";
import {
  headingClass,
  primaryGradientButtonClass,
  primaryGradientButtonStyle,
} from "@/components/home/homeTheme";

export default function FinalCtaSection() {
  return (
    <section className="bg-[#D7FF3B] px-4 py-14 text-center sm:px-6 md:flex md:min-h-[100svh] md:items-center md:justify-center md:py-0">
      <div className="max-w-[900px] text-center">
        <h2 className={`${headingClass} mb-6 text-[clamp(44px,5vw,76px)] text-[#111611]`}>
          Ready to feel better?
        </h2>

        <p className="mb-10 text-xl text-[#111611CC] md:text-2xl">
          Start your free week. No setup fees. No overwhelm.
        </p>

        <Link
          href="/auth/register"
          className={`inline-flex items-center justify-center rounded-xl px-8 py-4 text-lg font-medium ${primaryGradientButtonClass}`}
          style={primaryGradientButtonStyle}
        >
          Get started
        </Link>

        <p className="mt-6 text-sm text-[#11161199]">Cancel anytime.</p>
      </div>
    </section>
  );
}
