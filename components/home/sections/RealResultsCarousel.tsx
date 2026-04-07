"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Transformation = {
  name: string;
  beforeImage: string;
  afterImage: string;
};

type RealResultsCarouselProps = {
  sectionPad: string;
  headingClass: string;
  cardShadowClass: string;
};

const transformations: Transformation[] = [
  {
    name: "Sophia",
    beforeImage: "/images/sophia-before.avif",
    afterImage: "/images/sophia-after.avif",
  },
  {
    name: "James",
    beforeImage: "/images/james-before.avif",
    afterImage: "/images/james-after.avif",
  },
  {
    name: "Patrick",
    beforeImage: "/images/patrick-before.avif",
    afterImage: "/images/patrick-after.avif",
  },
  {
    name: "Lily",
    beforeImage: "/images/lily-before.avif",
    afterImage: "/images/lily-after.avif",
  },
];

export default function RealResultsCarousel({
  sectionPad,
  headingClass,
  cardShadowClass,
}: RealResultsCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((index) => (index + 1) % transformations.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide(
      (index) => (index - 1 + transformations.length) % transformations.length,
    );
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(nextSlide, 5000);
    return () => window.clearInterval(intervalId);
  }, [nextSlide]);

  return (
    <section
      id="results"
      className={`${sectionPad} bg-[#F8FAFC] py-14 md:py-20`}
      aria-label="Real Results"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center md:mb-12">
          <p className="mb-4">
            <span className="inline-flex items-center rounded-full border border-[#6366F14D] bg-[#F8FAFC] px-3.5 py-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-[#6366F1]">
              Real transformations
            </span>
          </p>

          <h2 className={`${headingClass} mb-4 text-[clamp(1.9rem,4.6vw,3rem)]`}>
            Real results from <span className="text-[#6366F1]">real clients</span>.
          </h2>
        </div>

        <div
          className={`relative mx-auto max-w-[860px] overflow-hidden rounded-[22px] border border-[#1116111A] bg-[#F6F7F6] p-3 sm:p-4 md:rounded-[24px] md:p-5 ${cardShadowClass}`}
        >
          <div className="mb-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Show previous transformation"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#1116111A] bg-[#F8FAFC] text-[#111611] transition hover:bg-[#EEF2FF]"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.1} />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Show next transformation"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#1116111A] bg-[#F8FAFC] text-[#111611] transition hover:bg-[#EEF2FF]"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.1} />
            </button>
          </div>

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {transformations.map((item) => (
                <article key={item.name} className="w-full shrink-0">
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                    <figure className="relative aspect-[4/5] overflow-hidden rounded-xl border border-[#1116111A] bg-[#F8FAFC] sm:rounded-2xl">
                      <Image
                        src={item.beforeImage}
                        alt={`${item.name} before transformation`}
                        fill
                        sizes="(max-width: 640px) 50vw, 320px"
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    </figure>

                    <figure className="relative aspect-[4/5] overflow-hidden rounded-xl border border-[#1116111A] bg-[#F8FAFC] sm:rounded-2xl">
                      <Image
                        src={item.afterImage}
                        alt={`${item.name} after transformation`}
                        fill
                        sizes="(max-width: 640px) 50vw, 320px"
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    </figure>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2.5">
            {transformations.map((item, index) => {
              const isActive = index === currentSlide;

              return (
                <button
                  key={item.name}
                  type="button"
                  aria-label={`Go to ${item.name} transformation`}
                  aria-current={isActive}
                  onClick={() => setCurrentSlide(index)}
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? "h-2.5 w-8 bg-[#6366F1]"
                      : "h-2.5 w-2.5 bg-[#CBD5E1] hover:bg-[#94A3B8]"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
