// Center / service-item types

export interface Center {
  id: string
  name: string
  address?: string
  phones?: string[]
  description?: string
  imageUrl?: string
  coverImageUrl?: string
  isOpen?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ServiceItem {
  id: string
  name: string
  description?: string
  imageUrl?: string
  price: number
  durationMinutes?: number
  centerId: string
  center?: Center
}

// Backwards-compatibility: some code expects `CenterService`
export type CenterService = ServiceItem
