/**
 * Static barbershop data
 * TODO: Replace with API calls to Express backend
 */

import { Barbershop } from "../_types"

export const STATIC_BARBERSHOPS: Barbershop[] = [
  {
    id: "1",
    name: "Premium Barber Studio",
    address: "123 Main St, Downtown",
    imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=500&fit=crop",
    description: "Premium barber services with modern techniques",
    phones: ["+1 234 567 8901"],
  },
  {
    id: "2",
    name: "Classic Cuts Barbershop",
    address: "456 Oak Ave, Midtown",
    imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=500&fit=crop",
    description: "Traditional barber shop with expert stylists",
    phones: ["+1 234 567 8902"],
  },
  {
    id: "3",
    name: "Modern Fade Lab",
    address: "789 Pine Rd, Uptown",
    imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=500&fit=crop",
    description: "Contemporary barbershop with trendy cuts",
    phones: ["+1 234 567 8903"],
  },
]
