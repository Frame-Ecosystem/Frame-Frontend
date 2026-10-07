"use client"

import { usePathname } from "next/navigation"
import { AgentGuard } from "@/app/_auth"

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isProfilePage = pathname === "/agent/profile"

  return (
    <AgentGuard>
      <div
        className={isProfilePage ? "min-h-screen" : "bg-muted/20 min-h-screen"}
      >
        <div
          className={
            isProfilePage
              ? "w-full"
              : "mx-auto w-full max-w-5xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8"
          }
        >
          {children}
        </div>
      </div>
    </AgentGuard>
  )
}
