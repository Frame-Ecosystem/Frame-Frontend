$root = "c:\Users\abbas\Desktop\FRAME\Frame Front\app"

function Write-Stub($oldPath, $newImport, $hasDefault = $false) {
    $line1 = "// Backward-compat re-export. Source of truth: $newImport"
    $line2 = "export * from '$newImport'"
    $lines = @($line1, $line2)
    if ($hasDefault) { $lines += "export { default } from '$newImport'" }
    $lines | Set-Content -Path "$root\$oldPath" -Encoding UTF8
}

# ─── _types/ stubs ────────────────────────────────────────────────────────────
Write-Stub "_types\user.ts"               "@/app/_systems/user/types/user"
Write-Stub "_types\agent.ts"              "@/app/_systems/user/types/agent"
Write-Stub "_types\follow.ts"             "@/app/_systems/user/types/follow"
Write-Stub "_types\lounge-visitor.ts"     "@/app/_systems/user/types/user"
Write-Stub "_types\content.ts"            "@/app/_systems/feed/types/content"
Write-Stub "_types\post.ts"               "@/app/_systems/feed/types/post"
Write-Stub "_types\like.ts"               "@/app/_systems/feed/types/like"
Write-Stub "_types\notification.ts"       "@/app/_systems/notifications/types/notification"
Write-Stub "_types\booking.ts"            "@/app/_systems/bookings/types/booking"
Write-Stub "_types\queue.ts"              "@/app/_systems/bookings/types/queue"
Write-Stub "_types\marketplace.ts"        "@/app/_systems/marketplace/types"
Write-Stub "_types\service.ts"            "@/app/_systems/service-catalog/types/service"
Write-Stub "_types\rating.ts"             "@/app/_systems/service-catalog/types/rating"
Write-Stub "_types\admin.ts"              "@/app/_systems/admin/types/admin"
Write-Stub "_types\common.ts"             "@/app/_core/types/common"
Write-Host "✅ _types/ stubs done."

# ─── _hooks/queries/ stubs ────────────────────────────────────────────────────
Write-Stub "_hooks\queries\useAuth.ts"               "@/app/_systems/auth/hooks/useAuth"
Write-Stub "_hooks\queries\useClientProfile.ts"      "@/app/_systems/user/hooks/useClientProfile"
Write-Stub "_hooks\queries\useClientVisitorProfile.ts" "@/app/_systems/user/hooks/useClientVisitorProfile"
Write-Stub "_hooks\queries\useLoungeProfile.ts"      "@/app/_systems/user/hooks/useLoungeProfile"
Write-Stub "_hooks\queries\useFollows.ts"             "@/app/_systems/user/hooks/useFollows"
Write-Stub "_hooks\queries\useFeeds.ts"               "@/app/_systems/feed/hooks/useFeeds"
Write-Stub "_hooks\queries\usePosts.ts"               "@/app/_systems/feed/hooks/usePosts"
Write-Stub "_hooks\queries\useReels.ts"               "@/app/_systems/feed/hooks/useReels"
Write-Stub "_hooks\queries\useComments.ts"            "@/app/_systems/feed/hooks/useComments"
Write-Stub "_hooks\queries\useLikes.ts"               "@/app/_systems/feed/hooks/useLikes"
Write-Stub "_hooks\queries\useHashtags.ts"            "@/app/_systems/feed/hooks/useHashtags"
Write-Stub "_hooks\queries\useReports.ts"             "@/app/_systems/feed/hooks/useReports"
Write-Stub "_hooks\queries\useContent.ts"             "@/app/_systems/feed/hooks/useContent"
Write-Stub "_hooks\queries\content-keys.ts"           "@/app/_systems/feed/hooks/content-keys"
Write-Stub "_hooks\queries\useNotifications.ts"       "@/app/_systems/notifications/hooks/useNotifications"
Write-Stub "_hooks\queries\useQueue.ts"               "@/app/_systems/bookings/hooks/useQueue"
Write-Stub "_hooks\queries\useMarketplace.ts"         "@/app/_systems/marketplace/hooks/useMarketplace"
Write-Stub "_hooks\queries\useServices.ts"            "@/app/_systems/service-catalog/hooks/useServices"
Write-Stub "_hooks\queries\useRatings.ts"             "@/app/_systems/service-catalog/hooks/useRatings"
Write-Stub "_hooks\queries\useAdmin.ts"               "@/app/_systems/admin/hooks/useAdmin"
Write-Stub "_hooks\queries\useAdminContent.ts"        "@/app/_systems/admin/hooks/useAdminContent"
Write-Host "✅ _hooks/queries/ stubs done."

# ─── _hooks/ (root) stubs ─────────────────────────────────────────────────────
Write-Stub "_hooks\usePushNotifications.ts"  "@/app/_systems/notifications/hooks/usePushNotifications"
Write-Stub "_hooks\useSocketRoom.ts"         "@/app/_systems/notifications/hooks/useSocketRoom"
Write-Stub "_hooks\useBadge.ts"              "@/app/_core/hooks/useBadge"
Write-Stub "_hooks\usePullToRefresh.ts"      "@/app/_core/hooks/usePullToRefresh"
Write-Stub "_hooks\useScrollDirection.ts"    "@/app/_core/hooks/useScrollDirection"
Write-Stub "_hooks\useScrollToTarget.ts"     "@/app/_core/hooks/useScrollToTarget"
Write-Stub "_hooks\useSwipeNavigation.ts"    "@/app/_core/hooks/useSwipeNavigation"
Write-Host "✅ _hooks/ stubs done."

# ─── _providers/ stubs ────────────────────────────────────────────────────────
Write-Stub "_providers\agent.tsx"               "@/app/_systems/user/providers/agent"
Write-Stub "_providers\notification.tsx"        "@/app/_systems/notifications/providers/notification"
Write-Stub "_providers\push-notification.tsx"   "@/app/_systems/notifications/providers/push-notification"
Write-Stub "_providers\query.tsx"               "@/app/_core/providers/query"
Write-Stub "_providers\theme.tsx"               "@/app/_core/providers/theme"
Write-Stub "_providers\swipe-navigation.tsx"    "@/app/_core/providers/swipe-navigation"
Write-Host "✅ _providers/ stubs done."

# ─── _lib/ stubs ──────────────────────────────────────────────────────────────
Write-Stub "_lib\firebase.ts"            "@/app/_systems/notifications/lib/firebase"
Write-Stub "_lib\notification-engine.ts" "@/app/_systems/notifications/lib/notification-engine"
Write-Stub "_lib\sound-manager.ts"       "@/app/_systems/notifications/lib/sound-manager"
Write-Stub "_lib\profile.ts"             "@/app/_systems/user/lib/profile"
Write-Stub "_lib\utils.ts"               "@/app/_core/lib/utils"
Write-Stub "_lib\image-utils.ts"         "@/app/_core/lib/image-utils"
Write-Host "✅ _lib/ stubs done."

# ─── _constants/ stubs ────────────────────────────────────────────────────────
Write-Stub "_constants\service.ts"   "@/app/_systems/service-catalog/constants/service"
Write-Stub "_constants\gender.ts"    "@/app/_core/constants/gender"
Write-Stub "_constants\languages.ts" "@/app/_core/constants/languages"
Write-Stub "_constants\navigation.ts" "@/app/_core/constants/navigation"
Write-Stub "_constants\search.ts"    "@/app/_core/constants/search"
Write-Stub "_constants\themes.ts"    "@/app/_core/constants/themes"
Write-Host "✅ _constants/ stubs done."

Write-Host ""
Write-Host "🎉 ALL STUBS CREATED SUCCESSFULLY."
