"use client"
/* eslint-disable react-hooks/refs -- useInView/useParallax return useState values, not refs */

import { useAuth } from "./_auth"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
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
  Apple,
  Smartphone,
  Bell,
  Globe,
  ChevronDown,
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
import { useTranslation } from "./_i18n"

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

const PILLAR_META = [
  { number: "01", icon: Newspaper, key: "feed" },
  { number: "02", icon: ShoppingBag, key: "shop" },
  { number: "03", icon: Calendar, key: "book" },
] as const

const STEP_META = [
  { step: "01", key: "discover" },
  { step: "02", key: "choose" },
  { step: "03", key: "shine" },
] as const

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

// FAQ accordion item — defined outside LandingPage to keep render stable
function FaqItem({
  question,
  answer,
  delay,
  inView,
}: {
  question: string
  answer: string
  delay: number
  inView: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`bg-card border-border/50 overflow-hidden rounded-xl border transition-all duration-700 ease-out ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <button
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-foreground text-sm font-semibold">
          {question}
        </span>
        <ChevronDown
          className={`text-muted-foreground ml-3 h-4 w-4 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-border/40 border-t px-5 pt-3 pb-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {answer}
          </p>
        </div>
      )}
    </div>
  )
}

const LandingPage = () => {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const [signupOpen, setSignupOpen] = useState(false)
  const [signinOpen, setSigninOpen] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState("")
  const [notifySubmitted, setNotifySubmitted] = useState(false)
  const hasProcessedSigninRef = useRef(false)

  const PILLARS = useMemo(
    () =>
      PILLAR_META.map((m, i) => {
        const n = i + 1
        return {
          ...m,
          icon: m.icon,
          title: t(`landing.pillar${n}Title`),
          tagline: t(`landing.pillar${n}Tagline`),
          description: t(`landing.pillar${n}Desc`),
          features: [
            t(`landing.pillar${n}Feat1`),
            t(`landing.pillar${n}Feat2`),
            t(`landing.pillar${n}Feat3`),
            t(`landing.pillar${n}Feat4`),
          ],
        }
      }),
    [t],
  )

  const STEPS = useMemo(
    () =>
      STEP_META.map((m, i) => ({
        ...m,
        title: t(`landing.step${i + 1}Title`),
        description: t(`landing.step${i + 1}Desc`),
      })),
    [t],
  )

  /* ── Scroll-based hooks ── */
  const heroInView = useInView(0.05)
  const pillarsInView = useInView(0.08)
  const stepsInView = useInView(0.1)
  const statsInView = useInView(0.15)
  const clientsInView = useInView(0.1)
  const b2bInView = useInView(0.1)
  const testimonialsInView = useInView(0.1)
  const faqInView = useInView(0.1)
  const mobileInView = useInView(0.12)
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
              {t("landing.heroTitle")
                .split("\n")
                .map((line, i) => (
                  <span key={i}>
                    {line}
                    {i === 0 && <br />}
                  </span>
                ))}
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
                {t("landing.heroBadge")}
              </span>
            </div>

            {/* Subtitle */}
            <p
              className={`text-muted-foreground mx-auto mb-12 max-w-2xl text-lg leading-relaxed transition-all duration-700 ease-out sm:text-xl ${heroInView.inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              style={{ transitionDelay: heroInView.inView ? "300ms" : "0ms" }}
            >
              {t("landing.heroSubtitle")}
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
                {t("landing.getStartedFree")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-13 min-w-[220px] px-8 text-base font-semibold"
                onClick={openSignIn}
              >
                {t("landing.signIn")}
              </Button>
            </div>

            {/* Trust indicators */}
            <div
              className={`text-muted-foreground mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm transition-all duration-700 ease-out ${heroInView.inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ transitionDelay: heroInView.inView ? "650ms" : "0ms" }}
            >
              {[
                {
                  text: t("landing.freeToUse"),
                  icon: CheckCircle2,
                  color: "text-green-500",
                },
                {
                  text: t("landing.noCreditCard"),
                  icon: CheckCircle2,
                  color: "text-green-500",
                },
                {
                  text: t("landing.instantBooking"),
                  icon: CheckCircle2,
                  color: "text-green-500",
                },
                {
                  text: t("landing.trustedInTunisia"),
                  icon: Star,
                  color: "text-primary",
                },
              ].map(({ text, icon: Icon, color }) => (
                <span key={text} className="inline-flex items-center gap-1.5">
                  <Icon className={`h-4 w-4 ${color}`} />
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
                {t("landing.thePlatform")}
              </span>
              <h2
                className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-nunito), sans-serif" }}
              >
                {t("landing.everythingYouNeed")}
              </h2>
              <p className="text-muted-foreground mx-auto max-w-xl text-lg">
                {t("landing.platformSubtitle")}
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
                {t("landing.simpleAndFast")}
              </span>
              <h2
                className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-nunito), sans-serif" }}
              >
                {t("landing.howItWorks")}
              </h2>
              <p className="text-muted-foreground mx-auto max-w-xl text-lg">
                {t("landing.stepsSubtitle")}
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
                  label: t("landing.partnerLounges"),
                  icon: Users,
                },
                {
                  value: `${customersCount.toLocaleString()}+`,
                  label: t("landing.happyCustomers"),
                  icon: Zap,
                },
                {
                  value: (ratingCount / 10).toFixed(1),
                  label: t("landing.averageRating"),
                  icon: Star,
                },
                {
                  value: "1k+",
                  label: t("landing.fiveStarReviews"),
                  icon: CheckCircle2,
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
            TESTIMONIALS — staggered fade-in cards
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          ref={testimonialsInView.setRef}
          className="border-border/50 border-t px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="mx-auto max-w-5xl">
            {/* Header */}
            <div
              className={`mb-12 text-center transition-all duration-700 ease-out ${testimonialsInView.inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            >
              <span className="text-primary mb-3 block text-xs font-semibold tracking-widest uppercase">
                {t("landing.testimonials")}
              </span>
              <h2 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                {t("landing.testimonialsTitle")}
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-sm leading-relaxed sm:text-base">
                {t("landing.testimonialsSubtitle")}
              </p>
            </div>
            {/* Cards */}
            <div className="grid gap-5 sm:grid-cols-2">
              {(
                [
                  {
                    name: t("landing.t1Name"),
                    role: t("landing.t1Role"),
                    text: t("landing.t1Text"),
                  },
                  {
                    name: t("landing.t2Name"),
                    role: t("landing.t2Role"),
                    text: t("landing.t2Text"),
                  },
                  {
                    name: t("landing.t3Name"),
                    role: t("landing.t3Role"),
                    text: t("landing.t3Text"),
                  },
                  {
                    name: t("landing.t4Name"),
                    role: t("landing.t4Role"),
                    text: t("landing.t4Text"),
                  },
                ] as { name: string; role: string; text: string }[]
              ).map((item, i) => (
                <div
                  key={item.name}
                  className={`bg-card border-border/50 rounded-2xl border p-6 transition-all duration-700 ease-out ${testimonialsInView.inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                  style={{
                    transitionDelay: testimonialsInView.inView
                      ? `${i * 120}ms`
                      : "0ms",
                  }}
                >
                  {/* Stars */}
                  <div className="mb-4 flex gap-0.5">
                    {[...Array(5)].map((_, s) => (
                      <Star
                        key={s}
                        className="text-primary h-4 w-4 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-foreground mb-5 text-sm leading-relaxed">
                    &ldquo;{item.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/15 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-foreground text-sm font-semibold">
                        {item.name}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {item.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                        {t("landing.clientsTitle")
                          .split("\n")
                          .map((line, i) => (
                            <span key={i}>
                              {i === 0 ? (
                                line
                              ) : (
                                <>
                                  {line.replace("way", "")} <InlineBrandLogo />
                                </>
                              )}
                              {i === 0 && <br />}
                            </span>
                          ))}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {[
                          {
                            icon: <Scissors className="h-4 w-4" />,
                            label: t("landing.clientsFeat1"),
                          },
                          {
                            icon: <ShoppingBag className="h-4 w-4" />,
                            label: t("landing.clientsFeat2"),
                          },
                          {
                            icon: <Calendar className="h-4 w-4" />,
                            label: t("landing.clientsFeat3"),
                          },
                          {
                            icon: <Users className="h-4 w-4" />,
                            label: t("landing.clientsFeat4"),
                          },
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
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <div className="bg-primary/10 text-primary flex-1 rounded-lg py-2.5 text-center text-sm font-semibold">
                      {t("landing.newPosts")}
                    </div>
                    <div className="flex-1 rounded-lg bg-green-500/10 py-2.5 text-center text-sm font-semibold text-green-500">
                      {t("landing.bookingsCount")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — copy (slide from right) */}
              <div
                className={`transition-all duration-800 ease-out ${clientsInView.inView ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"}`}
              >
                <span className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
                  {t("landing.forClients")}
                </span>
                <h2
                  className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                  style={{ fontFamily: "var(--font-nunito), sans-serif" }}
                >
                  {t("landing.clientsTitle")
                    .split("\n")
                    .map((line, i) => (
                      <span key={i}>
                        {i === 0 ? (
                          line
                        ) : (
                          <>
                            {line.replace("way", "")} <InlineBrandLogo />
                          </>
                        )}
                        {i === 0 && <br />}
                      </span>
                    ))}
                </h2>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  {t("landing.clientsSubtitle")}
                </p>
                <ul className="space-y-3">
                  {[
                    t("landing.clientsFeat1"),
                    t("landing.clientsFeat2"),
                    t("landing.clientsFeat3"),
                    t("landing.clientsFeat4"),
                    t("landing.clientsFeat5"),
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
                  {t("landing.getStartedFree")}
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
                  {t("landing.forLounges")}
                </span>
                <h2
                  className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                  style={{ fontFamily: "var(--font-nunito), sans-serif" }}
                >
                  {t("landing.loungesTitle")
                    .split("\n")
                    .map((line, i) => (
                      <span key={i}>
                        {line}
                        {i === 0 ? (
                          <br />
                        ) : (
                          <>
                            {" "}
                            <InlineBrandLogo />
                          </>
                        )}
                      </span>
                    ))}
                </h2>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  {t("landing.loungesSubtitle")}
                </p>
                <ul className="space-y-3">
                  {[
                    t("landing.loungesFeat1"),
                    t("landing.loungesFeat2"),
                    t("landing.loungesFeat3"),
                    t("landing.loungesFeat4"),
                    t("landing.loungesFeat5"),
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
                  {t("landing.registerLounge")}
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
                        {t("landing.studioElite")}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {t("landing.premiumSalon")}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        name: t("landing.haircut"),
                        price: t("landing.haircutPrice"),
                      },
                      {
                        name: t("landing.beardTrim"),
                        price: t("landing.beardTrimPrice"),
                      },
                      {
                        name: t("landing.fullPackage"),
                        price: t("landing.fullPackagePrice"),
                      },
                    ].map((service) => (
                      <div
                        key={service.name}
                        className="bg-muted/50 flex items-center justify-between rounded-lg px-4 py-3"
                      >
                        <span className="text-foreground text-sm font-medium">
                          {service.name}
                        </span>
                        <span className="text-primary text-sm font-bold">
                          {service.price}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex gap-3">
                    <div className="bg-primary/10 text-primary flex-1 rounded-lg py-2.5 text-center text-sm font-semibold">
                      {t("landing.bookingsToday")}
                    </div>
                    <div className="flex-1 rounded-lg bg-green-500/10 py-2.5 text-center text-sm font-semibold text-green-500">
                      {t("landing.inQueue")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            FAQ
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          ref={faqInView.setRef}
          className="border-border/50 border-t px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="mx-auto max-w-3xl">
            <div
              className={`mb-10 text-center transition-all duration-700 ease-out ${faqInView.inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            >
              <span className="text-primary mb-3 block text-xs font-semibold tracking-widest uppercase">
                {t("landing.faqEyebrow")}
              </span>
              <h2 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
                {t("landing.faqTitle")}
              </h2>
              <p className="text-muted-foreground mt-3 text-sm sm:text-base">
                {t("landing.faqSubtitle")}
              </p>
            </div>
            <div className="space-y-3">
              {(
                [
                  { q: t("landing.faq1Q"), a: t("landing.faq1A") },
                  { q: t("landing.faq2Q"), a: t("landing.faq2A") },
                  { q: t("landing.faq3Q"), a: t("landing.faq3A") },
                  { q: t("landing.faq4Q"), a: t("landing.faq4A") },
                  { q: t("landing.faq5Q"), a: t("landing.faq5A") },
                ] as { q: string; a: string }[]
              ).map((item, i) => (
                <FaqItem
                  key={item.q}
                  question={item.q}
                  answer={item.a}
                  delay={faqInView.inView ? i * 80 : 0}
                  inView={faqInView.inView}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            MOBILE — web available now, native iOS / Android coming soon
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          ref={mobileInView.setRef}
          className="border-border/50 from-primary/5 relative overflow-hidden border-t bg-gradient-to-b to-transparent px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        >
          {/* Decorative orbs */}
          <div
            aria-hidden
            className="bg-primary/10 pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
          />
          <div
            aria-hidden
            className="bg-primary/10 pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full blur-3xl"
          />

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* ── Left: floating logo + status pills ── */}
            <div
              className={`relative flex flex-col items-center justify-center transition-all duration-1000 ease-out lg:items-start ${mobileInView.inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            >
              {/* Glow ring behind logo */}
              <div className="relative">
                <div
                  aria-hidden
                  className="from-primary/30 absolute inset-0 -z-10 animate-pulse rounded-full bg-gradient-to-tr to-transparent blur-2xl"
                />
                <div className="bg-card border-border/50 relative flex h-56 w-56 items-center justify-center rounded-[2.5rem] border shadow-2xl sm:h-64 sm:w-64 lg:h-72 lg:w-72">
                  <Image
                    src="/images/logos/fb-logo.png"
                    alt="Frame Beauty app icon"
                    width={240}
                    height={240}
                    priority
                    className="h-40 w-40 drop-shadow-xl select-none sm:h-48 sm:w-48 lg:h-56 lg:w-56"
                    draggable={false}
                  />
                  {/* Floating status badge */}
                  <span className="absolute -top-3 -right-3 inline-flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                    </span>
                    {t("landing.mobileLiveNow")}
                  </span>
                </div>
              </div>

              {/* Platform pills */}
              <div className="mt-8 grid w-full max-w-sm grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="bg-card border-border/60 flex flex-col items-center gap-1 rounded-xl border p-3 shadow-sm">
                  <Globe className="text-primary h-5 w-5" />
                  <span className="text-foreground text-xs font-bold">
                    {t("landing.mobileWeb")}
                  </span>
                  <span className="text-[10px] font-semibold tracking-wide text-green-500 uppercase">
                    {t("landing.mobileAvailable")}
                  </span>
                </div>
                <div className="bg-card/60 border-border/40 flex flex-col items-center gap-1 rounded-xl border border-dashed p-3">
                  <Apple className="text-muted-foreground h-5 w-5" />
                  <span className="text-foreground text-xs font-bold">iOS</span>
                  <span className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                    {t("landing.mobileSoon")}
                  </span>
                </div>
                <div className="bg-card/60 border-border/40 flex flex-col items-center gap-1 rounded-xl border border-dashed p-3">
                  <Smartphone className="text-muted-foreground h-5 w-5" />
                  <span className="text-foreground text-xs font-bold">
                    Android
                  </span>
                  <span className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                    {t("landing.mobileSoon")}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Right: copy + email capture ── */}
            <div
              className={`text-center transition-all duration-1000 ease-out lg:text-start ${mobileInView.inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
              style={{ transitionDelay: mobileInView.inView ? "200ms" : "0ms" }}
            >
              <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wider uppercase">
                {t("landing.mobileEyebrow")}
              </span>
              <h2
                className="text-foreground mb-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-nunito), sans-serif" }}
              >
                {t("landing.mobileTitle")}
              </h2>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                {t("landing.mobileSubtitle")}
              </p>

              {/* Bullet benefits */}
              <ul className="mb-8 space-y-3">
                {[
                  t("landing.mobileBenefit1"),
                  t("landing.mobileBenefit2"),
                  t("landing.mobileBenefit3"),
                ].map((b, i) => (
                  <li
                    key={b}
                    className={`text-foreground flex items-start gap-3 text-sm transition-all duration-500 ease-out sm:text-base ${mobileInView.inView ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`}
                    style={{
                      transitionDelay: mobileInView.inView
                        ? `${400 + i * 120}ms`
                        : "0ms",
                    }}
                  >
                    <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {/* Email capture for mobile launch notification */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (notifyEmail.trim()) setNotifySubmitted(true)
                }}
                className="bg-card border-border/60 mx-auto w-full max-w-md rounded-2xl border p-4 shadow-sm lg:mx-0"
              >
                {notifySubmitted ? (
                  <div className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-green-500">
                    <CheckCircle2 className="h-5 w-5" />
                    {t("landing.mobileNotifyThanks")}
                  </div>
                ) : (
                  <>
                    <label
                      htmlFor="mobile-notify-email"
                      className="text-foreground mb-2 flex items-center gap-2 text-sm font-semibold"
                    >
                      <Bell className="text-primary h-4 w-4" />
                      {t("landing.mobileNotifyLabel")}
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        id="mobile-notify-email"
                        type="email"
                        required
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        placeholder={t("landing.mobileNotifyPlaceholder")}
                        className="bg-background text-foreground placeholder:text-muted-foreground border-border focus:ring-primary/40 focus:border-primary h-11 flex-1 rounded-lg border px-4 text-sm transition-shadow outline-none focus:ring-2"
                      />
                      <Button
                        type="submit"
                        className="h-11 px-5 text-sm font-semibold"
                      >
                        {t("landing.mobileNotifyButton")}
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-muted-foreground mt-2 text-[11px]">
                      {t("landing.mobileNotifyDisclaimer")}
                    </p>
                  </>
                )}
              </form>
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
              {t("landing.ctaTitle")} <InlineBrandLogo />?
            </h2>
            <p className="text-muted-foreground mx-auto mb-10 max-w-xl text-lg">
              {t("landing.ctaSubtitle")}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="group shadow-primary/20 hover:shadow-primary/30 h-13 min-w-[220px] px-8 text-base font-semibold shadow-lg transition-shadow hover:shadow-xl"
                onClick={openSignUp}
              >
                {t("landing.createFreeAccount")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-muted-foreground h-13 px-8 text-base font-medium"
                onClick={openSignIn}
              >
                {t("landing.alreadyHaveAccount")}
              </Button>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-border/50 border-t px-4 pt-16 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Top row — brand + links */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:grid-cols-6">
              {/* Brand column */}
              <div className="col-span-2 sm:col-span-3 lg:col-span-1">
                <div className="mb-3 flex items-baseline">
                  <FooterBrandLogo />
                </div>
                <p className="text-muted-foreground mb-5 max-w-xs text-sm leading-relaxed">
                  {t("footer.description")}
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
                  {t("footer.platform")}
                </h4>
                <ul className="text-muted-foreground space-y-2.5 text-sm">
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      {t("footer.feed")}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      {t("footer.shop")}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      {t("footer.book")}
                    </button>
                  </li>
                </ul>
              </div>

              {/* For Clients column */}
              <div>
                <h4 className="text-foreground mb-3 text-sm font-semibold">
                  {t("footer.forClients")}
                </h4>
                <ul className="text-muted-foreground space-y-2.5 text-sm">
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      {t("footer.discoverStyles")}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      {t("footer.bookAppointments")}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      {t("footer.savedFavorites")}
                    </button>
                  </li>
                </ul>
              </div>

              {/* Common features (shared by Clients & Lounges) */}
              <div>
                <h4 className="text-foreground mb-3 text-sm font-semibold">
                  {t("footer.common")}
                </h4>
                <ul className="text-muted-foreground space-y-2.5 text-sm">
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      {t("footer.feed")}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      {t("footer.shop")}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      {t("marketplace.startSelling")}
                    </button>
                  </li>
                </ul>
              </div>

              {/* For Lounges column */}
              <div>
                <h4 className="text-foreground mb-3 text-sm font-semibold">
                  {t("footer.forLounges")}
                </h4>
                <ul className="text-muted-foreground space-y-2.5 text-sm">
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      {t("landing.loungesFeat1")}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground text-left transition-colors"
                    >
                      {t("landing.loungesFeat3")}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openSignUp}
                      className="hover:text-foreground transition-colors"
                    >
                      {t("landing.loungesFeat5")}
                    </button>
                  </li>
                </ul>
              </div>

              {/* Contact column */}
              <div>
                <h4 className="text-foreground mb-3 text-sm font-semibold">
                  {t("footer.contact")}
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
                &copy; {new Date().getFullYear()} {t("footer.copyright")}
              </p>
              <p className="text-muted-foreground/60 text-xs">
                {t("footer.madeIn")}
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* ── Signup Dialog ── */}
      <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
        <DialogContent
          className="top-[55%] max-h-[90vh] w-[90%] overflow-y-auto rounded-2xl"
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
          className="max-h-[90vh] w-[90%] overflow-y-auto rounded-2xl"
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
