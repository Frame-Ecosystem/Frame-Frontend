"use client"
import { useEffect } from "react"

const ServiceWorkerRegister = () => {
  useEffect(() => {
    // Skip service worker registration in development or when API calls are failing
    const shouldRegister = false // Temporarily disable service worker

    if ("serviceWorker" in navigator && shouldRegister) {
      // Unregister any existing service workers first
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister()
        })
      })

      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered: ", registration)
          })
          .catch((registrationError) => {
            console.log("SW registration failed: ", registrationError)
          })
      })
    } else {
      // Unregister service worker if it exists
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister()
          })
        })
      }
    }
  }, [])

  return null
}

export default ServiceWorkerRegister
