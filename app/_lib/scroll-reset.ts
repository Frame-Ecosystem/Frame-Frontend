const HEADER_SELECTOR = "[data-nav-desktop], [data-nav-topbar]"

export function resetScrollAndFocusHeader(): void {
  if (typeof window === "undefined") return

  window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0

  const header = document.querySelector<HTMLElement>(HEADER_SELECTOR)
  if (!header) return

  const hadTabIndex = header.hasAttribute("tabindex")
  const prevTabIndex = header.getAttribute("tabindex")
  if (!hadTabIndex) {
    header.setAttribute("tabindex", "-1")
  }

  header.focus({ preventScroll: true })

  if (!hadTabIndex) {
    header.removeAttribute("tabindex")
  } else if (prevTabIndex !== null) {
    header.setAttribute("tabindex", prevTabIndex)
  }
}
