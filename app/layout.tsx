import type { Metadata } from "next"
import { Inter } from "next/font/google"

// Global styles
import "./globals.css"

// Third-party components
import { Toaster } from "sonner"
import { SpeedInsights } from "@vercel/speed-insights/next"

// Internal components
import ProgressProvider from "./_components/progress-bar"
import Header from "./_components/header"
import MainContentWrapper from "./_components/mainContentWrapper"

// Context providers
import { ThemeProviderComponent } from "./_providers/theme"
import { SwipeNavigationProvider } from "./_providers/swipe-navigation"
import { AuthProvider } from "./_providers/auth"
import { QueryProvider } from "./_providers/query"
import FooterDesktop from "./_components/footerDesktop"
import AuthGuard from "./_components/AuthGuard"
import ServiceWorkerRegister from "./_components/serviceWorkerRegister"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  // Base URL for resolving relative URLs in metadata
  metadataBase: new URL("https://lookisi.vercel.app/"),

  // Primary title shown in browser tab and search results
  title: "Lookisi - Sistema para Barbearias | Agendamento Online",

  // Description for search engine results
  description:
    "Lookisi é o sistema ideal para barbearias. Agende horários online, encontre barbearias próximas e gerencie seus agendamentos facilmente.",
  // Keywords for SEO (helps search engines categorize the site)
  keywords: [
    "Lookisi",
    "sistema para barbearia",
    "agendamento barbearia",
    "barbearia online",
    "software barbearia",
    "agendar corte de cabelo",
    "barbearias próximas",
    "Barbearia",
    "Cabeleireiro",
    "lookisi",
  ],

  // PWA manifest
  manifest: "/manifest.json",

  // Open Graph metadata for social media sharing (Facebook, LinkedIn, etc.)
  openGraph: {
    title: "Lookisi - Sistema para Barbearia",
    description:
      "Encontre e agende nas melhores barbearias com o Lookisi. Plataforma completa para clientes e barbeiros.",
    url: "https://lookisi.vercel.app/",
    siteName: "Lookisi",
    images: [
      {
        url: "/mobile-banner.png",
        width: 1200,
        height: 630,
        alt: "Lookisi - Sistema para Barbearia",
      },
    ],
    locale: "en_US",
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* ================================================================= */}
        {/* PROVIDER HIERARCHY */}
        {/* ================================================================= */}

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
