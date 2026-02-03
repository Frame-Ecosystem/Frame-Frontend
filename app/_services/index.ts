// Export all services from a single entry point
export { apiClient } from "./api"
export { barbershopService } from "./barbershop.service"
export { bookingService } from "./booking.service"
export { authService } from "./auth.service"
export { serviceService } from "./service.service"
export { loungeService } from "./lounge.service"
export { serviceCategoryService } from "./service-category.service"
export { serviceSuggestionsService } from "./service-suggestions.service"
export { adminService } from "./admin.service"
export type {
  Barbershop,
  Booking,
  CreateBookingInput,
  User,
  AuthResponse,
  Service,
  ServiceCategory,
  ServiceSuggestion,
} from "../_types"
