"use client"

import { useEffect, useState, useRef } from "react"

export function useScrollPosition() {
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY

          if (currentScrollY === 0) {
            setIsVisible(true)
          } else if (currentScrollY < lastScrollYRef.current - 10) {
            // Scrolling up by more than 10px
            setIsVisible(true)
          } else if (currentScrollY > lastScrollYRef.current + 10) {
            // Scrolling down by more than 10px
            setIsVisible(false)
          }

          lastScrollYRef.current = currentScrollY
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return isVisible
}
