import { apiClient } from "./api"
import type { Booking, CreateBookingInput } from "../_types"

class BookingService {
  async getConfirmed(): Promise<Booking[]> {
    try {
      const data = await apiClient.get<Booking[]>("/bookings/confirmed")
      return data
    } catch {
      return []
    }
  }

  async getConcluded(): Promise<Booking[]> {
    try {
      const data = await apiClient.get<Booking[]>("/bookings/concluded")
      return data
    } catch {
      return []
    }
  }

  async getAll(): Promise<Booking[]> {
    try {
      const data = await apiClient.get<Booking[]>("/bookings")
      return data
    } catch {
      return []
    }
  }

  async create(input: CreateBookingInput): Promise<Booking | null> {
    try {
      const data = await apiClient.post<Booking>("/bookings", input)
      return data
    } catch {
      return null
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/bookings/${id}`)
      return true
    } catch {
      return false
    }
  }

  async cancel(id: string): Promise<boolean> {
    try {
      await apiClient.patch(`/bookings/${id}/cancel`)
      return true
    } catch {
      return false
    }
  }
}

export const bookingService = new BookingService()
