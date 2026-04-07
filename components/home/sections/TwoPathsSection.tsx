import Link from "next/link";
import Image from "next/image";
import { ClipboardList, Heart } from "lucide-react";
import {
  accentLinkStyle,
  cardShadowClass,
  headingClass,
} from "@/components/home/homeTheme";

export default function TwoPathsSection() {
  return (
    <section className="relative bg-[#F8FAFC] py-12 md:relative md:min-h-[100svh] md:overflow-hidden md:py-0">
      <div className="px-4 sm:px-6 md:hidden">
        <div className="mx-auto max-w-3xl">
          <h2 className={`${headingClass} mb-12 text-center text-[clamp(1.85rem,7.5vw,2.6rem)]`}>
            Built for coaches. Designed for clients.
          </h2>

          <div className="grid grid-cols-1 gap-5">
            <article
              className={`relative min-h-[320px] overflow-hidden rounded-[24px] ${cardShadowClass}`}
            >
              <Image
                src="/images/coach_workspace_laptop.jpg"
                alt="Coach workspace"
                fill
                sizes="(max-width: 768px) 100vw, 41vw"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111611BF] via-[#1116114D] to-transparent" />

              <div className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#1116111A] bg-[#F6F7F6]">
                <ClipboardList className="h-5 w-5 text-[#111611]" strokeWidth={1.5} />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className={`${headingClass} mb-2 text-2xl text-[#F6F7F6]`}>For coaches</h3>
                <p className="mb-4 max-w-[32ch] text-sm leading-relaxed text-[#F6F7F6D9]">
                  Plan programs, message clients, and track progress—all in one calm workspace.
                </p>
                <Link href="/#coaches" className="text-sm font-medium" style={accentLinkStyle}>
                  Explore coaching tools
                </Link>
              </div>
            </article>

            <article
              className={`relative min-h-[320px] overflow-hidden rounded-[24px] ${cardShadowClass}`}
            >
              <Image
                src="/images/client_phone_hands.jpg"
                alt="Client using app"
                fill
                sizes="(max-width: 768px) 100vw, 41vw"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111611BF] via-[#1116114D] to-transparent" />

              <div className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#1116111A] bg-[#F6F7F6]">
                <Heart className="h-5 w-5 text-[#111611]" strokeWidth={1.5} />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className={`${headingClass} mb-2 text-2xl text-[#F6F7F6]`}>For clients</h3>
                <p className="mb-4 max-w-[32ch] text-sm leading-relaxed text-[#F6F7F6D9]">
                  Follow your plan, log your day, and stay connected to your coach without overwhelm.
                </p>
                <Link href="/#clients" className="text-sm font-medium" style={accentLinkStyle}>
                  Explore the experience
                </Link>
              </div>
            </article>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 hidden md:block">
        <h2
          className={`${headingClass} absolute text-center text-[clamp(32px,3.2vw,52px)]`}
          style={{ top: "10vh", left: "50%", transform: "translateX(-50%)", maxWidth: "900px" }}
        >
          Built for coaches. Designed for clients.
        </h2>

        <div className="absolute left-1/2 flex -translate-x-1/2 gap-[3vw]" style={{ top: "32vh" }}>
          <article
            className={`relative overflow-hidden rounded-[28px] ${cardShadowClass}`}
            style={{ width: "41vw", height: "62vh" }}
          >
            <Image
              src="/images/coach_workspace_laptop.jpg"
              alt="Coach workspace"
              fill
              sizes="41vw"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111611B3] via-[#11161133] to-transparent" />

            <div className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-[#1116111A] bg-[#F6F7F6]">
              <ClipboardList className="h-5 w-5 text-[#111611]" strokeWidth={1.5} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className={`${headingClass} mb-2 text-2xl text-[#F6F7F6]`}>For coaches</h3>
              <p className="mb-4 max-w-[280px] text-sm leading-relaxed text-[#F6F7F6CC]">
                Plan programs, message clients, and track progress—all in one calm workspace.
              </p>
              <Link href="/#coaches" className="text-sm font-medium" style={accentLinkStyle}>
                Explore coaching tools
              </Link>
            </div>
          </article>

          <article
            className={`relative overflow-hidden rounded-[28px] ${cardShadowClass}`}
            style={{ width: "41vw", height: "62vh" }}
          >
            <Image
              src="/images/client_phone_hands.jpg"
              alt="Client using app"
              fill
              sizes="41vw"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111611B3] via-[#11161133] to-transparent" />

            <div className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-[#1116111A] bg-[#F6F7F6]">
              <Heart className="h-5 w-5 text-[#111611]" strokeWidth={1.5} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className={`${headingClass} mb-2 text-2xl text-[#F6F7F6]`}>For clients</h3>
              <p className="mb-4 max-w-[280px] text-sm leading-relaxed text-[#F6F7F6CC]">
                Follow your plan, log your day, and stay connected to your coach without overwhelm.
              </p>
              <Link href="/#clients" className="text-sm font-medium" style={accentLinkStyle}>
                Explore the experience
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
