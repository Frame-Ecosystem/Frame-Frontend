"use client"

import { ThemeProvider } from "next-themes"
import { ReactNode } from "react"
import themes from "../_constants/themes"

export function ThemeProviderComponent({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="silver-dark"
      enableSystem={false}
      themes={themes.map((t) => t.name)}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
