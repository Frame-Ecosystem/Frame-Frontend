"use client"

import Image from "next/image"
import "./brand-logo.css"

/**
 * Large animated hero logo — "Frame beauty" with glow + shimmer.
 * Used in the landing page hero section.
 */
export function HeroBrandLogo({
  className = "",
  inView = true,
}: {
  className?: string
  inView?: boolean
}) {
  return (
    <div
      dir="ltr"
      className={`hero-logo flex items-baseline justify-center gap-1 sm:gap-1.5 ${className} ${inView ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-95 opacity-0"}`}
      style={{
        fontFamily: "var(--font-nunito), sans-serif",
        transitionDelay: inView ? "400ms" : "0ms",
      }}
    >
      <span className="hero-logo-text text-foreground text-7xl font-black tracking-tighter sm:text-8xl lg:text-9xl">
        frame
      </span>
      <span className="hero-logo-text text-primary decoration-primary/50 text-3xl font-bold underline sm:text-4xl lg:text-5xl">
        beauty
      </span>
    </div>
  )
}

/**
 * Navigation bar logo — brand icon only.
 * Used in topBar and desktopNavbar, wrapped in a Link externally.
 * The icon swaps automatically between light/dark variants based on the active theme.
 */
export function NavBrandLogo({
  frameClassName: _unused = "text-2xl font-extrabold md:text-3xl",
}: {
  frameClassName?: string
} = {}) {
  void _unused
  return (
    <span dir="ltr" className="hero-logo inline-flex items-center">
      {/* Dark icon — visible on light themes (better contrast on bright bg) */}
      <Image
        src="/images/logos/fb-dark-icon.png"
        alt="Frame Beauty"
        width={40}
        height={40}
        priority
        className="fb-brand-icon fb-brand-icon-dark h-9 w-9 select-none md:h-10 md:w-10"
        draggable={false}
      />
      {/* Light icon — visible on dark themes */}
      <Image
        src="/images/logos/fb-light-icon.png"
        alt="Frame Beauty"
        width={40}
        height={40}
        priority
        className="fb-brand-icon fb-brand-icon-light h-9 w-9 select-none md:h-10 md:w-10"
        draggable={false}
      />
    </span>
  )
}

/**
 * Inline brand text — "Frame beauty" for use inside headings/paragraphs.
 * "Frame" inherits the parent color, "beauty" is themed + underlined.
 */
export function InlineBrandLogo({
  beautyClassName = "text-lg font-bold sm:text-xl lg:text-2xl",
}: {
  beautyClassName?: string
}) {
  return (
    <span dir="ltr" className="hero-logo inline-flex items-baseline gap-1">
      <span className="hero-logo-text text-foreground">frame</span>
      <span
        className={`hero-logo-text text-primary decoration-primary/50 underline ${beautyClassName}`}
      >
        beauty
      </span>
    </span>
  )
}

/**
 * Footer brand logo — fb app icon + "frame beauty" wordmark.
 * The icon swaps automatically between light/dark variants based on the active theme.
 */
export function FooterBrandLogo() {
  return (
    <span dir="ltr" className="hero-logo inline-flex items-center gap-1">
      <span className="inline-flex items-baseline">
        <span
          className="hero-logo-text text-foreground text-xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-nunito), sans-serif" }}
        >
          frame
        </span>
        <span className="hero-logo-text text-primary decoration-primary/50 self-end text-[10px] font-semibold tracking-tighter underline">
          beauty
        </span>
      </span>
    </span>
  )
}
