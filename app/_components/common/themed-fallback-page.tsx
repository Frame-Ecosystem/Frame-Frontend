"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { useTranslation } from "@/app/_i18n"

type ThemedFallbackPageProps = {
  code: string
  title: string
  description: string
  showRetry?: boolean
  onRetry?: () => void
  supportHint?: string
}

export function ThemedFallbackPage({
  code,
  title,
  description,
  showRetry = false,
  onRetry,
  supportHint,
}: Readonly<ThemedFallbackPageProps>) {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <main className="from-background via-muted/40 to-background flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <section className="border-border/70 bg-card/90 w-full max-w-2xl rounded-2xl border p-6 shadow-xl backdrop-blur sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="bg-primary/10 text-primary rounded-full p-2.5">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
              Frame Beauty
            </p>
            <p className="text-foreground font-mono text-sm">{code}</p>
          </div>
        </div>

        <h1 className="text-foreground text-2xl font-semibold sm:text-3xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-3 text-sm sm:text-base">
          {description}
        </p>

        {supportHint ? (
          <div className="bg-muted/40 border-border/60 mt-5 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">{supportHint}</p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button type="button" variant="default" asChild>
            <Link href="/">
              <Home className="h-4 w-4" /> {t("common.backToHome")}
            </Link>
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> {t("common.goBack")}
          </Button>
          {showRetry ? (
            <Button
              type="button"
              variant="outline"
              onClick={onRetry}
              className="ml-auto"
            >
              <RefreshCw className="h-4 w-4" /> {t("common.tryAgain")}
            </Button>
          ) : null}
        </div>
      </section>
    </main>
  )
}
