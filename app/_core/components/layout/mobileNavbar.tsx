"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/app/_auth"
import { getHomePath } from "@/app/_lib/profile"
import { NAV_LINKS } from "@/app/_constants/navigation"
import { useScrollDirection } from "@/app/_hooks/useScrollDirection"
import { useTranslation } from "@/app/_i18n"

const MobileNavbar = () => {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  const scrollDir = useScrollDirection(50)
  const { t } = useTranslation()
  const isHomePage = pathname === "/home"
  const hidden = isHomePage && scrollDir === "down"

  if (isLoading || !user) return null

  const filteredNavLinks = NAV_LINKS.filter((link: any) => {
    if (link.href === "/lounges" && user.type === "lounge") {
      return false
    }
    if (link.loungeOnly && user.type !== "lounge") {
      return false
    }
    return true
  })

  return (
    <>
      <nav
        data-nav-mobile
        className={`bg-card/95 border-border fixed right-0 bottom-0 left-0 z-[9999] h-[86px] border-t shadow-[0_-2px_12px_0_rgba(0,0,0,0.04)] backdrop-blur-sm transition-transform duration-300 ease-in-out lg:hidden ${hidden ? "translate-y-[200%]" : "translate-y-0"}`}
      >
        <div className="relative mb-2 flex h-full items-center justify-between gap-1 px-3 py-2 pb-8">
          {filteredNavLinks.map((link) => {
            const isHomeLink = link.href === "/home"
            const href = isHomeLink ? getHomePath() : link.href
            let isActive = false
            if (isHomeLink) {
              isActive = pathname === "/home"
            } else if (link.href === "/") {
              isActive = pathname === "/"
            } else {
              isActive = pathname.startsWith(link.href)
            }

            const Icon = link.icon as any

            return (
              <Link
                key={link.href}
                href={href}
                className="flex flex-1 justify-center"
              >
                <div
                  className={`group relative flex h-full w-full flex-col items-center gap-0.5 px-1 py-1`}
                >
                  <span
                    className={`rounded-full p-2 transition-all duration-500 ease-[cubic-bezier(.68,-0.55,.27,1.55)] ${isActive ? "from-primary to-primary/80 text-primary-foreground border-card ring-primary/40 scale-110 border-4 bg-gradient-to-b shadow-2xl ring-2 backdrop-blur-md" : "bg-background text-muted-foreground group-hover:bg-muted/60 group-hover:text-primary"}`}
                    style={{
                      boxShadow: isActive
                        ? "0 16px 40px 0 rgba(0,0,0,0.22), 0 0 12px 2px rgba(80,120,255,0.12)"
                        : undefined,
                      transform: isActive
                        ? "translateY(-16px) scale(1.10) rotate(-6deg)"
                        : "translateY(0) scale(1) rotate(0deg)",
                    }}
                  >
                    <Icon className={isActive ? "h-4 w-4" : "h-5 w-5"} />
                  </span>
                  <span
                    className={`flex h-[20px] items-center justify-center text-[13px] font-semibold transition-all duration-300 ${isActive ? "text-primary -translate-y-3 scale-110" : "text-muted-foreground group-hover:text-primary translate-y-0 scale-100"}`}
                  >
                    {t(`nav.${link.label.toLowerCase()}`)}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

export default MobileNavbar
