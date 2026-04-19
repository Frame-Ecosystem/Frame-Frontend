"use client"

import { useEffect } from "react"
import { ErrorBoundary } from "@/app/_components/common/errorBoundary"
import { Button } from "@/app/_components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { AlertTriangle, Lock, SearchX } from "lucide-react"
import { useTranslation } from "@/app/_i18n"
import { useLoungeData } from "./_lib/use-lounge-data"
import { LoungePageSkeleton } from "./_components/lounge-page-skeleton"
import { LoungeHero } from "./_components/lounge-hero"
import { LoungeTabs } from "./_components/lounge-tabs"

// ── Shared status layout for error / auth / not-found states ────

function StatusPage({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-4">{icon}</div>
            <h2 className="mb-2 text-xl font-semibold">{title}</h2>
            <p className="text-muted-foreground mb-4">{description}</p>
            {action}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────

export default function LoungePage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { lounge, isLoading, error, user } = useLoungeData(id)
  const { t } = useTranslation()

  // Redirect to own profile if visiting yourself
  useEffect(() => {
    if (user && user._id === id) {
      router.replace("/profile/lounge")
    }
  }, [user, id, router])

  if (isLoading) return <LoungePageSkeleton />

  if (error) {
    return (
      <StatusPage
        icon={<AlertTriangle className="mx-auto h-12 w-12 text-red-500" />}
        title={t("lounge.errorLoading")}
        description={error}
        action={
          <Button onClick={() => router.back()}>{t("lounge.goBack")}</Button>
        }
      />
    )
  }

  if (!user) {
    return (
      <StatusPage
        icon={<Lock className="text-muted-foreground mx-auto h-12 w-12" />}
        title={t("lounge.authRequired")}
        description={t("lounge.signInToView")}
        action={
          <Button onClick={() => router.push("/choose-type")}>
            {t("lounge.signIn")}
          </Button>
        }
      />
    )
  }

  if (!lounge) {
    return (
      <StatusPage
        icon={<SearchX className="text-muted-foreground mx-auto h-12 w-12" />}
        title={t("lounge.notFound")}
        description={t("lounge.notFoundDesc")}
        action={
          <Button onClick={() => router.push("/lounges")}>
            {t("lounge.browseLounges")}
          </Button>
        }
      />
    )
  }

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
        <div className="mx-auto max-w-7xl lg:pt-0">
          <LoungeHero lounge={lounge} />

          <div className="space-y-4 lg:col-span-8">
            <div className="md:grid md:grid-cols-5">
              <div className="hidden md:block" />
              <div className="md:col-span-3">
                <LoungeTabs lounge={lounge} loungeId={id} />
              </div>
              <div className="hidden md:col-span-1 md:block" />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
