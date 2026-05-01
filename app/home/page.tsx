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
              <div dir={dir} className="mt-6 mb-2 flex items-center gap-3">
                <div className="bg-primary/10 rounded-xl p-2">
                  <HomeIcon className="text-primary h-6 w-6 lg:h-7 lg:w-7" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                  {t("home.title")}
                </h1>
              </div>
              <p className="text-muted-foreground ml-1 text-sm lg:text-base">
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
