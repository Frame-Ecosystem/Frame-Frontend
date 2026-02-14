"use client"

import { useAuth } from "./_providers/auth"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "./_components/ui/button"
import Image from "next/image"
import { ErrorBoundary } from "./_components/common/errorBoundary"
import { getHomePath } from "./_lib/profile"
import { useTheme } from "next-themes"
import {
  Scissors,
  Star,
  MapPin,
  Calendar,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { useState } from "react"
import SignupFlow from "./_components/auth/signup-flow"
import SignInDialog from "./_components/auth/sign-in-dialog"
import { Dialog, DialogContent } from "./_components/ui/dialog"
import TopBar from "./_components/layout/topBar"

const LandingPage = () => {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { resolvedTheme, theme } = useTheme()
  const [signupOpen, setSignupOpen] = useState(false)
  const [signinOpen, setSigninOpen] = useState(false)

  // Redirect authenticated users to their respective home
  useEffect(() => {
    if (!isLoading && user) {
      router.push(getHomePath())
    }
  }, [user, isLoading, router])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
          <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  // Don't render anything for authenticated users (they'll be redirected)
  if (user) {
    return null
  }

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        {/* Top Bar */}
        <TopBar onGetStarted={() => setSignupOpen(true)} />

        {/* Hero Section */}
        <section className="px-4 pt-30 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h1 className="text-foreground mb-6 text-4xl font-bold sm:text-5xl lg:text-6xl">
                Book Your Perfect
                <span className="text-primary block">Services Experience</span>
              </h1>
              <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl">
                Discover top-rated centers, book appointments instantly, and
                enjoy professional grooming services in modern, comfortable
                environments.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg"
                  onClick={() => setSigninOpen(true)}
                >
                  Start Booking Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg"
                  onClick={() => setSigninOpen(true)}
                >
                  Browse Services
                </Button>
              </div>
              <div className="mt-4 text-center">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={() => setSigninOpen(true)}
                    className="text-primary font-medium hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
              <div className="bg-primary/10 text-primary mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                book your appointment with the best Services
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Why Choose Lookeys?</h2>
              <p className="text-muted-foreground text-lg">
                Experience the future of center booking
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <Scissors className="text-primary h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Expert Centers</h3>
                <p className="text-muted-foreground">
                  Professional, certified centers with years of experience
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <Calendar className="text-primary h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Easy Booking</h3>
                <p className="text-muted-foreground">
                  Book appointments instantly with our simple interface
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <MapPin className="text-primary h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Prime Locations</h3>
                <p className="text-muted-foreground">
                  Find centers in convenient locations near you
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <Star className="text-primary h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Top Rated</h3>
                <p className="text-muted-foreground">
                  Read reviews and choose the best centers in your area
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 text-center md:grid-cols-3">
              <div>
                <div className="text-primary mb-2 text-4xl font-bold">50+</div>
                <div className="text-muted-foreground">Centers</div>
              </div>
              <div>
                <div className="text-primary mb-2 text-4xl font-bold">
                  1,000+
                </div>
                <div className="text-muted-foreground">Happy Customers</div>
              </div>
              <div>
                <div className="text-primary mb-2 text-4xl font-bold">4.9</div>
                <div className="text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mb-8 text-xl opacity-90">
              Join thousands of satisfied customers who trust Lookeys for their
              grooming needs.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="px-8 py-6 text-lg"
              onClick={() => setSignupOpen(true)}
            >
              Create Your Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-border border-t px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="mb-4 flex items-center gap-2 md:mb-0">
                <Image
                  alt="Lookeys"
                  src={
                    (resolvedTheme || theme || "monochrome-dark").includes(
                      "light",
                    )
                      ? "/images/lookeysLightPng.png"
                      : "/images/lookeysDarkPng.png"
                  }
                  height={32}
                  width={32}
                  className="h-6 w-auto"
                  suppressHydrationWarning
                />
                <span className="text-lg font-semibold">Lookeys</span>
              </div>
              <div className="flex flex-col items-center gap-2 md:flex-row md:items-center">
                <div className="text-muted-foreground text-sm">
                  © 2026 Lookeys. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Signup Dialog */}
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

      {/* Sign-in Dialog */}
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
