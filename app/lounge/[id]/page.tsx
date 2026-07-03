"use client"

import { useEffect } from "react"
import { ErrorBoundary } from "@/app/_components/common/errorBoundary"
import { Button } from "@/app/_components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { getProfilePath } from "@/app/_systems/user/lib/profile"
import { AlertTriangle, Lock, SearchX, Loader2 } from "lucide-react"
import { useTranslation } from "@/app/_i18n"
import { useLoungeData, type LoungeDetail } from "./_lib/use-lounge-data"
import { LoungePageSkeleton } from "./_components/lounge-page-skeleton"
import { LoungeHero } from "./_components/lounge-hero"
import { LoungeTabs } from "./_components/lounge-tabs"
import { useVisitorLoungeExtras } from "@/app/_systems/extras/hooks/useExtras"
import { ExtrasCard } from "@/app/_core/components/forms/extras-card"
import { ContactCard } from "@/app/_core/components/forms/contact-card"
import { LocationCard } from "@/app/_core/components/forms/location-card"
import { OpeningHoursDisplay } from "@/app/_core/components/forms/opening-hours-display"

function ContentCards({
  lounge,
  loungeId,
}: {
  lounge: LoungeDetail
  loungeId: string
}) {
  const { data: apiExtras, isLoading } = useVisitorLoungeExtras(loungeId)

  return (
    <div className="mx-auto max-w-4xl px-5 pt-4 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {lounge.openingHours && (
          <div className="min-w-0 flex-1">
            <OpeningHoursDisplay openingHours={lounge.openingHours} compact />
          </div>
        )}
        {(lounge.latitude || lounge.longitude) && (
          <div className="min-w-0 flex-1">
            <LocationCard
              address={lounge.address || ""}
              latitude={lounge.latitude}
              longitude={lounge.longitude}
            />
          </div>
        )}
        {(lounge.phoneNumber || lounge.phones?.length || lounge.email) && (
          <div className="min-w-0 flex-1">
            <ContactCard
              phone={
                lounge.phoneNumber ||
                (lounge.phones?.length ? lounge.phones[0] : undefined)
              }
              email={lounge.email}
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {apiExtras && apiExtras.length > 0 && (
            <ExtrasCard extras={apiExtras} />
          )}
          {isLoading && (
            <div className="text-muted-foreground flex items-center justify-center rounded-xl border py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

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
    if (user && user.type === "lounge" && user._id === id) {
      router.replace(getProfilePath(user))
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
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <div className="mx-auto max-w-7xl lg:pt-0">
          <LoungeHero lounge={lounge} />

          {/* ── Header Cards Section ────────────────────────────── */}
          <ContentCards lounge={lounge} loungeId={id} />

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
