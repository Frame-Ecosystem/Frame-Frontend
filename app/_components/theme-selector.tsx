"use client"

/* eslint-disable react-hooks/set-state-in-effect */

import { Check, Palette, ChevronDown } from "lucide-react"
import { useTheme } from "next-themes"
import { useLayoutEffect, useState } from "react"
import { themes } from "../_constants/themes"

// themes are sourced from app/_constants/themes

export function ThemeSelector() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  useLayoutEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-2">
        <button className="w-full rounded-lg border border-border p-4 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Theme</span>
            </div>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
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
        className="w-full rounded-lg border border-border p-4 text-left hover:bg-card/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentTheme.icon}</span>
              <span className="font-medium">{currentTheme.label}</span>
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground transition-transform ${
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
              onClick={() => {
                setTheme(themeOption.name)
                setIsOpen(false)
              }}
              className={`relative rounded-lg border-2 p-3 text-left transition-all hover:scale-[1.02] ${
                isActive
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              {isActive && (
                <div className="absolute top-2 right-2">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{themeOption.icon}</span>
                <span className="text-sm font-medium">{themeOption.label}</span>
              </div>
              <div className="flex gap-1">
                {themeOption.colors.map((color, index) => (
                  <div
                    key={index}
                    className="h-5 w-5 rounded-full border border-border"
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
