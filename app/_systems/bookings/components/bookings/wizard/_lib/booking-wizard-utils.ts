import type { LoungeAgent, LoungeService } from "../../../../_types"

/**
 * Check if an agent can perform ALL the given services.
 */
export function canAgentPerformAllServices(
  agent: LoungeAgent,
  services: LoungeService[],
): boolean {
  if (!services.length) return true
  if (!agent.idLoungeService || agent.idLoungeService.length === 0) return false
  return services.every((service) =>
    agent.idLoungeService!.includes(service.id),
  )
}

/**
 * Get services that the agent cannot perform from the given list.
 */
export function getUnavailableServices(
  agent: LoungeAgent,
  services: LoungeService[],
): LoungeService[] {
  if (!services.length || !agent.idLoungeService) return []
  return services.filter(
    (service) => !agent.idLoungeService!.includes(service.id),
  )
}

/**
 * Check if an agent can perform a specific service.
 */
export function canAgentPerformService(
  agent: LoungeAgent,
  serviceId: string,
): boolean {
  return agent.idLoungeService?.includes(serviceId) || false
}

/**
 * Get available agents for a specific service from the agent list.
 */
export function getAvailableAgentsForService(
  agents: LoungeAgent[],
  serviceId: string,
): LoungeAgent[] {
  return agents.filter((agent) => canAgentPerformService(agent, serviceId))
}
