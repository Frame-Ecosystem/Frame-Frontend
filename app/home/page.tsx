"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/_auth"
import { ErrorBoundary } from "../_components/common/errorBoundary"
import { PostFeed } from "../_components/posts/post-feed"
import { HomeIcon } from "lucide-react"
import { HomeFeedSkeleton } from "../_components/skeletons/home"
import { useScrollToTarget } from "../_hooks/useScrollToTarget"
import { useTranslation } from "../_i18n"

const Home = () => {
  const { user, isLoading } = useAuth()
  useScrollToTarget()
  const router = useRouter()
  const { t, dir } = useTranslation()

  useEffect(() => {
    if (!isLoading && user) {
      // All user types share this home page
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <ErrorBoundary>
        <HomeFeedSkeleton />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        {/* MAIN CONTENT CONTAINER */}
        <div className="mx-auto max-w-7xl lg:pt-0">
          <div className="p-5 lg:px-8 lg:py-12">
            {/* Page Header */}
            <div className="mb-8 lg:mb-12">
              <div dir={dir} className="mt-6 mb-4 flex items-center gap-3">
                <HomeIcon className="text-primary h-8 w-8 lg:h-10 lg:w-10" />
                <h1 className="text-3xl font-bold lg:text-4xl">
                  {t("home.title")}
                </h1>
              </div>
              <p className="text-muted-foreground lg:text-lg">
                {t("home.subtitle")}
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
