"use client"

import { ErrorBoundary } from "@/app/_components/errorBoundary"
// import { notFound } from "next/navigation"
import Image from "next/image"
import { 
  StarIcon, 
  MapPinIcon, 
  UsersIcon, 
  AwardIcon, 
  InfoIcon, 
  CheckCircleIcon, 
  CalendarIcon, 
  ClockIcon, 
  PhoneIcon 
} from "lucide-react"
import { Badge } from "@/app/_components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card"
import ServiceItem from "@/app/_components/service-item"
import PhoneItem from "@/app/_components/phone-item"
import { Barbershop, BarbershopService } from "@/app/_types"
// import { Barbershop, BarbershopService } from "@/app/_types"
import { useAuth } from "@/app/_providers/auth"
// import { useEffect } from "react"
// import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"

// const STATIC_BARBERSHOPS: (Barbershop & { services: BarbershopService[] })[] = [
/*
  {
    id: "1",
    name: "Premium Barber Studio",
    address: "123 Main St, Downtown",
    imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=500&fit=crop",
    description: "Premium barber services with modern techniques. Our experienced team provides top-quality haircuts, beard trims, and grooming services in a comfortable and stylish environment.",
    phones: ["+1 234 567 8901"],
    services: [
      { id: "s1", name: "Haircut", description: "Classic haircut with styling", imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=200&h=200&fit=crop", price: 35, barbershopId: "1" },
      { id: "s2", name: "Beard Trim", description: "Professional beard shaping and trim", imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=200&h=200&fit=crop", price: 20, barbershopId: "1" },
      { id: "s3", name: "Haircut + Beard", description: "Complete grooming package", imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=200&h=200&fit=crop", price: 50, barbershopId: "1" },
    ]
  },
  {
    id: "2",
    name: "Classic Cuts Barber",
    address: "456 Oak Ave, Midtown",
    imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=500&fit=crop",
    description: "Classic barbershop with traditional techniques. We provide quality cuts and shaves in a relaxed atmosphere.",
    phones: ["+1 234 567 8902"],
    services: [
      { id: "s4", name: "Classic Cut", description: "Traditional haircut", imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=200&h=200&fit=crop", price: 30, barbershopId: "2" },
      { id: "s5", name: "Hot Towel Shave", description: "Relaxing hot towel shave", imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=200&h=200&fit=crop", price: 25, barbershopId: "2" },
    ]
  },
  {
    id: "3",
    name: "Modern Fade Lab",
    address: "789 Pine Rd, Uptown",
    imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=500&fit=crop",
    description: "Contemporary barbershop with trendy cuts. Specializing in fades, designs, and modern styles.",
    phones: ["+1 234 567 8903"],
    services: [
      { id: "s6", name: "Fade", description: "Modern fade haircut", imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=200&h=200&fit=crop", price: 40, barbershopId: "3" },
      { id: "s7", name: "Design Cut", description: "Custom hair design", imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=200&h=200&fit=crop", price: 55, barbershopId: "3" },
    ]
  },
*/
//
export default function BarbershopPage() {
  // const params = useParams()
  // const id = params.id as string
  const { user, isLoading } = useAuth()
  const isAuthenticated = !!user
  const router = useRouter()

  // Mock barbershop data for development
  const barbershop: Barbershop & { services: BarbershopService[] } = {
    id: "1",
    name: "Premium Barber Studio",
    address: "123 Main St, Downtown",
    imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=500&fit=crop",
    description: "Premium barber services with modern techniques.",
    phones: ["+1 234 567 8901"],
    services: []
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Redirect to sign-in if not authenticated
  if (!isAuthenticated) {
    router.push('/')
    return null
  }

  const openingHours = {
    monday: "08:00 - 18:00",
    tuesday: "08:00 - 18:00",
    wednesday: "08:00 - 18:00",
    thursday: "08:00 - 18:00",
    friday: "08:00 - 20:00",
    saturday: "09:00 - 16:00",
    sunday: "Closed",
  }

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br mb-20 lg:mb-0 ">

      {/* =================================================================== */}
      {/* HERO SECTION */}
      {/* Full-width cover image with overlaid information */}
      {/* =================================================================== */}
      <div className="relative h-[300px] w-full">
        {/* Background cover image */}
        <Image
          alt={barbershop.name}
          src={barbershop?.imageUrl || "/images/placeholder.png"}
          fill
          sizes="100vw"
          quality={75}
          className="object-cover"
          priority={true}
        />

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />

        {/* --------------------------------------------------------------- */}
        {/* Overlaid Barbershop Info */}
        {/* Rating, reviews count, name, and address */}
        {/* --------------------------------------------------------------- */}
        <div className="absolute right-0 bottom-0 left-0 p-5 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-white">
              {/* Rating and reviews badges */}
              <div className="mb-2 flex items-center gap-2">
                <Badge className="bg-primary/90 backdrop-blur-sm">
                  <StarIcon size={12} className="mr-1 fill-white text-white" />
                  4.9
                </Badge>
                <Badge
                  variant="secondary"
                  className="border-white/30 bg-white/20 text-white backdrop-blur-sm"
                >
                  70 reviews
                </Badge>
              </div>

              {/* Barbershop name */}
              <h1 className="mb-2 text-2xl font-bold lg:mb-4 lg:text-4xl">
                {barbershop.name}
              </h1>

              {/* Address with map pin icon */}
              <div className="flex items-center gap-2 text-white/90">
                <MapPinIcon size={16} className="lg:h-5 lg:w-5" />
                <p className="text-sm lg:text-base">{barbershop?.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MAIN CONTENT */}
      {/* =================================================================== */}
      <div className="mx-auto max-w-7xl">
        <div className="p-5 lg:px-8 lg:py-12">

          {/* =============================================================== */}
          {/* TWO-COLUMN LAYOUT (Desktop) */}
          {/* Left: Main content (8 cols) | Right: Sidebar (4 cols) */}
          {/* =============================================================== */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">

            {/* ------------------------------------------------------------- */}
            {/* LEFT COLUMN - Main Content */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-8 lg:col-span-8">

              {/* =========================================================== */}
              {/* Quick Stats - Mobile Only */}
              {/* Compact stats cards visible only on mobile devices */}
              {/* =========================================================== */}
              <div className="grid grid-cols-3 gap-3 lg:hidden">
                {/* Rating */}
                <Card className="bg-card/50 border-0 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <StarIcon className="h-5 w-5 text-yellow-500" />
                      <p className="text-lg font-bold">4.9</p>
                      <p className="text-muted-foreground text-xs">Rating</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Clients served */}
                <Card className="bg-card/50 border-0 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <UsersIcon className="h-5 w-5 text-blue-500" />
                      <p className="text-lg font-bold">70</p>
                      <p className="text-muted-foreground text-xs">Clients</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Years in business */}
                <Card className="bg-card/50 border-0 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <AwardIcon className="h-5 w-5 text-primary" />
                      <p className="text-lg font-bold">5+</p>
                      <p className="text-muted-foreground text-xs">Years</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* =========================================================== */}
              {/* About Section */}
              {/* Barbershop description and amenities list */}
              {/* =========================================================== */}
              <Card className="bg-card/30 border-0 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <InfoIcon className="text-primary h-5 w-5" />
                    About the Barbershop
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Description text */}
                  <p className="text-muted-foreground leading-relaxed lg:text-lg">
                    {barbershop?.description}
                  </p>

                  {/* Amenities/Features Grid */}
                  <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircleIcon className="h-4 w-4 text-primary" />
                      <span>Free Wi-Fi</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircleIcon className="h-4 w-4 text-primary" />
                      <span>Parking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircleIcon className="h-4 w-4 text-primary" />
                      <span>Credit Card</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircleIcon className="h-4 w-4 text-primary" />
                      <span>Premium Products</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircleIcon className="h-4 w-4 text-primary" />
                      <span>Air Conditioned</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircleIcon className="h-4 w-4 text-primary" />
                      <span>Qualified Professionals</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* =========================================================== */}
              {/* Services Section */}
              {/* List of available services with booking capability */}
              {/* =========================================================== */}
              <Card className="bg-card/30 border-0 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="text-primary h-5 w-5" />
                      Our Services
                    </CardTitle>
                    {/* Service count badge */}
                    <Badge variant="secondary" className="px-3 py-1">
                      {barbershop.services.length} services
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Services list - each service is rendered via ServiceItem component */}
                  <div className="grid gap-4 lg:gap-6">
                    {barbershop.services.map((service) => (
                      <ServiceItem
                        key={service.id}
                        barbershop={barbershop}
                        service={service}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* RIGHT COLUMN - Sidebar */}
            {/* ------------------------------------------------------------- */}
            <div className="mt-8 space-y-6 lg:col-span-4 lg:mt-0">

                                    {/* =========================================================== */}
                                    {/* Quick Stats - Desktop Only */}
                                    {/* Larger stats cards visible only on desktop */}
                                    {/* =========================================================== */}
                                    <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4">
                                      {/* Rating Card */}
                                      <Card className="border-yellow-500/20 bg-linear-to-br from-yellow-500/10 to-yellow-500/5 backdrop-blur-sm">
                                        <CardContent className="p-6 text-center">
                                          <div className="flex flex-col items-center gap-2">
                                            <div className="rounded-xl bg-yellow-500/20 p-3">
                                              <StarIcon className="h-6 w-6 text-yellow-500" />
                                            </div>
                                            <p className="text-2xl font-bold text-yellow-500">4.9</p>
                                            <p className="text-muted-foreground text-sm">
                                              Average Rating
                                            </p>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      {/* Clients Card */}
                                      <Card className="border-blue-500/20 bg-linear-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-sm">
                                        <CardContent className="p-6 text-center">
                                          <div className="flex flex-col items-center gap-2">
                                            <div className="rounded-xl bg-blue-500/20 p-3">
                                              <UsersIcon className="h-6 w-6 text-blue-500" />
                                            </div>
                                            <p className="text-2xl font-bold text-blue-500">+70</p>
                                            <p className="text-muted-foreground text-sm">
                                              Clients Served
                                            </p>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    {/* =========================================================== */}
                                    {/* Opening Hours Card */}
                                    {/* Weekly schedule with day-by-day hours */}
                                    {/* =========================================================== */}
                                    <Card className="bg-card/30 border-0 backdrop-blur-sm">
                                      <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                          <ClockIcon className="text-primary h-5 w-5" />
                                          Opening Hours
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-3">
                                          {/* Iterate through each day and display hours */}
                                          {Object.entries(openingHours).map(([day, hours]) => (
                                            <div
                                              key={day}
                                              className="border-border/50 flex items-center justify-between border-b py-2 last:border-0"
                                            >
                                              {/* Day name (capitalized) */}
                                              <span className="text-sm font-medium capitalize">
                                                {day.charAt(0).toUpperCase() + day.slice(1)}
                                              </span>
                                              {/* Hours (red if closed) */}
                                              <span
                                                className={`text-sm ${hours === "Closed" ? "text-red-500" : "text-muted-foreground"}`}
                                              >
                                                {hours}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {/* =========================================================== */}
                                    {/* Contact Information Card */}
                                    {/* Phone numbers with click-to-call functionality */}
                                    {/* =========================================================== */}
                                    <Card className="bg-card/30 border-0 backdrop-blur-sm">
                                      <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                          <PhoneIcon className="text-primary h-5 w-5" />
                                          Contact
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-4">
                                          {/* Render each phone number using PhoneItem component */}
                                          {(barbershop.phones || []).map((phone) => (
                                            <PhoneItem key={phone} phone={phone} />
                                          ))}
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {/* =========================================================== */}
                                    {/* Call-to-Action Card */}
                                    {/* Encourages users to book an appointment */}
                                    {/* =========================================================== */}
                                    <Card className="from-primary/10 to-primary/5 border-primary/20 bg-linear-to-br backdrop-blur-sm">
                                      <CardContent className="p-6 text-center">
                                        <h3 className="mb-2 flex items-center justify-center gap-2 text-lg font-semibold">
                                          <CalendarIcon aria-hidden="true" />
                                          Ready to book?
                                        </h3>
                                        <p className="text-muted-foreground mb-4 text-sm">
                                          Choose one of our services and schedule your appointment
                                        </p>
                                      </CardContent>
                                    </Card>
            </div>

            {/* End two-column layout */}
          </div>
        </div>
      </div>
      
      {/* End main background */}
      </div>
    </ErrorBoundary>
  )
}

