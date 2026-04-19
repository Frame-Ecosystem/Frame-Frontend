import { useQuery } from "@tanstack/react-query"
import clientService from "@/app/_services/client.service"

export const clientProfileKeys = {
  all: ["clientProfile"] as const,
  profile: (id: string) => [...clientProfileKeys.all, "profile", id] as const,
  bookings: (id: string, page: number, status?: string) =>
    [...clientProfileKeys.all, "bookings", id, page, status] as const,
  likes: (id: string, page: number) =>
    [...clientProfileKeys.all, "likes", id, page] as const,
  ratings: (id: string, page: number) =>
    [...clientProfileKeys.all, "ratings", id, page] as const,
}

/** Fetch a client's public profile + stats. */
export function useClientProfile(clientId: string | undefined) {
  return useQuery({
    queryKey: clientProfileKeys.profile(clientId ?? ""),
    queryFn: () => clientService.getClientProfile(clientId!),
    enabled: !!clientId,
  })
}

/** Fetch a client's booking history (paginated). */
export function useClientBookings(
  clientId: string | undefined,
  page = 1,
  status?: string,
) {
  return useQuery({
    queryKey: clientProfileKeys.bookings(clientId ?? "", page, status),
    queryFn: () =>
      clientService.getClientBookings(clientId!, {
        page,
        limit: 10,
        status: status || undefined,
      }),
    enabled: !!clientId,
  })
}

/** Fetch lounges liked by the client (paginated). */
export function useClientLikes(clientId: string | undefined, page = 1) {
  return useQuery({
    queryKey: clientProfileKeys.likes(clientId ?? "", page),
    queryFn: () => clientService.getClientLikes(clientId!, { page, limit: 10 }),
    enabled: !!clientId,
  })
}

/** Fetch ratings given by the client (paginated). */
export function useClientRatings(clientId: string | undefined, page = 1) {
  return useQuery({
    queryKey: clientProfileKeys.ratings(clientId ?? "", page),
    queryFn: () =>
      clientService.getClientRatings(clientId!, { page, limit: 10 }),
    enabled: !!clientId,
  })
}
