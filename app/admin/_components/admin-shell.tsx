"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

const ADMIN_SIDEBAR_STORAGE_KEY = "frame.admin.sidebar.collapsed"

type AdminShellContextValue = {
  isDesktopCollapsed: boolean
  isMobileOpen: boolean
  setDesktopCollapsed: (collapsed: boolean) => void
  toggleDesktopCollapsed: () => void
  setMobileOpen: (open: boolean) => void
  toggleMobileOpen: () => void
  closeMobile: () => void
}

const AdminShellContext = createContext<AdminShellContextValue | null>(null)

export function AdminShellProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }

    return window.localStorage.getItem(ADMIN_SIDEBAR_STORAGE_KEY) === "true"
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const setDesktopCollapsed = useCallback((collapsed: boolean) => {
    setIsDesktopCollapsed(collapsed)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        ADMIN_SIDEBAR_STORAGE_KEY,
        collapsed ? "true" : "false",
      )
    }
  }, [])

  const toggleDesktopCollapsed = useCallback(() => {
    setDesktopCollapsed(!isDesktopCollapsed)
  }, [isDesktopCollapsed, setDesktopCollapsed])

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false)
  }, [])

  const toggleMobileOpen = useCallback(() => {
    setIsMobileOpen((open) => !open)
  }, [])

  const value = useMemo(
    () => ({
      isDesktopCollapsed,
      isMobileOpen,
      setDesktopCollapsed,
      toggleDesktopCollapsed,
      setMobileOpen: setIsMobileOpen,
      toggleMobileOpen,
      closeMobile,
    }),
    [
      closeMobile,
      isDesktopCollapsed,
      isMobileOpen,
      setDesktopCollapsed,
      toggleDesktopCollapsed,
      toggleMobileOpen,
    ],
  )

  return (
    <AdminShellContext.Provider value={value}>
      {children}
    </AdminShellContext.Provider>
  )
}

export function useAdminShell() {
  const context = useContext(AdminShellContext)

  if (!context) {
    throw new Error("useAdminShell must be used within AdminShellProvider")
  }

  return context
}
