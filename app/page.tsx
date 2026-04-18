"use client"
/* eslint-disable react-hooks/refs -- useInView/useParallax return useState values, not refs */

import { useAuth } from "./_auth"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "./_components/ui/button"
import { ErrorBoundary } from "./_components/common/errorBoundary"
import { getHomePath } from "./_lib/profile"
import {
  Scissors,
  Star,
  Calendar,
  ArrowRight,
  Users,
  Zap,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  ShoppingBag,
  Newspaper,
  Mail,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
} from "lucide-react"
import { SignupFlow, SignInDialog } from "./_auth"
import { Dialog, DialogContent } from "./_components/ui/dialog"
import TopBar from "./_components/layout/topBar"
import {
  HeroBrandLogo,
  InlineBrandLogo,
  FooterBrandLogo,
} from "./_components/common/brand-logo"
import { LandingSkeleton } from "./_components/skeletons/auth"

/* ═══════════════════════════════════════════════════════════════════════════
   SOCIAL ICONS (not available in lucide-react)
   ═══════════════════════════════════════════════════════════════════════════ */

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.186 24h-.007C5.461 23.956.057 18.522 0 11.743 0 5.27 5.373 0 12 0c6.627 0 12 5.27 12 11.743 0 .07-.003.14-.005.21C23.89 18.666 18.6 24 12.186 24zm5.441-11.845c-.055-3.549-2.449-5.587-6.636-5.631-.025 0-.05 0-.075 0-2.487 0-4.405.998-5.549 2.886l1.95 1.17c.852-1.29 2.19-1.585 3.599-1.585h.063c1.452.01 2.548.434 3.254 1.26.514.602.858 1.436.858 2.395 0 .067-.002.134-.005.2-.16-.073-.325-.143-.494-.21-1.179-.462-2.75-.678-4.406-.607-4.02.174-6.602 2.43-6.445 5.628.08 1.6.842 2.97 2.148 3.86 1.104.751 2.53 1.113 4.015 1.02 1.96-.12 3.496-.935 4.568-2.424.813-1.128 1.329-2.564 1.542-4.296 1.003.602 1.74 1.39 2.129 2.367.662 1.664.702 4.4-1.452 6.54-1.884 1.877-4.15 2.69-7.53 2.715-3.75-.029-6.588-1.233-8.433-3.576C3.276 17.005 2.26 13.88 2.232 12c.028-1.88 1.044-5.005 2.92-7.157C7.003 2.5 9.84 1.295 13.59 1.267c3.78.03 6.66 1.24 8.558 3.6 .927 1.151 1.617 2.56 2.056 4.17l2.266-.586c-.52-1.906-1.354-3.58-2.494-4.994C21.753 1.067 18.269-.296 13.598-.333h-.02C8.88-.296 5.435 1.065 3.257 3.433c-2.276 2.613-3.463 6.293-3.496 8.565v.004c.033 2.272 1.22 5.952 3.496 8.565 2.48 2.846 6.076 4.314 10.683 4.363h.073c3.883-.028 6.625-1.07 8.88-3.375 3.184-3.157 3.102-7.087 2.188-9.386-.66-1.66-1.994-3.003-3.854-3.878zm-6.06 8.383c-1.643.098-3.354-.61-3.43-2.14-.056-1.126.878-2.382 3.996-2.517.351-.015.694-.022 1.031-.022 1.108 0 2.14.107 3.073.318-.35 3.44-2.476 4.26-4.67 4.36z" />
  </svg>
)

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.18 8.18 0 004.77 1.52V6.84a4.84 4.84 0 01-1-.15z" />
  </svg>
)

const _FrameIcon = ({ className }: { className?: string }) => (
  <span
    className={className}
    style={{
      fontFamily: "var(--font-nunito), sans-serif",
      fontWeight: 800,
      fontSize: "12px",
      lineHeight: 1,
      letterSpacing: "-0.02em",
    }}
  >
    f
  </span>
)

/* ═══════════════════════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════════════════════ */

/** Smooth counter that eases out */
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  const hasRun = useRef(false)

  useEffect(() => {
    if (!start || hasRun.current) return
    hasRun.current = true
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, start])

  return count
}

/** Scroll-triggered visibility (fires once) */
function useInView(threshold = 0.15) {
  const [node, setNode] = useState<HTMLElement | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [node, threshold])

  return { setRef: setNode, inView }
}

/** Parallax scroll offset — returns a CSS-safe translateY value */
function useParallax(speed = 0.3) {
  const [node, setNode] = useState<HTMLElement | null>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (!node) return
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect()
        const viewH = window.innerHeight
        if (rect.bottom > -200 && rect.top < viewH + 200) {
          setOffset((rect.top - viewH / 2) * speed)
        }
        ticking = false
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [node, speed])

  return { setRef: setNode, offset }
}

/* ═══════════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════════ */

const PILLARS = [
  {
    number: "01",
    icon: Newspaper,
    title: "Feed",
    tagline: "Get inspired. Inspire others.",
    description:
      "A living stream of creativity where styles, trends, and ideas collide. Follow artists, discover fresh looks, and let the community reshape how you think about beauty. Every scroll is a new perspective — save what moves you, share what defines you.",
    features: [
      "Discover trending styles & techniques",
      "Follow your favorite artists & lounges",
      "Save looks that inspire your next visit",
      "Share your own transformation stories",
    ],
  },
  {
    number: "02",
    icon: ShoppingBag,
    title: "Shop",
    tagline: "Everything beauty, one place.",
    description:
      "A curated marketplace where professionals and beauty lovers find exactly what they need. From premium haircare to skincare essentials — keep your look shining with products recommended by the people you trust most.",
    features: [
      "Curated products from trusted brands",
      "Recommendations from professionals",
      "Exclusive deals & new arrivals",
      "Real reviews from real customers",
    ],
  },
  {
    number: "03",
    icon: Calendar,
    title: "Book",
    tagline: "Your time, respected.",
    description:
      "Find top-rated lounges near you, browse their services, and lock in your spot in seconds. Real-time queue tracking means no more guessing — you'll always know exactly when it's your turn.",
    features: [
      "Instant booking with live availability",
      "Real-time queue tracking & updates",
      "Verified ratings & reviews",
      "Smart recommendations near you",
    ],
  },
] as const

const STEPS = [
  {
    step: "01",
    title: "Discover",
    description:
      "Scroll your feed for inspiration, explore trending styles, and find lounges and products that match your vibe.",
  },
  {
    step: "02",
    title: "Choose",
    description:
      "Shop the products you love, pick a service, choose your time slot, and confirm — all in a few taps.",
  },
  {
    step: "03",
    title: "Shine",
    description:
      "Show up looking your best, enjoy a premium experience, and share your transformation with the community.",
  },
] as const

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

const LandingPage = () => {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [signupOpen, setSignupOpen] = useState(false)
  const [signinOpen, setSigninOpen] = useState(false)
  const hasProcessedSigninRef = useRef(false)

  /* ── Scroll-based hooks ── */
  const heroInView = useInView(0.05)
  const pillarsInView = useInView(0.08)
  const stepsInView = useInView(0.1)
  const statsInView = useInView(0.15)
  const clientsInView = useInView(0.1)
  const b2bInView = useInView(0.1)
  const ctaInView = useInView(0.15)

  const heroParallax = useParallax(0.15)
  const stepsParallax = useParallax(0.08)

  // Stable merged refs for sections using both useInView + useParallax
  const heroRef = useCallback(
    (node: HTMLElement | null) => {
      heroInView.setRef(node)
      heroParallax.setRef(node)
    },
    [heroInView, heroParallax],
  )
  const stepsRef = useCallback(
    (node: HTMLElement | null) => {
      stepsInView.setRef(node)
      stepsParallax.setRef(node)
    },
    [stepsInView, stepsParallax],
  )

  /* ── Animated counters ── */
  const centersCount = useCounter(50, 1800, statsInView.inView)
  const customersCount = useCounter(1000, 2200, statsInView.inView)
  const ratingCount = useCounter(49, 1600, statsInView.inView)

  const openSignIn = useCallback(() => setSigninOpen(true), [])
  const openSignUp = useCallback(() => setSignupOpen(true), [])

  // ?signin=true query parameter
  useEffect(() => {
    if (
      !hasProcessedSigninRef.current &&
      searchParams.get("signin") === "true"
    ) {
      setSigninOpen(true)
      hasProcessedSigninRef.current = true
      router.replace("/", { scroll: false })
    }
  }, [searchParams, router])

  // Redirect authenticated users
  useEffect(() => {
    if (!isLoading && user) {
      router.push(getHomePath())
    }
  }, [user, isLoading, router])

  /* ── SEO structured data (JSON-LD) ── */
  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Frame Beauty",
      alternateName: "Frame",
      url: "https://framebeauty.com",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "All",
      description:
        "Frame Beauty — the all-in-one platform to discover beauty trends, shop professional products, and book appointments at top-rated salons and barbershops near you.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "1000",
      },
    }),
    [],
  )

  if (isLoading) {
    return (
      <ErrorBoundary>
        <LandingSkeleton />
      </ErrorBoundary>
    )
  }

  if (user) return null

  return (
    <ErrorBoundary>
      {/* JSON-LD structured data for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-background min-h-screen overflow-x-hidden">
        {/* ── Top Bar ── */}
        <TopBar onGetStarted={openSignUp} />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            HERO — staggered fade-up + parallax glow
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          ref={heroRef}
          className="relative px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12 lg:pb-20"
        >
          {/* Animated background orbs */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div
              className="bg-primary/[0.035] absolute h-[700px] w-[700px] rounded-full blur-[120px] transition-transform duration-[0ms]"
              style={{
                top: "20%",
                left: "50%",
                transform: `translate(-50%, ${heroParallax.offset * 0.6}px)`,
              }}
            />
            <div
              className="absolute h-[400px] w-[400px] rounded-full bg-violet-500/[0.02] blur-[100px] transition-transform duration-[0ms]"
              style={{
                top: "60%",
                left: "25%",
                transform: `translate(-50%, ${heroParallax.offset * 0.3}px)`,
              }}
            />
          </div>

          <div className="relative mx-auto max-w-5xl text-center">
            {/* Headline — staggered from badge */}
            <h1
              className={`text-foreground mt-6 mb-4 text-4xl leading-[1.15] font-bold tracking-tight transition-all duration-900 ease-out sm:text-5xl lg:text-6xl ${heroInView.inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              style={{
                fontFamily: "var(--font-nunito), sans-serif",
                transitionDelay: heroInView.inView ? "150ms" : "0ms",
              }}
            >
              Your beauty journey
              <br />
              starts with
            </h1>
            <HeroBrandLogo
              className="mb-4 transition-all duration-1000 ease-out"
              inView={heroInView.inView}
            />

            {/* Badge — below logo */}
            <div
              className={`mb-8 transition-all duration-700 ease-out ${heroInView.inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ transitionDelay: heroInView.inView ? "500ms" : "0ms" }}
            >
              <span className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                Feed · Shop · Book
              </span>
            </div>

            {/* Subtitle */}
            <p
              className={`text-muted-foreground mx-auto mb-12 max-w-2xl text-lg leading-relaxed transition-all duration-700 ease-out sm:text-xl ${heroInView.inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              style={{ transitionDelay: heroInView.inView ? "300ms" : "0ms" }}
            >
              Discover trending styles in your feed, shop curated beauty
              products, and book appointments at top-rated lounges near you —
              all in one place.
            </p>

            {/* CTA buttons — staggered */}
            <div
              className={`flex flex-col items-center justify-center gap-4 transition-all duration-700 ease-out sm:flex-row ${heroInView.inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              style={{ transitionDelay: heroInView.inView ? "450ms" : "0ms" }}
            >
              <Button
                size="lg"
                className="group shadow-primary/20 hover:shadow-primary/30 h-13 min-w-[220px] px-8 text-base font-semibold shadow-lg transition-shadow hover:shadow-xl"
                onClick={openSignUp}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-13 min-w-[220px] px-8 text-base font-semibold"
                onClick={openSignIn}
              >
                Sign In
              </Button>
            </div>

            {/* Trust indicators */}
            <div
              className={`text-muted-foreground mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm transition-all duration-700 ease-out ${heroInView.inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ transitionDelay: heroInView.inView ? "650ms" : "0ms" }}
            >
              {[
                "Free to use",
                "No credit card required",
                "Instant booking",
              ].map((text) => (
                <span key={text} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            THE THREE PILLARS — slide-in from sides + stagger
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          ref={pillarsInView.setRef}
          className="border-border/50 border-t px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="mx-auto max-w-6xl">
            {/* Section header */}
            <div
              className={`mb-16 text-center transition-all duration-700 ease-out ${pillarsInView.inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            >
              <span className="text-primary mb-3 block text-sm font-semibold tracking-wider uppercase">
                The Platform
              </span>
              <h2
                className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-nunito), sans-serif" }}
              >
                Everything you need
              </h2>
              <p className="text-muted-foreground mx-auto max-w-xl text-lg">
                One platform, three powerful experiences designed to elevate
                every part of your beauty journey.
              </p>
            </div>

            {/* Pillar cards */}
            <div className="grid gap-6 lg:grid-cols-3">
              {PILLARS.map((pillar, i) => {
                const Icon = pillar.icon
                // Alternate slide direction: left, up, right
                const slideClass = pillarsInView.inView
                  ? "translate-x-0 translate-y-0 opacity-100"
                  : i === 0
                    ? "-translate-x-12 opacity-0"
                    : i === 2
                      ? "translate-x-12 opacity-0"
                      : "translate-y-12 opacity-0"

                return (
                  <div
                    key={pillar.title}
                    className={`group bg-card border-border hover:border-primary/30 relative overflow-hidden rounded-2xl border p-8 transition-all duration-700 ease-out hover:shadow-xl ${slideClass}`}
                    style={{
                      transitionDelay: pillarsInView.inView
                        ? `${200 + i * 150}ms`
                        : "0ms",
                    }}
                  >
                    {/* Watermark number */}
                    <div
                      aria-hidden
                      className="text-primary/[0.04] pointer-events-none absolute -top-6 -right-4 text-[120px] leading-none font-black transition-transform duration-700 ease-out select-none group-hover:scale-110"
                    >
                      {pillar.number}
                    </div>

                    {/* Hover glow */}
                    <div className="bg-primary/[0.03] pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative">
                      <div className="mb-5 flex items-center gap-4">
                        <div className="bg-primary/10 text-primary group-hover:bg-primary/15 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-foreground text-xl font-bold">
                            {pillar.title}
                          </h3>
                          <p className="text-primary text-sm font-medium">
                            {pillar.tagline}
                          </p>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                        {pillar.description}
                      </p>

                      <ul className="space-y-2.5">
                        {pillar.features.map((feat) => (
                          <li
                            key={feat}
                            className="text-foreground flex items-start gap-2.5 text-sm"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            HOW IT WORKS — parallax offset + horizontal reveal
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          ref={stepsRef}
          className="bg-muted/30 border-border/50 relative border-t px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="mx-auto max-w-5xl">
            <div
              className={`mb-16 text-center transition-all duration-700 ease-out ${stepsInView.inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            >
              <span className="text-primary mb-3 block text-sm font-semibold tracking-wider uppercase">
                Simple & Fast
              </span>
              <h2
                className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-nunito), sans-serif" }}
              >
                How it works
              </h2>
              <p className="text-muted-foreground mx-auto max-w-xl text-lg">
                From discovery to doorstep — here&apos;s how Frame works.
              </p>
            </div>

            <div className="grid gap-10 md:grid-cols-3 md:gap-8">
              {STEPS.map((s, i) => (
                <div
                  key={s.step}
                  className={`relative text-center transition-all duration-800 ease-out md:text-left ${stepsInView.inView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                  style={{
                    transitionDelay: stepsInView.inView
                      ? `${300 + i * 200}ms`
                      : "0ms",
                  }}
                >
                  {/* Connector line (desktop) */}
                  {i < STEPS.length - 1 && (
                    <div
                      aria-hidden
                      className={`border-primary/20 absolute top-8 right-0 hidden w-[calc(50%-20px)] translate-x-full border-t-2 border-dashed transition-all duration-1000 ease-out md:block ${stepsInView.inView ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`}
                      style={{
                        transformOrigin: "left",
                        transitionDelay: stepsInView.inView
                          ? `${700 + i * 300}ms`
                          : "0ms",
                      }}
                    />
                  )}

                  {/* Step number with animated ring */}
                  <div className="relative mx-auto mb-4 h-16 w-16 md:mx-0">
                    <div
                      className={`border-primary/20 absolute inset-0 rounded-full border-2 transition-all duration-700 ease-out ${stepsInView.inView ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
                      style={{
                        transitionDelay: stepsInView.inView
                          ? `${400 + i * 200}ms`
                          : "0ms",
                      }}
                    />
                    <div className="text-primary/30 relative flex h-full w-full items-center justify-center text-2xl font-black">
                      {s.step}
                    </div>
                  </div>

                  <h3 className="text-foreground mb-2 text-xl font-bold">
                    {s.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            STATS — scale-up + counter animation
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          ref={statsInView.setRef}
          className="border-border/50 border-t px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="mx-auto max-w-4xl">
            <div className="flex items-start justify-center gap-10 text-center sm:gap-16 lg:gap-20">
              {[
                {
                  value: `${centersCount}+`,
                  label: "Partner Lounges",
                  icon: Users,
                },
                {
                  value: `${customersCount.toLocaleString()}+`,
                  label: "Happy Customers",
                  icon: Zap,
                },
                {
                  value: (ratingCount / 10).toFixed(1),
                  label: "Average Rating",
                  icon: Star,
                },
              ].map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className={`transition-all duration-700 ease-out ${statsInView.inView ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-90 opacity-0"}`}
                    style={{
                      transitionDelay: statsInView.inView
                        ? `${i * 150}ms`
                        : "0ms",
                    }}
                  >
                    <div className="bg-primary/10 mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl">
                      <Icon className="text-primary h-4.5 w-4.5" />
                    </div>
                    <div className="text-foreground mb-1 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground text-xs font-medium">
                      {stat.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            FOR CLIENTS — slide-in right/left
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          ref={clientsInView.setRef}
          className="border-border/50 border-t px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-14 lg:grid-cols-2">
              {/* Left — visual card (slide from left) */}
              <div
                className={`relative hidden transition-all duration-800 ease-out lg:block ${clientsInView.inView ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"}`}
                style={{
                  transitionDelay: clientsInView.inView ? "200ms" : "0ms",
                }}
              >
                <div className="bg-card border-border relative rounded-2xl border p-8 shadow-xl">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full">
                      <Sparkles className="text-primary h-7 w-7" />
                    </div>
                    <div>
                      <div className="text-foreground text-lg font-bold">
                        Your Beauty Hub
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Everything in one place
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Trending Styles", icon: "🔥" },
                      { label: "Saved Lounges", icon: "💜" },
                      { label: "Upcoming Booking", icon: "📅" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-muted/50 flex items-center gap-3 rounded-lg px-4 py-3"
                      >
                        <span className="text-base">{item.icon}</span>
                        <span className="text-foreground text-sm font-medium">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex gap-3">
                    <div className="bg-primary/10 text-primary flex-1 rounded-lg py-2.5 text-center text-sm font-semibold">
                      5 new posts
                    </div>
                    <div className="flex-1 rounded-lg bg-green-500/10 py-2.5 text-center text-sm font-semibold text-green-500">
                      2 bookings
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — copy (slide from right) */}
              <div
                className={`transition-all duration-800 ease-out ${clientsInView.inView ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"}`}
              >
                <span className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
                  For Clients
                </span>
                <h2
                  className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                  style={{ fontFamily: "var(--font-nunito), sans-serif" }}
                >
                  Your beauty,
                  <br />
                  your <span className="text-primary">way</span>
                </h2>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  Discover trending styles in the feed, shop products from top
                  lounges, and book your next appointment — all in one app.
                </p>
                <ul className="space-y-3">
                  {[
                    "Browse trending posts & reels from top lounges",
                    "Shop beauty products directly from the marketplace",
                    "Book appointments & join live queues",
                    "Save your favorite lounges & styles",
                    "Rate & review your experiences",
                  ].map((item, i) => (
                    <li
                      key={item}
                      className={`text-foreground flex items-start gap-3 text-sm transition-all duration-500 ease-out ${clientsInView.inView ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`}
                      style={{
                        transitionDelay: clientsInView.inView
                          ? `${400 + i * 80}ms`
                          : "0ms",
                      }}
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  className="group mt-8 h-11 px-6 font-semibold"
                  onClick={openSignUp}
                >
                  Get Started
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            FOR LOUNGES (B2B) — slide-in left/right
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          ref={b2bInView.setRef}
          className="bg-muted/30 border-border/50 border-t px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-14 lg:grid-cols-2">
              {/* Left — copy (slide from left) */}
              <div
                className={`transition-all duration-800 ease-out ${b2bInView.inView ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"}`}
              >
                <span className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
                  For Lounges
                </span>
                <h2
                  className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                  style={{ fontFamily: "var(--font-nunito), sans-serif" }}
                >
                  Grow your business
                  <br />
                  with <InlineBrandLogo />
                </h2>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  Publish to the feed, list your products in the marketplace,
                  and manage your bookings — all from one powerful dashboard.
                </p>
                <ul className="space-y-3">
                  {[
                    "Publish posts & reels to the feed",
                    "List & sell products in the shop",
                    "Online booking & live queue management",
                    "Ratings & reviews to build trust",
                    "Analytics & client insights dashboard",
                  ].map((item, i) => (
                    <li
                      key={item}
                      className={`text-foreground flex items-start gap-3 text-sm transition-all duration-500 ease-out ${b2bInView.inView ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
                      style={{
                        transitionDelay: b2bInView.inView
                          ? `${400 + i * 80}ms`
                          : "0ms",
                      }}
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  className="group mt-8 h-11 px-6 font-semibold"
                  onClick={openSignUp}
                >
                  Register Your Lounge
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>

              {/* Right — visual card stack (slide from right) */}
              <div
                className={`relative hidden transition-all duration-800 ease-out lg:block ${b2bInView.inView ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"}`}
                style={{ transitionDelay: b2bInView.inView ? "200ms" : "0ms" }}
              >
                <div className="bg-card border-border absolute top-4 right-4 left-4 h-56 rounded-2xl border shadow-sm" />
                <div className="bg-card border-border absolute top-8 right-8 left-8 h-56 rounded-2xl border shadow-sm" />
                <div className="bg-card border-border relative rounded-2xl border p-8 shadow-xl">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full">
                      <Scissors className="text-primary h-7 w-7" />
                    </div>
                    <div>
                      <div className="text-foreground text-lg font-bold">
                        Studio Elite
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Premium Salon — 4.9 ★
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Haircut — 25 TND",
                      "Beard Trim — 15 TND",
                      "Full Package — 45 TND",
                    ].map((service) => (
                      <div
                        key={service}
                        className="bg-muted/50 flex items-center justify-between rounded-lg px-4 py-3"
                      >
                        <span className="text-foreground text-sm font-medium">
                          {service.split(" — ")[0]}
                        </span>
                        <span className="text-primary text-sm font-bold">
                          {service.split(" — ")[1]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex gap-3">
                    <div className="bg-primary/10 text-primary flex-1 rounded-lg py-2.5 text-center text-sm font-semibold">
                      12 bookings today
                    </div>
                    <div className="flex-1 rounded-lg bg-green-500/10 py-2.5 text-center text-sm font-semibold text-green-500">
                      3 in queue
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            FINAL CTA — scale-in
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          ref={ctaInView.setRef}
          className="border-border/50 border-t px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
        >
          <div
            className={`mx-auto max-w-3xl text-center transition-all duration-800 ease-out ${ctaInView.inView ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-95 opacity-0"}`}
          >
            <h2
              className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-nunito), sans-serif" }}
            >
              Ready to experience <InlineBrandLogo />?
            </h2>
            <p className="text-muted-foreground mx-auto mb-10 max-w-xl text-lg">
              Join thousands of customers and lounges who already trust Frame
              Beauty. Your next great experience is one tap away.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="group shadow-primary/20 hover:shadow-primary/30 h-13 min-w-[220px] px-8 text-base font-semibold shadow-lg transition-shadow hover:shadow-xl"
                onClick={openSignUp}
              >
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-muted-foreground h-13 px-8 text-base font-medium"
                onClick={openSignIn}
              >
                I already have an account
              </Button>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-border/50 border-t px-4 pt-16 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Top row — brand + links */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
              {/* Brand column */}
              <div className="col-span-2 sm:col-span-3 lg:col-span-1">
                <div className="mb-3 flex items-baseline">
                  <FooterBrandLogo />
                </div>
                <p className="text-muted-foreground mb-5 max-w-xs text-sm leading-relaxed">
                  The all-in-one platform to discover trends, shop beauty
                  products, and book appointments at top-rated lounges near you.
                </p>
                <div className="overflow-hidden">
                  <div className="animate-marquee flex w-max items-center gap-2">
                    {[0, 1].map((copy) => (
                      <div key={copy} className="flex items-center gap-2">
                        <a
                          href="https://instagram.com/framebeauty"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Frame Beauty on Instagram"
                          className="text-muted-foreground hover:text-primary hover:border-border inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent transition-colors"
                        >
                          <Instagram className="h-4 w-4" />
                        </a>
                        <a
                          href="https://facebook.com/framebeauty"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Frame Beauty on Facebook"
                          className="text-muted-foreground hover:text-primary hover:border-border inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent transition-colors"
                        >
                          <Facebook className="h-4 w-4" />
                        </a>
                        <a
                          href="https://threads.net/@framebeauty"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Frame Beauty on Threads"
                          className="text-muted-foreground hover:text-primary hover:border-border inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent transition-colors"
                        >
                          <ThreadsIcon className="h-4 w-4" />
                        </a>
                        <a
                          href="https://tiktok.com/@framebeauty"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Frame Beauty on TikTok"
                          className="text-muted-foreground hover:text-primary hover:border-border inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent transition-colors"
                        >
                          <TikTokIcon className="h-4 w-4" />
                        </a>
                        <a
                          href="https://youtube.com/@framebeauty"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Frame Beauty on YouTube"
                          className="text-muted-foreground hover:text-primary hover:border-border inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent transition-colors"
                        >
                          <Youtube className="h-4 w-4" />
                        </a>
                        <a
                          href="https://linkedin.com/company/framebeauty"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Frame Beauty on LinkedIn"
                          className="text-muted-foreground hover:text-primary hover:border-border inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent transition-colors"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                        <a
                          href="https://x.com/framebeauty"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Frame Beauty on X"
                          className="text-muted-foreground hover:text-primary hover:border-border inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent transition-colors"
                        >
                          <XIcon className="h-4 w-4" />
                        </a>
                        <a
                          href="mailto:abbassimoohamed@gmail.com"
                          aria-label="Email Frame Beauty"
                          className="text-muted-foreground hover:text-primary hover:border-border inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Platform column */}
              <div>
                <h4 className="text-foreground mb-3 text-sm font-semibold">
                  Platform
                </h4>
                <ul className="text-muted-foreground space-y-2.5 text-sm">
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      Feed
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      Shop
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      Book
                    </button>
                  </li>
                </ul>
              </div>

              {/* For Clients column */}
              <div>
                <h4 className="text-foreground mb-3 text-sm font-semibold">
                  For Clients
                </h4>
                <ul className="text-muted-foreground space-y-2.5 text-sm">
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      Discover Styles
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      Book Appointments
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      Saved & Favorites
                    </button>
                  </li>
                </ul>
              </div>

              {/* For Lounges column */}
              <div>
                <h4 className="text-foreground mb-3 text-sm font-semibold">
                  For Lounges
                </h4>
                <ul className="text-muted-foreground space-y-2.5 text-sm">
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      Register Your Lounge
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      Dashboard
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      Analytics
                    </button>
                  </li>
                </ul>
              </div>

              {/* Contact column */}
              <div>
                <h4 className="text-foreground mb-3 text-sm font-semibold">
                  Contact
                </h4>
                <ul className="text-muted-foreground space-y-2.5 text-sm">
                  <li>
                    <a
                      href="mailto:abbassimoohamed@gmail.com"
                      className="hover:text-foreground break-all transition-colors"
                    >
                      abbassimoohamed@gmail.com
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://instagram.com/framebeauty"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      @framebeauty
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Divider */}
            <div className="border-border/50 mt-12 border-t" />

            {/* Bottom row — copyright */}
            <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-muted-foreground text-xs">
                &copy; {new Date().getFullYear()} Frame Beauty. All rights
                reserved.
              </p>
              <p className="text-muted-foreground/60 text-xs">
                Crafted with care in Tunisia
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* ── Signup Dialog ── */}
      <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
        <DialogContent
          className="max-h-[90vh] w-[90%] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <SignupFlow
            onSuccess={() => setSignupOpen(false)}
            onOpenSignInFlow={() => {
              setSignupOpen(false)
              setSigninOpen(true)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* ── Sign-in Dialog ── */}
      <Dialog open={signinOpen} onOpenChange={setSigninOpen}>
        <DialogContent
          className="max-h-[90vh] w-[90%] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <SignInDialog
            onSuccess={() => setSigninOpen(false)}
            onClose={() => setSigninOpen(false)}
            onOpenSignUpFlow={() => {
              setSigninOpen(false)
              setSignupOpen(true)
            }}
          />
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  )
}

export default LandingPage
