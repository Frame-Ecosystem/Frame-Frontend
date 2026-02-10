"use client"

import { Check, Palette, ChevronDown } from "lucide-react"
import { useTheme } from "next-themes"
import { useLayoutEffect, useState } from "react"
import { themes } from "../../_constants/themes"
import { authService } from "../../_services/auth.service"
import { useAuth } from "../../_providers/auth"
import { toast } from "sonner"

// themes are sourced from app/_constants/themes

export function ThemeSelector() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()

  const handleThemeChange = async (newTheme: string) => {
    const previousTheme = theme
    try {
      setIsUpdating(true)

      // Update local theme immediately for better UX
      setTheme(newTheme)
      setIsOpen(false)

      // Update theme on backend if user is authenticated
      if (user) {
        await authService.updateTheme(newTheme)
        toast.success("Theme updated successfully")
      }
    } catch (error) {
      console.error("Failed to update theme:", error)
      toast.error("Failed to save theme preference")
      // Revert to previous theme on error
      setTheme(previousTheme || "system")
    } finally {
      setIsUpdating(false)
    }
  }

  useLayoutEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-2">
        <button className="border-border w-full rounded-lg border p-4 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="text-muted-foreground h-5 w-5" />
              <span className="font-medium">Theme</span>
            </div>
            <ChevronDown className="text-muted-foreground h-5 w-5" />
          </div>
        </button>
      </div>
    )
  }

  const currentTheme = themes.find((t) => t.name === theme) || themes[0]

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border-border hover:bg-card/50 w-full rounded-lg border p-4 text-left transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Palette className="text-muted-foreground h-5 w-5" />
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentTheme.icon}</span>
              <span className="font-medium">{currentTheme.label}</span>
            </div>
          </div>
          <ChevronDown
            className={`text-muted-foreground h-5 w-5 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="grid grid-cols-2 gap-2 px-1">
          {themes.map((themeOption) => {
            const isActive = theme === themeOption.name
            return (
              <button
                key={themeOption.name}
                onClick={() => handleThemeChange(themeOption.name)}
                disabled={isUpdating}
                className={`relative rounded-lg border-2 p-3 text-left transition-all hover:scale-[1.02] ${
                  isActive
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                } ${isUpdating ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <Check className="text-primary h-4 w-4" />
                  </div>
                )}
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xl">{themeOption.icon}</span>
                  <span className="text-sm font-medium">
                    {themeOption.label}
                  </span>
                </div>
                <div className="flex gap-1">
                  {themeOption.colors.map((color, index) => (
                    <div
                      key={index}
                      className="border-border h-5 w-5 rounded-full border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
