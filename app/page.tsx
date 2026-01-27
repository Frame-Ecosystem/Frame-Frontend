"use client"

import { useAuth } from "./_providers/auth"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "./_components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { ErrorBoundary } from "./_components/errorBoundary"
import {
  Scissors,
  Star,
  MapPin,
  Calendar,
  ArrowRight,
  Sparkles
} from "lucide-react"
import { useState } from "react"
import SignupFlow from "./_components/signup-flow"
import { Dialog, DialogContent } from "./_components/ui/dialog"
import TopBar from "./_components/topBar"

const LandingPage = () => {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [signupOpen, setSignupOpen] = useState(false)

  // Redirect authenticated users to home
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/home')
    }
  }, [user, isLoading, router])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
          <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
        <section className="pt-30 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Book Your Perfect
                <span className="text-primary block">Services Experience</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Discover top-rated barbershops, book appointments instantly, and enjoy professional grooming services in modern, comfortable environments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link href="/choose-type">
                    Start Booking Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                  <Link href="/choose-type">Browse Services</Link>
                </Button>
              </div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mt-6">
                <Sparkles className="h-4 w-4" />
                book your appointment with the best Services
              </div>
            </div>
          </div>
          
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Barber Lab?</h2>
              <p className="text-lg text-muted-foreground">Experience the future of barber booking</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scissors className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Barbers</h3>
                <p className="text-muted-foreground">Professional, certified barbers with years of experience</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
                <p className="text-muted-foreground">Book appointments instantly with our simple interface</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Prime Locations</h3>
                <p className="text-muted-foreground">Find barbershops in convenient locations near you</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Top Rated</h3>
                <p className="text-muted-foreground">Read reviews and choose the best barbers in your area</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-muted-foreground">Barbershops</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">1,000+</div>
                <div className="text-muted-foreground">Happy Customers</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">4.9</div>
                <div className="text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of satisfied customers who trust Barber Lab for their grooming needs.
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link href="/choose-type">
                Create Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <Image
                  alt="Barber Lab"
                  src="/images/logo.png"
                  height={32}
                  width={32}
                  className="h-6 w-auto"
                />
                <span className="text-lg font-semibold">Barber Lab</span>
              </div>
              <div className="text-sm text-muted-foreground">
                © 2026 Barber Lab. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Signup Dialog */}
      <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
        <DialogContent className="w-[90%]">
          <SignupFlow
            onSuccess={() => setSignupOpen(false)}
            onOpenSignInFlow={() => {
              setSignupOpen(false)
              // could open sign-in dialog here if desired
            }}
          />
        </DialogContent>
      </Dialog>

    </ErrorBoundary>
  )
}

export default LandingPage
