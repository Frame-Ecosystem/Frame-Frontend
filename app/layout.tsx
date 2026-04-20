import type { Metadata } from "next"
import { Inter, Nunito } from "next/font/google"

// Global styles
import "./globals.css"

// Third-party components
import { Toaster } from "sonner"
import { SpeedInsights } from "@vercel/speed-insights/next"

// Internal components
import ProgressProvider from "./_components/forms/progress-bar"
import MainContentWrapper from "./_components/layout/mainContentWrapper"

// Context providers
import { LanguageProvider } from "./_i18n"
import { ThemeProviderComponent } from "./_providers/theme"
import { SwipeNavigationProvider } from "./_providers/swipe-navigation"
import { AuthProvider, AuthGuard } from "./_auth"
import { QueryProvider } from "./_providers/query"
import { NotificationProvider } from "./_providers/notification"
import { PushNotificationProvider } from "./_providers/push-notification"
import ServiceWorkerRegister from "./_components/common/serviceWorkerRegister"

// Client component to handle pathname-based conditional rendering
import ConditionalHeader from "./_components/layout/conditional-header"
import ConditionalFooter from "./_components/layout/conditional-footer"

const inter = Inter({ subsets: ["latin"] })
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" })

export const metadata: Metadata = {
  // Base URL for resolving relative URLs in metadata
  metadataBase: new URL("https://framebeauty.com"),

  // Primary title template — child pages inherit "X | Frame Beauty"
  title: {
    default:
      "Frame Beauty — Feed, Shop & Book | The All-in-One Beauty Platform",
    template: "%s | Frame Beauty",
  },

  // Description for search engine results (155 chars target, keyword-rich)
  description:
    "Frame Beauty is the all-in-one platform to discover trending beauty styles, shop professional products, and book appointments at top-rated salons and barbershops near you. Free to use.",

  // Comprehensive bilingual keywords for maximum SEO coverage
  keywords: [
    // Brand
    "Frame",
    "Frame Beauty",
    "Frame app",
    "Frame platform",
    // English — core
    "beauty platform",
    "salon booking",
    "barbershop booking",
    "book appointment online",
    "beauty marketplace",
    "beauty products online",
    "beauty feed",
    "hair salon near me",
    "barbershop near me",
    "online booking system",
    "salon management",
    "queue management",
    "beauty trends",
    "haircut booking",
    "beard trim",
    "skincare products",
    "haircare products",
    // French — core
    "réservation salon",
    "salon de coiffure",
    "salon de beauté",
    "barbier en ligne",
    "prendre rendez-vous coiffeur",
    "produits beauté",
    "tendances beauté",
    "coiffeur proche",
    "gestion salon",
    "file d'attente salon",
    "Tunisie",
  ],

  // Authors & creator
  authors: [{ name: "Frame", url: "https://framebeauty.com" }],
  creator: "Frame",
  publisher: "Frame",

  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Canonical & alternates
  alternates: {
    canonical: "https://framebeauty.com",
    languages: {
      "fr-TN": "https://framebeauty.com",
      "en-US": "https://framebeauty.com",
    },
  },

  // Category for search engines
  category: "beauty",

  // Favicon configuration
  icons: {
    icon: [
      // Primary: scalable SVG (modern browsers)
      { url: "/icon.svg", type: "image/svg+xml" },
      // Fallback: PNG raster for legacy browsers
      {
        url: "/images/favicon.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: [
      { url: "/icon.svg", type: "image/svg+xml" },
      {
        url: "/images/favicon.png",
        type: "image/png",
      },
    ],
    apple: [
      // iOS home screen icon (Safari renders SVG correctly on iOS 16+)
      { url: "/icon.svg", type: "image/svg+xml" },
      {
        url: "/images/favicon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  // PWA manifest
  manifest: "/manifest.json",

  // Open Graph metadata for social media sharing (Facebook, LinkedIn, etc.)
  openGraph: {
    title: "Frame Beauty — Feed, Shop & Book | The All-in-One Beauty Platform",
    description:
      "Discover trending styles, shop curated beauty products, and book appointments at top-rated salons near you. Frame Beauty — your complete beauty journey starts here.",
    url: "https://framebeauty.com",
    siteName: "Frame Beauty",
    images: [
      {
        url: "/images/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Frame Beauty — Feed, Shop & Book",
      },
    ],
    locale: "fr_TN",
    alternateLocale: ["en_US"],
    type: "website",
  },

  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "Frame Beauty — Feed, Shop & Book",
    description:
      "Discover trending styles, shop curated beauty products, and book appointments at top-rated salons near you.",
    images: ["/images/og-banner.png"],
    creator: "@framebeauty",
    site: "@framebeauty",
  },

  // Verification (add your IDs when available)
  // verification: {
  //   google: "your-google-verification-id",
  // },

  // App links
  appLinks: {
    web: {
      url: "https://framebeauty.com",
      should_fallback: true,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // suppressHydrationWarning prevents hydration mismatch warnings from theme changes
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Brand SVG icon (theme-independent, infinitely scalable) */}
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />

        {/* PNG fallback for browsers that don't support SVG favicons */}
        <link rel="icon" type="image/png" href="/images/favicon.png" />

        {/* Apple touch icon (home screen on iOS) */}
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/images/favicon.png" />
      </head>
      <body className={`${inter.className} ${nunito.variable}`}>
        {/* PROVIDER HIERARCHY */}

        {/* Language provider — outermost so every component can translate */}
        <LanguageProvider>
          {/* Theme provider for dark/light mode support */}
          <ThemeProviderComponent>
            {/* Query provider for data fetching and caching */}
            <QueryProvider>
              {/* Auth provider for user authentication state */}
              <AuthProvider>
                {/* Notification provider for real-time in-app notifications */}
                <NotificationProvider>
                  {/* Push notification provider for FCM registration & prompts */}
                  <PushNotificationProvider>
                    {/* Swipe navigation for mobile back/forward gestures */}
                    <SwipeNavigationProvider>
                      {/* Progress bar for page transition feedback */}
                      <ProgressProvider>
                        <ServiceWorkerRegister />
                        {/* MAIN LAYOUT STRUCTURE */}
                        {/* Uses flexbox to keep footer at bottom of viewport */}
                        <div className="flex min-h-screen flex-col">
                          {/* Header handles top bars and navigation visibility */}
                          <ConditionalHeader />
                          {/* Main content area - flex-1 always reserves space */}
                          <MainContentWrapper>
                            <AuthGuard>{children}</AuthGuard>
                          </MainContentWrapper>
                          {/* Footer - always at the bottom for desktop */}
                          <ConditionalFooter />
                        </div>
                      </ProgressProvider>
                    </SwipeNavigationProvider>
                  </PushNotificationProvider>
                </NotificationProvider>
              </AuthProvider>
            </QueryProvider>
          </ThemeProviderComponent>
        </LanguageProvider>

        {/* GLOBAL UI COMPONENTS */}

        {/* Toast notification container from Sonner library */}
        <Toaster />

        {/* Vercel Speed Insights for performance monitoring */}
        <SpeedInsights />
      </body>
    </html>
  )
}
