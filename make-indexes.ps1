$r = "c:\Users\abbas\Desktop\FRAME\Frame Front\app\_systems"

function Write-Index($path, $exports) {
    $lines = $exports | ForEach-Object { "export * from '$_'" }
    $lines | Set-Content -Path "$r\$path" -Encoding UTF8
}

# ─── AUTH (already has index.ts — skip, it was copied from _auth/) ─────────────

# ─── USER sub-barrels ─────────────────────────────────────────────────────────
Write-Index "user\services\index.ts" @(
    "./client.service", "./agent.service", "./follow.service",
    "./lounge.service", "./lounge-visitor.service"
)
Write-Index "user\types\index.ts" @("./user", "./agent", "./follow")
Write-Index "user\hooks\index.ts" @(
    "./useClientProfile", "./useClientVisitorProfile",
    "./useLoungeProfile", "./useFollows"
)
Write-Index "user\lib\index.ts" @("./profile")
Write-Index "user\providers\index.ts" @("./agent")
Write-Index "user\index.ts" @(
    "./services/index", "./types/index", "./hooks/index",
    "./lib/index", "./providers/index"
)
Write-Host "OK: user"

# ─── FEED sub-barrels ─────────────────────────────────────────────────────────
Write-Index "feed\services\index.ts" @(
    "./feed.service", "./post.service", "./reel.service",
    "./comment.service", "./like.service", "./report.service"
)
Write-Index "feed\types\index.ts" @("./content", "./post", "./like")
Write-Index "feed\hooks\index.ts" @(
    "./useFeeds", "./usePosts", "./useReels", "./useComments",
    "./useLikes", "./useHashtags", "./useReports", "./useContent", "./content-keys"
)
Write-Index "feed\index.ts" @(
    "./services/index", "./types/index", "./hooks/index"
)
Write-Host "OK: feed"

# ─── NOTIFICATIONS sub-barrels ────────────────────────────────────────────────
Write-Index "notifications\services\index.ts" @(
    "./notification.service", "./push-notification.service", "./socket"
)
Write-Index "notifications\types\index.ts" @("./notification")
Write-Index "notifications\hooks\index.ts" @(
    "./useNotifications", "./usePushNotifications", "./useSocketRoom"
)
Write-Index "notifications\lib\index.ts" @(
    "./firebase", "./notification-engine", "./sound-manager"
)
Write-Index "notifications\providers\index.ts" @(
    "./notification", "./push-notification"
)
Write-Index "notifications\index.ts" @(
    "./services/index", "./types/index", "./hooks/index",
    "./lib/index", "./providers/index"
)
Write-Host "OK: notifications"

# ─── BOOKINGS sub-barrels ─────────────────────────────────────────────────────
Write-Index "bookings\services\index.ts" @("./booking.service", "./queue.service")
Write-Index "bookings\types\index.ts" @("./booking", "./queue")
Write-Index "bookings\hooks\index.ts" @("./useQueue")
Write-Index "bookings\index.ts" @(
    "./services/index", "./types/index", "./hooks/index"
)
Write-Host "OK: bookings"

# ─── MARKETPLACE sub-barrels ──────────────────────────────────────────────────
Write-Index "marketplace\hooks\index.ts" @("./useMarketplace")
Write-Index "marketplace\index.ts" @("./service", "./types", "./hooks/index")
Write-Host "OK: marketplace"

# ─── SERVICE-CATALOG sub-barrels ──────────────────────────────────────────────
Write-Index "service-catalog\services\index.ts" @(
    "./service.service", "./service-category.service",
    "./service-suggestions.service", "./rating.service"
)
Write-Index "service-catalog\types\index.ts" @("./service", "./rating")
Write-Index "service-catalog\hooks\index.ts" @("./useServices", "./useRatings")
Write-Index "service-catalog\constants\index.ts" @("./service")
Write-Index "service-catalog\index.ts" @(
    "./services/index", "./types/index", "./hooks/index", "./constants/index"
)
Write-Host "OK: service-catalog"

# ─── ADMIN sub-barrels ────────────────────────────────────────────────────────
Write-Index "admin\services\index.ts" @("./admin.service")
Write-Index "admin\types\index.ts" @("./admin")
Write-Index "admin\hooks\index.ts" @("./useAdmin", "./useAdminContent")
Write-Index "admin\constants\index.ts" @("./navigation")
Write-Index "admin\index.ts" @(
    "./services/index", "./types/index", "./hooks/index", "./constants/index"
)
Write-Host "OK: admin"

# ─── Top-level _systems/index.ts ──────────────────────────────────────────────
Write-Index "index.ts" @(
    "./auth/index",
    "./user/index",
    "./feed/index",
    "./notifications/index",
    "./bookings/index",
    "./marketplace/index",
    "./service-catalog/index",
    "./admin/index"
)
Write-Host "OK: top-level index"

Write-Host "ALL INDEX FILES CREATED."
