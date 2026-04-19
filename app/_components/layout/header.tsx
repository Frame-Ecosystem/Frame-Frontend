"use client"

import MobileNavbar from "./mobileNavbar"
import TopBar from "./topBar"
import { useAuth } from "@/app/_auth"
import DesktopNavbar from "./desktopNavbar"

const Header = () => {
  const { user, isLoading } = useAuth()

  return (
    <>
      {/* Desktop Header - only when authenticated*/}
      {user && <DesktopNavbar />}

      {/* Top Bar - render on mobile and desktop when not authenticated; Header controls showing Get Started */}
      <TopBar showGetStarted={!user} isLoading={isLoading} />

      {/* MOBILE NAVIGATION */}
      <MobileNavbar />
    </>
  )
}

export default Header
