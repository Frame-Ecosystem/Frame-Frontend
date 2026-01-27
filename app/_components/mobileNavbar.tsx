"use client"
import { Shield } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useScrollPosition } from "../_hooks/useScrollPosition"
import { useAuth } from "../_providers/auth"
import { getProfilePath, isProfilePath } from "../_lib/profile"
import { NAV_LINKS } from "../_constants/navigation"

const MobileNavbar = () => {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  const isVisible = useScrollPosition()
  const profilePath = getProfilePath(user)
  const isProfileActive = isProfilePath(pathname) || (user?.type === 'admin' && pathname.startsWith("/admin"))

  // Hide navbar while auth state is loading or user is not authenticated
  if (isLoading || !user) return null

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 border-t border-border backdrop-blur-sm shadow-[0_-2px_12px_0_rgba(0,0,0,0.04)] transition-transform duration-300 h-[72px]` + (isVisible ? " translate-y-0" : " translate-y-22")}
    >
      <div className="flex items-center justify-between px-2 py-3 gap-1 relative h-full">
        {NAV_LINKS.map((link) => {
          const isProfileLink = link.href === "/profile"
          const href = isProfileLink ? profilePath : link.href
          let isActive = false
          if (isProfileLink) {
            isActive = isProfileActive
          } else if (link.href === "/") {
            isActive = pathname === "/"
          } else {
            isActive = pathname.startsWith(link.href)
          }

          const Icon = link.icon as any

          return (
            <Link key={link.href} href={href} className="flex flex-1 justify-center">
              <div className={`flex flex-col items-center gap-1 w-full group relative h-full`}>
                <span className={`rounded-full p-2 transition-all duration-500 ease-[cubic-bezier(.68,-0.55,.27,1.55)] ${isActive ? "bg-gradient-to-b from-primary to-primary/80 text-primary-foreground shadow-2xl scale-110 border-4 border-card ring-2 ring-primary/40 backdrop-blur-md" : "bg-background text-muted-foreground group-hover:bg-muted/60 group-hover:text-primary"}`} style={{boxShadow: isActive ? "0 16px 40px 0 rgba(0,0,0,0.22), 0 0 12px 2px rgba(80,120,255,0.12)" : undefined, transform: isActive ? "translateY(-16px) scale(1.10) rotate(-6deg)" : "translateY(0) scale(1) rotate(0deg)"}}>
                  {isProfileLink && user?.type === 'admin' ? (
                    <Shield className={isActive ? "h-4 w-4" : "h-5 w-5"} />
                  ) : (
                    <Icon className={isActive ? "h-4 w-4" : "h-5 w-5"} />
                  )}
                </span>
                <span className={`text-[13px] font-semibold transition-all duration-300 flex items-center justify-center h-[20px] ${isActive ? "text-primary scale-110 -translate-y-3" : "text-muted-foreground group-hover:text-primary scale-100 translate-y-0"}`}>
                  {isProfileLink && user?.type === 'admin' ? 'Admin' : (isProfileLink ? 'Profile' : link.label)}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileNavbar
