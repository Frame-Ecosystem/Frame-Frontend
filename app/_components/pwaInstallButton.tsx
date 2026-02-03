"use client"
import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Share } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(() => {
    if (typeof window !== "undefined") {
      return !window.matchMedia("(display-mode: standalone)").matches
    }
    return false
  })
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent)
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(display-mode: standalone)").matches
    }
    return false
  })
  const [showInstallDialog, setShowInstallDialog] = useState(false)

  useEffect(() => {
    // Listen for the beforeinstallprompt event
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
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android/Chrome: Show native install prompt
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        console.log("User accepted the install prompt")
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
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  if (!isMobile || isInstalled || (!isInstallable && !isIOS)) return null

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
              📱 Install forLook App
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
