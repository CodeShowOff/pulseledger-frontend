import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const sectionPad = "px-4 sm:px-6 md:px-[7vw]";
export const headingClass = `${spaceGrotesk.className} tracking-[-0.02em] leading-[0.95]`;
export const cardShadowClass = "shadow-[0_18px_50px_rgba(37,99,235,0.16)]";
export const textMuted = "text-[#64748B]";
export const accentLinkStyle = { color: "#A78BFA" } as const;
export const primaryGradientButtonClass =
  "border border-[#6366F14D] bg-white/70 text-[#312E81]";
export const primaryGradientButtonStyle = { color: "#312E81" } as const;
