import type { Metadata } from "next"
import { Inter } from "next/font/google"

// Global styles
import "./globals.css"

// Third-party components
import { Toaster } from "sonner"
import { SpeedInsights } from "@vercel/speed-insights/next"

// Internal components
import ProgressProvider from "./_components/forms/progress-bar"
import Header from "./_components/layout/header"
import MainContentWrapper from "./_components/layout/mainContentWrapper"

// Context providers
import { ThemeProviderComponent } from "./_providers/theme"
import { SwipeNavigationProvider } from "./_providers/swipe-navigation"
import { AuthProvider } from "./_providers/auth"
import { QueryProvider } from "./_providers/query"
import FooterDesktop from "./_components/layout/footerDesktop"
import AuthGuard from "./_components/auth/AuthGuard"
import ServiceWorkerRegister from "./_components/common/serviceWorkerRegister"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  // Base URL for resolving relative URLs in metadata
  metadataBase: new URL("https://lookisi.vercel.app/"),

  // Primary title shown in browser tab and search results
  title: "Lookisi",

  // Description for search engine results
  description:
    "Lookisi est le système idéal pour les salons. Réservez des rendez-vous en ligne, trouvez des salons proches et gérez vos réservations facilement.",
  // Keywords for SEO (helps search engines categorize the site)
  keywords: [
    "Lookisi",
    "système de gestion salon",
    "réservation salon",
    "salon en ligne",
    "logiciel salon",
    "réserver coupe cheveux",
    "salons proches",
    "Salon",
    "Coiffeur",
    "styliste",
    "barbier",
    "salon beauté",
    "salon coiffure",
    "Tunisie",
  ],

  // Favicon configuration
  icons: {
    icon: [
      {
        url: "/images/lookisiLightPng.png",
        sizes: "192x192",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/images/lookisiDarkPng.png",
        sizes: "192x192",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    shortcut: [
      {
        url: "/images/lookisiLightPng.png",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/images/lookisiDarkPng.png",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: [
      {
        url: "/images/lookisiLightPng.png",
        sizes: "180x180",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/images/lookisiDarkPng.png",
        sizes: "180x180",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },

  // PWA manifest
  manifest: "/manifest.json",

  // Open Graph metadata for social media sharing (Facebook, LinkedIn, etc.)
  openGraph: {
    title: "Lookisi - Système de Gestion des Centres",
    description:
      "Trouvez et réservez dans les meilleurs centres avec Lookisi. Plateforme complète pour les clients et les coiffeurs.",
    url: "https://lookisi.vercel.app/",
    siteName: "Lookisi",
    images: [
      {
        url: "/mobile-banner.png",
        width: 1200,
        height: 630,
        alt: "Lookisi - Système de Gestion des Centres",
      },
    ],
    locale: "fr_TN",
    type: "website",
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
        {/* Theme-based favicon */}
        <link
          rel="icon"
          href="/images/lookisiLightPng.png"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/images/lookisiDarkPng.png"
          media="(prefers-color-scheme: dark)"
        />
        {/* Fallback for browsers that don't support prefers-color-scheme */}
        <link rel="icon" href="/images/lookisiLightPng.png" />

        {/* Apple touch icons */}
        <link
          rel="apple-touch-icon"
          href="/images/lookisiLightPng.png"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="apple-touch-icon"
          href="/images/lookisiDarkPng.png"
          media="(prefers-color-scheme: dark)"
        />
        <link rel="apple-touch-icon" href="/images/lookisiLightPng.png" />
      </head>
      <body className={inter.className}>
        {/* PROVIDER HIERARCHY */}

        {/* Theme provider for dark/light mode support */}
        <ThemeProviderComponent>
          {/* Query provider for data fetching and caching */}
          <QueryProvider>
            {/* Auth provider for user authentication state */}
            <AuthProvider>
              {/* Swipe navigation for mobile back/forward gestures */}
              <SwipeNavigationProvider>
                {/* Progress bar for page transition feedback */}
                <ProgressProvider>
                  <ServiceWorkerRegister />
                  {/* MAIN LAYOUT STRUCTURE */}
                  {/* Uses flexbox to keep footer at bottom of viewport */}
                  <div className="flex h-full flex-col">
                    {/* Header handles top bars and navigation visibility */}
                    <Header />
                    {/* Main content area - auth-guarded (except root) */}
                    <AuthGuard>
                      <MainContentWrapper>{children}</MainContentWrapper>
                    </AuthGuard>
                    {/* Footer - always at the bottom for desktop */}
                    <FooterDesktop />
                  </div>
                </ProgressProvider>
              </SwipeNavigationProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProviderComponent>

        {/* GLOBAL UI COMPONENTS */}

        {/* Toast notification container from Sonner library */}
        <Toaster />

        {/* Vercel Speed Insights for performance monitoring */}
        <SpeedInsights />
      </body>
    </html>
  )
}
