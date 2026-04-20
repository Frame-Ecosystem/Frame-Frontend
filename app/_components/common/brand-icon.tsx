import type { SVGProps } from "react"

/**
 * Frame Beauty brand icon.
 *
 * A stylized "F" enclosed in an open frame with a beauty accent dot.
 * Uses `currentColor` for the frame strokes (theme via Tailwind text-*),
 * and `--color-primary` for the accent dot (the "beauty" mark).
 *
 * Designed at 32x32, scales infinitely. Set width/height or className.
 */
export function BrandIcon({
  className,
  title,
  ...props
}: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      className={className}
      {...props}
    >
      {title ? <title>{title}</title> : null}

      {/* Outer frame — open at top-right and bottom-left for a modern feel */}
      <path d="M9 4 H4 V9" strokeWidth="2.25" />
      <path d="M23 4 H28 V9" strokeWidth="2.25" />
      <path d="M4 23 V28 H9" strokeWidth="2.25" />
      <path d="M28 23 V28 H23" strokeWidth="2.25" />

      {/* Stylized "F" in the center */}
      <path d="M11 9 V23 M11 9 H21 M11 16 H18" strokeWidth="2.75" />

      {/* Beauty accent dot */}
      <circle
        cx="22.5"
        cy="22.5"
        r="2"
        fill="var(--color-primary)"
        stroke="none"
      />
    </svg>
  )
}
