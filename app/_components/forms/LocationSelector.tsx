"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { MapPinIcon, SearchIcon, ChevronDown } from "lucide-react"
import { authService } from "../../_services/auth.service"
import { useAuth } from "../../_providers/auth"
import type { LocationData } from "../../_types"

interface LocationSelectorProps {
  onLocationUpdate?: () => void
}

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    google: any
  }
}

export function LocationSelector({ onLocationUpdate }: LocationSelectorProps) {
  const { user, setAuth, accessToken } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null,
  )
  const isMapInitializedRef = useRef(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google) {
      console.error(
        "LocationSelector: Map container or Google Maps not available",
      )
      return
    }

    // Default to Tunis, Tunisia
    const defaultLocation = { lat: 36.8065, lng: 10.1815 }

    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })

      const markerInstance = new window.google.maps.Marker({
        position: defaultLocation,
        map: mapInstance,
        draggable: true,
      })

      // Initialize Places Autocomplete
      const autocomplete = new window.google.maps.places.Autocomplete(
        searchInputRef.current!,
      )
      autocomplete.bindTo("bounds", mapInstance)

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace()
        if (!place.geometry) return

        const location = place.geometry.location!
        const newLocation: LocationData = {
          latitude: location.lat(),
          longitude: location.lng(),
          address: place.formatted_address || place.name || "",
          placeId: place.place_id || "",
          placeName: place.name || place.formatted_address?.split(",")[0] || "",
        }

        setSelectedLocation(newLocation)
        mapInstance.setCenter(location)
        mapInstance.setZoom(15)
        markerInstance.setPosition(location)
      })

      // Handle map clicks
      mapInstance.addListener("click", (event: any) => {
        const location = event.latLng
        const newLocation: LocationData = {
          latitude: location.lat(),
          longitude: location.lng(),
          address: "",
          placeId: "",
        }

        setSelectedLocation(newLocation)
        mapInstance.setCenter(location)
        mapInstance.setZoom(15)
        markerInstance.setPosition(location)

        // Reverse geocode to get address and placeId
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode({ location }, (results: any, status: any) => {
          if (status === "OK" && results[0]) {
            newLocation.address = results[0].formatted_address
            newLocation.placeId = results[0].place_id || `custom_${Date.now()}` // Generate a fallback placeId if not available
            // Extract place name - look for meaningful components
            const addressComponents = results[0].address_components
            let placeName = ""
            // Try to find a meaningful place name from address components
            const nameComponent = addressComponents.find((c: any) =>
              [
                "point_of_interest",
                "establishment",
                "premise",
                "sublocality",
                "locality",
              ].includes(c.types[0]),
            )
            if (nameComponent) {
              placeName = nameComponent.long_name
            } else {
              // Fallback to first part of formatted address
              placeName = results[0].formatted_address.split(",")[0]
            }
            newLocation.placeName = placeName
            setSelectedLocation({ ...newLocation })
          } else {
            // If geocoding fails, create a basic address
            newLocation.address = `${location.lat().toFixed(6)}, ${location.lng().toFixed(6)}`
            newLocation.placeId = `custom_${Date.now()}`
            newLocation.placeName = ""
            setSelectedLocation({ ...newLocation })
          }
        })
      })

      // Handle marker drag
      markerInstance.addListener("dragend", (event: any) => {
        const location = event.latLng
        const newLocation: LocationData = {
          latitude: location.lat(),
          longitude: location.lng(),
          address: "",
          placeId: "",
        }

        setSelectedLocation(newLocation)

        // Reverse geocode
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode({ location }, (results: any, status: any) => {
          if (status === "OK" && results[0]) {
            newLocation.address = results[0].formatted_address
            newLocation.placeId = results[0].place_id || `custom_${Date.now()}` // Generate a fallback placeId if not available
            // Extract place name - look for meaningful components
            const addressComponents = results[0].address_components
            let placeName = ""
            // Try to find a meaningful place name from address components
            const nameComponent = addressComponents.find((c: any) =>
              [
                "point_of_interest",
                "establishment",
                "premise",
                "sublocality",
                "locality",
              ].includes(c.types[0]),
            )
            if (nameComponent) {
              placeName = nameComponent.long_name
            } else {
              // Fallback to first part of formatted address
              placeName = results[0].formatted_address.split(",")[0]
            }
            newLocation.placeName = placeName
            setSelectedLocation({ ...newLocation })
          } else {
            // If geocoding fails, create a basic address
            newLocation.address = `${location.lat().toFixed(6)}, ${location.lng().toFixed(6)}`
            newLocation.placeId = `custom_${Date.now()}`
            newLocation.placeName = ""
            setSelectedLocation({ ...newLocation })
          }
        })
      })

      // Store references for cleanup if needed
      // setMap(mapInstance)
      // setMarker(markerInstance)
    } catch (error) {
      console.error("LocationSelector: Error initializing map:", error)
    }
  }, [])

  useEffect(() => {
    // Load Google Maps API only if not already loaded and not initialized
    if (!window.google && !isMapInitializedRef.current) {
      // Check if script is already being loaded
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]',
      )
      if (!existingScript) {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        if (!apiKey) {
          console.error("LocationSelector: Google Maps API key not found")
          return
        }
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
        script.async = true
        script.defer = true
        document.head.appendChild(script)

        script.onload = () => {
          setIsScriptLoaded(true)
        }

        script.onerror = () => {
          console.error("LocationSelector: Failed to load Google Maps script")
        }
      } else {
        // Script is already loading, wait for it
        existingScript.addEventListener("load", () => {
          setIsScriptLoaded(true)
        })
      }
    } else if (window.google) {
      // Google Maps is already loaded
      setIsScriptLoaded(true)
    }

    // Cleanup function
    return () => {
      // Clean up event listeners if component unmounts
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]',
      )
      if (existingScript) {
        existingScript.removeEventListener("load", () => {})
      }
    }
  }, [])

  // Initialize map when script is loaded and container is available
  useEffect(() => {
    if (
      isScriptLoaded &&
      isOpen &&
      !isMapInitializedRef.current &&
      mapRef.current
    ) {
      initializeMap()
      isMapInitializedRef.current = true
    }
  }, [isScriptLoaded, isOpen, initializeMap])

  const handleUpdateLocation = async () => {
    if (!selectedLocation) return

    setIsUpdating(true)
    try {
      const response = await authService.updateLocation(selectedLocation)
      if (response) {
        // Update the local user object with the new location data instead of refreshing from server
        if (user) {
          const updatedUser = {
            ...user,
            location: selectedLocation,
          }
          setAuth(updatedUser, accessToken) // Keep the existing token
        }
        onLocationUpdate?.()
        setSelectedLocation(null)
        setSearchQuery("")
        setIsOpen(false) // Close the expanded view after successful update
      }
    } catch (error) {
      console.error("Failed to update location:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border-border hover:bg-card/50 w-full rounded-lg border p-4 text-left transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPinIcon className="text-muted-foreground h-5 w-5" />
            <div>
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                Location
              </p>
              <p className="font-medium">
                {user?.location?.placeName ||
                  user?.location?.address ||
                  "No location set"}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`text-muted-foreground h-5 w-5 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="border-border bg-card/50 rounded-lg border p-4 backdrop-blur-sm">
          <h3 className="mb-4 font-semibold">Update Location</h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="location-search">Search for a location</Label>
              <div className="relative mt-1">
                <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  ref={searchInputRef}
                  id="location-search"
                  type="text"
                  placeholder="Search for a place..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="h-64 overflow-hidden rounded-lg border">
              <div ref={mapRef} className="h-full w-full" />
            </div>

            {selectedLocation && (
              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="mb-2 font-medium">Selected Location:</h4>
                <p className="text-muted-foreground mb-1 text-sm">
                  {selectedLocation.address ||
                    `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateLocation}
                    disabled={isUpdating}
                    size="sm"
                  >
                    {isUpdating ? "Updating..." : "Update Location"}
                  </Button>
                  <Button
                    onClick={() => setSelectedLocation(null)}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <p className="text-muted-foreground text-xs">
              Click on the map or search for a location to select it. Drag the
              marker to adjust the position.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
