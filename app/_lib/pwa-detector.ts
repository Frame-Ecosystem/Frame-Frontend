/**
 * @file pwa-detector.ts
 * @description Utilities for detecting if the app is running as a PWA or in browser.
 * Used to determine appropriate initial route and behavior.
 */

/**
 * Detect if the app is running as an installed PWA
 *
 * Checks multiple signals:
 * - display-mode: fullscreen or minimal-ui (PWA)
 * - standalone mode (iOS PWA)
 * - window.navigator.standalone (iOS)
 */
export function isPWAInstalled(): boolean {
  if (typeof window === "undefined") return false

  try {
    // Check media query for display mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return true
    }

    if (window.matchMedia("(display-mode: fullscreen)").matches) {
      return true
    }

    // iOS PWA detection
    if ((navigator as any).standalone === true) {
      return true
    }

    // Check for PWA display mode in meta tags (less reliable)
    const viewportMeta = document.querySelector('meta[name="viewport"]')
    if (viewportMeta?.getAttribute("content")?.includes("standalone")) {
      return true
    }

    return false
  } catch {
    return false
  }
}

/**
 * Detect if the app is running in a browser (not PWA)
 */
export function isBrowserOnly(): boolean {
  return !isPWAInstalled()
}

/**
 * Check if app was launched from home screen (PWA context)
 */
export function isLaunchedFromHomeScreen(): boolean {
  if (typeof window === "undefined") return false

  // Check referrer
  if (document.referrer === "" && isPWAInstalled()) {
    return true
  }

  return false
}

/**
 * Get appropriate initial route based on PWA status and auth state
 *
 * Rules:
 * - Browser: Always open at "/"
 * - PWA + Authenticated: Open at "/home" or role-specific path
 * - PWA + Not Authenticated: Open at "/home" (will show signin dialog)
 */
export function getInitialRoute(
  isAuthenticated: boolean = false,
  userPath?: string,
): string {
  if (isBrowserOnly()) {
    return "/"
  }

  // PWA mode
  if (isAuthenticated && userPath) {
    return userPath
  }

  return "/home"
}

/**
 * Log PWA detection info (for debugging)
 */
export function logPWAInfo(): void {
  if (typeof window === "undefined") return

  const info = {
    isPWA: isPWAInstalled(),
    displayMode: window.matchMedia("(display-mode: standalone)").matches
      ? "standalone"
      : window.matchMedia("(display-mode: fullscreen)").matches
        ? "fullscreen"
        : "browser",
    standalone: (navigator as any).standalone,
    referrer: document.referrer,
  }

  if (
    (window as any).__frameDebug ||
    localStorage.getItem("frame:debug") === "true"
  ) {
    console.log("[PWA Info]", info)
  }
}
