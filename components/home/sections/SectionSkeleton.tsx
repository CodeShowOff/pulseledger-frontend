type SectionSkeletonProps = {
  id?: string;
  className?: string;
};

export default function SectionSkeleton({
  id,
  className = "py-14 md:py-20",
}: SectionSkeletonProps) {
  return (
    <section id={id} aria-busy="true" className={`bg-[#F8FAFC] ${className}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-[7vw]">
        <div className="h-8 w-40 animate-pulse rounded-full bg-[#E2E8F0]" />
        <div className="mt-5 h-10 max-w-xl animate-pulse rounded-xl bg-[#E2E8F0]" />
        <div className="mt-4 h-5 max-w-2xl animate-pulse rounded-lg bg-[#E2E8F0]" />

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="h-44 animate-pulse rounded-2xl bg-[#E2E8F0]" />
          <div className="h-44 animate-pulse rounded-2xl bg-[#E2E8F0]" />
          <div className="h-44 animate-pulse rounded-2xl bg-[#E2E8F0]" />
        </div>
      </div>
    </section>
  );
}
