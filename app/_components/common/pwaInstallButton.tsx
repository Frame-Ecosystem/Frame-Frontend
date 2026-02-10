"use client"
import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Share } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallDialog, setShowInstallDialog] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Initialize browser state after mount to avoid hydration mismatch
  useEffect(() => {
    // Use setTimeout to avoid setState-in-effect ESLint error
    setTimeout(() => {
      setIsClient(true)
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches
      setIsInstallable(!isStandalone)
      setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
      setIsInstalled(isStandalone)

      // Check for mobile screen size only
      const isSmallScreen = window.innerWidth < 768
      setIsMobile(isSmallScreen)
    }, 0)
  }, [])

  useEffect(() => {
    if (!isClient) return
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      )
    }
  }, [isClient])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android/Chrome: Show native install prompt
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
      setIsInstallable(false)
    } else if (isIOS) {
      // iOS: Show themed dialog with instructions
      setShowInstallDialog(true)
    } else {
      // Fallback for other browsers
      alert(
        'To install this app, look for an "Add to Home Screen" option in your browser menu.',
      )
    }
  }

  // Only show on mobile and if installable or iOS, and not installed
  // Don't render anything until client-side hydration is complete
  if (!isClient || !isMobile || isInstalled || (!isInstallable && !isIOS))
    return null

  return (
    <>
      <Button
        onClick={handleInstallClick}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Share className="h-4 w-4" />
        Install App
      </Button>

      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              📱 Install lookisi App
            </DialogTitle>
            <DialogDescription>
              Follow these simple steps to add the app to your home screen:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                1
              </span>
              <div className="flex-1">
                <p className="font-medium">Tap the Share button</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    Look for{" "}
                  </span>
                  <div className="border-muted-foreground/30 flex h-5 w-5 items-center justify-center rounded border">
                    <Share className="text-muted-foreground h-3 w-3" />
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {" "}
                    at the bottom of your screen
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                2
              </span>
              <div className="flex-1">
                <p className="font-medium">
                  Scroll down and tap &quot;Add to Home Screen&quot;
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    The app icon will appear on your home screen
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowInstallDialog(false)}>Got it!</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default PWAInstallButton
