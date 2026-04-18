"use client"

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
      className={`hero-logo flex items-baseline justify-center gap-2 sm:gap-3 ${className} ${inView ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-95 opacity-0"}`}
      style={{
        fontFamily: "var(--font-nunito), sans-serif",
        transitionDelay: inView ? "400ms" : "0ms",
      }}
    >
      <span className="hero-logo-text text-foreground text-7xl font-black tracking-tighter sm:text-8xl lg:text-9xl">
        Frame
      </span>
      <span className="hero-logo-text text-primary text-3xl font-bold sm:text-4xl lg:text-5xl">
        beauty
      </span>
    </div>
  )
}

/**
 * Navigation bar logo — "frame" with small subscript "beauty".
 * Used in topBar and desktopNavbar, wrapped in a Link externally.
 */
export function NavBrandLogo({
  frameClassName = "text-2xl font-extrabold md:text-3xl",
}: {
  frameClassName?: string
}) {
  return (
    <span className="hero-logo inline-flex items-baseline">
      <span
        className={`hero-logo-text text-foreground tracking-tight ${frameClassName}`}
        style={{ fontFamily: "var(--font-nunito), sans-serif" }}
      >
        frame
      </span>
      <span className="hero-logo-text text-primary decoration-primary/50 ml-0.5 self-end text-[8px] font-semibold underline">
        beauty
      </span>
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
    <span className="hero-logo inline-flex items-baseline gap-1">
      <span className="hero-logo-text text-foreground">Frame</span>
      <span
        className={`hero-logo-text text-primary decoration-primary/50 underline ${beautyClassName}`}
      >
        beauty
      </span>
    </span>
  )
}

/**
 * Footer brand logo — "frame" with small subscript "beauty".
 * Similar to NavBrandLogo but with font-bold instead of font-extrabold.
 */
export function FooterBrandLogo() {
  return (
    <span className="hero-logo inline-flex items-baseline">
      <span
        className="hero-logo-text text-foreground text-2xl font-bold tracking-tight"
        style={{ fontFamily: "var(--font-nunito), sans-serif" }}
      >
        frame
      </span>
      <span className="hero-logo-text text-primary decoration-primary/50 ml-0.5 self-end text-[8px] font-semibold underline">
        beauty
      </span>
    </span>
  )
}
