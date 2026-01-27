// Export all services from a single entry point
export { apiClient } from "./api"
export { barbershopService } from "./barbershop.service"
export { bookingService } from "./booking.service"
export { authService } from "./auth.service"
export type { Barbershop, Booking, CreateBookingInput, User, AuthResponse } from "../_types"
