import Link from "next/link";
import { Camera, ListTodo, Utensils } from "lucide-react";
import {
  cardShadowClass,
  headingClass,
  primaryGradientButtonClass,
  primaryGradientButtonStyle,
  textMuted,
} from "@/components/home/homeTheme";

const clientFeatures = [
  { icon: ListTodo, text: "Clear daily tasks" },
  { icon: Utensils, text: "Quick meal & workout log" },
  { icon: Camera, text: "Chat + progress photos" },
];

export default function ClientsSection() {
  return (
    <section
      id="clients"
      className="relative bg-[#F8FAFC] py-12 md:min-h-[100svh] md:overflow-hidden md:py-0"
    >
      <div className="px-4 sm:px-6 md:hidden">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-8 lg:grid-cols-2">
          <div
            className={`relative h-[44vh] min-h-[320px] max-h-[520px] overflow-hidden rounded-[24px] ${cardShadowClass}`}
          >
            <img
              src="/images/client_mobile_ui.jpg"
              alt="Client mobile experience"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute left-5 top-5">
              <span className="inline-flex items-center rounded-full border border-[#6366F14D] bg-white/70 px-3.5 py-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-[#312E81]">
                Client Experience
              </span>
            </div>
          </div>

          <div>
            <h2 className={`${headingClass} mb-4 text-[clamp(1.85rem,7.5vw,2.6rem)]`}>
              A program that fits your real life.
            </h2>

            <p className={`${textMuted} mb-6 text-base leading-relaxed sm:text-lg`}>
              Daily guidance, easy logging, and your coach—always one message away.
            </p>

            <div className="mb-7 space-y-3">
              {clientFeatures.map((feature) => (
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
              Join your coach
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 hidden md:block">
        <div
          className={`absolute overflow-hidden rounded-[28px] ${cardShadowClass}`}
          style={{
            left: "7vw",
            top: "50%",
            transform: "translateY(-50%)",
            width: "44vw",
            height: "62vh",
          }}
        >
          <img
            src="/images/client_mobile_ui.jpg"
            alt="Client mobile experience"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute left-6 top-6">
            <span className="inline-flex items-center rounded-full border border-[#6366F14D] bg-white/70 px-3.5 py-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-[#312E81]">
              Client Experience
            </span>
          </div>
        </div>

        <div
          className="absolute"
          style={{
            right: "7vw",
            top: "50%",
            transform: "translateY(-50%)",
            width: "min(520px, 36vw)",
          }}
        >
          <h2 className={`${headingClass} mb-6 text-[clamp(32px,3.2vw,52px)]`}>
            A program that fits your real life.
          </h2>

          <p className={`${textMuted} mb-8 text-lg leading-relaxed`}>
            Daily guidance, easy logging, and your coach—always one message away.
          </p>

          <div className="mb-8 space-y-4">
            {clientFeatures.map((feature) => (
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
            Join your coach
          </Link>
        </div>
      </div>
    </section>
  );
}
