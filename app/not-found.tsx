import { ThemedFallbackPage } from "@/app/_components/common/themed-fallback-page"

export default function NotFoundPage() {
  return (
    <ThemedFallbackPage
      code="404"
      title="Page Not Found"
      description="The page you requested does not exist or was moved."
      supportHint="If you reached this page from an in-app link, please navigate back and retry."
    />
  )
}
