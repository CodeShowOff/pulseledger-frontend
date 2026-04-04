import { headingClass, sectionPad, textMuted } from "@/components/home/homeTheme";

const faqs = [
  {
    question: "Can I use FitCoach on mobile as a coach?",
    answer:
      "Yes. Coaches can manage check-ins, update plans, and respond to messages from mobile without losing context.",
  },
  {
    question: "Do clients need to install anything complicated?",
    answer:
      "No complicated setup. Clients can access plans, tasks, and chat from a clean mobile interface right away.",
  },
  {
    question: "How do clients join a coach on FitCoach?",
    answer:
      "Clients sign up using the coach referral code and are linked to that coach instantly.",
  },
  {
    question: "Is there a contract or lock-in?",
    answer:
      "No long-term lock-in. You can start with a free week and cancel anytime if it is not the right fit.",
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className={`${sectionPad} bg-[#F8FAFC] py-14 md:py-20`}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <p className="mb-4">
            <span className="inline-flex items-center rounded-full border border-[#6366F14D] bg-[#F8FAFC] px-3.5 py-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-[#6366F1]">
              FAQ
            </span>
          </p>

          <h2 className={`${headingClass} mb-4 text-[clamp(1.85rem,4.4vw,2.9rem)]`}>
            Questions you might be asking.
          </h2>

          <p className={`text-base sm:text-lg ${textMuted}`}>
            Quick answers to help you decide faster.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-[#1116111A] bg-[#F6F7F6] p-5"
            >
              <summary className="relative list-none cursor-pointer pr-7 font-medium text-[#111611]">
                {item.question}
                <span
                  aria-hidden="true"
                  className="absolute right-0 top-0 text-[#6366F1] transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className={`mt-3 text-sm leading-relaxed ${textMuted}`}>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
