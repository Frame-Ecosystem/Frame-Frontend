"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../_providers/auth"
import { ErrorBoundary } from "../_components/common/errorBoundary"
import { PostFeed } from "../_components/posts/post-feed"

const Home = () => {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users to their respective dashboards
  useEffect(() => {
    if (!isLoading && user) {
      // For now, let all users access the home page
      // In the future, you might want to redirect based on user preferences
      // if (user.type === "lounge") {
      //   router.replace("/loungeHome")
      // } else if (user.type === "client") {
      //   router.replace("/clientHome")
      // }
    }
  }, [user, isLoading, router])

  // Show loading state while checking authentication
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

  // Don't render anything for unauthenticated users (they'll be redirected)
  // AuthGuard at the layout level handles unauthenticated redirects

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
        {/* MAIN CONTENT CONTAINER */}
        <div className="mx-auto max-w-7xl lg:pt-0">
          <div className="p-5 lg:px-8 lg:py-12">
            {/* HEADER */}
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold lg:text-4xl">
                Welcome to Lookeys Community
              </h1>
              <p className="text-muted-foreground text-lg">
                {user ? `Hello ${user.firstName || user.email}! ` : ""}
                Share your thoughts, connect with others, and discover amazing
                content
              </p>
            </div>

            {/* POST FEED */}
            <PostFeed />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default Home
