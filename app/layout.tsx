import type { Metadata } from "next"
import { Inter } from "next/font/google"

// Global styles
import "./globals.css"

// Third-party components
import { Toaster } from "sonner"
import { SpeedInsights } from "@vercel/speed-insights/next"

// Internal components
import ProgressProvider from "./_components/forms/progress-bar"
import MainContentWrapper from "./_components/layout/mainContentWrapper"

// Context providers
import { ThemeProviderComponent } from "./_providers/theme"
import { SwipeNavigationProvider } from "./_providers/swipe-navigation"
import { AuthProvider } from "./_providers/auth"
import { QueryProvider } from "./_providers/query"
import { NotificationProvider } from "./_providers/notification"
import { PushNotificationProvider } from "./_providers/push-notification"
import AuthGuard from "./_components/auth/AuthGuard"
import ServiceWorkerRegister from "./_components/common/serviceWorkerRegister"

// Client component to handle pathname-based conditional rendering
import ConditionalHeader from "./_components/layout/conditional-header"
import ConditionalFooter from "./_components/layout/conditional-footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  // Base URL for resolving relative URLs in metadata
  metadataBase: new URL("https://lookisi.vercel.app/"),

  // Primary title shown in browser tab and search results
  title: "Frame",

  // Description for search engine results
  description:
    "Frame est le système idéal pour les salons. Réservez des rendez-vous en ligne, trouvez des salons proches et gérez vos réservations facilement.",
  // Keywords for SEO (helps search engines categorize the site)
  keywords: [
    "Frame",
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
        url: "/images/favicon.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: [
      {
        url: "/images/favicon.png",
        type: "image/png",
      },
    ],
    apple: [
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
    title: "Frame - Système de Gestion des Centres",
    description:
      "Trouvez et réservez dans les meilleurs centres avec Frame. Plateforme complète pour les clients et les coiffeurs.",
    url: "https://lookisi.vercel.app/",
    siteName: "Frame",
    images: [
      {
        url: "/mobile-banner.png",
        width: 1200,
        height: 630,
        alt: "Frame - Système de Gestion des Centres",
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
        <link rel="icon" href="/images/favicon.png" />

        {/* Apple touch icons */}
        <link rel="apple-touch-icon" href="/images/favicon.png" />
      </head>
      <body className={inter.className}>
        {/* PROVIDER HIERARCHY */}

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

        {/* GLOBAL UI COMPONENTS */}

        {/* Toast notification container from Sonner library */}
        <Toaster />

        {/* Vercel Speed Insights for performance monitoring */}
        <SpeedInsights />
      </body>
    </html>
  )
}
