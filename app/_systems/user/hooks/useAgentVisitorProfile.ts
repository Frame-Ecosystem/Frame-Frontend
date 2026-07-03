import { useQuery } from "@tanstack/react-query"
import { agentService } from "@/app/_systems/user/services/agent.service"

export const agentProfileKeys = {
  all: ["agentProfile"] as const,
  profile: (id: string) => [...agentProfileKeys.all, "profile", id] as const,
}

export function useAgentVisitorProfile(agentId: string | undefined) {
  return useQuery({
    queryKey: agentProfileKeys.profile(agentId ?? ""),
    queryFn: () => agentService.getAgentById(agentId!),
    enabled: !!agentId,
  })
}
