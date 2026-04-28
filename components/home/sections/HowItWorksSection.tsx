import { CheckCircle, FileText, TrendingUp } from "lucide-react";
import {
  cardShadowClass,
  headingClass,
  sectionPad,
  textMuted,
} from "@/components/home/homeTheme";

const steps = [
  {
    icon: FileText,
    title: "Set the plan",
    description: "Coaches build meals, workouts, and habits tailored to the client.",
  },
  {
    icon: CheckCircle,
    title: "Follow the routine",
    description: "Clients log meals, complete sessions, and check in daily.",
  },
  {
    icon: TrendingUp,
    title: "Review & adjust",
    description: "Track trends, message in context, and refine the program.",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className={`${sectionPad} bg-gradient-to-br from-[#EEF2FF] via-[#EDE9FE] to-[#F8FAFC] py-14 md:py-[10vh]`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center md:mb-16">
          <h2 className={`${headingClass} mb-4 text-[clamp(32px,3.2vw,52px)]`}>
            Three steps to consistency.
          </h2>
          {/* <p className={`mx-auto max-w-[720px] text-lg ${textMuted}`}>
            A simple loop that keeps clients on track and coaches in control.
          </p> */}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {steps.map((step) => (
            <article
              key={step.title}
              className={`flex h-full min-h-[240px] flex-col items-center rounded-[22px] border border-[#11161112] bg-[#F6F7F6] p-6 text-center md:min-h-[300px] md:rounded-[24px] md:p-7 ${cardShadowClass}`}
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#1116111A] bg-[#F6F7F6] md:mb-6">
                <step.icon className="h-6 w-6 text-[#111611]" strokeWidth={1.5} />
              </div>

              <h3 className={`${headingClass} mb-4 text-xl`}>{step.title}</h3>
              <p className={`mx-auto max-w-[30ch] text-sm leading-relaxed ${textMuted}`}>
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
