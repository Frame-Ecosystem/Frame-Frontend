"use client"

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
} from "react"
import { Agent, AgentFilters, AgentStats, Paginated } from "../_types"
import { agentService } from "../_services"
import { apiClient } from "../_services"
import { isAuthError } from "../_services/api"
import { useAuth } from "./auth"

interface AgentState {
  agents: Agent[]
  currentAgent: Agent | null
  stats: AgentStats | null
  lounges: any[] // LoungeUser[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: AgentFilters
  loading: boolean
  error: string | null
  isAdmin: boolean
}

type AgentAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_AGENTS"; payload: Paginated<Agent> }
  | { type: "ADD_AGENT"; payload: Agent }
  | { type: "UPDATE_AGENT"; payload: Agent }
  | { type: "DELETE_AGENT"; payload: string }
  | { type: "SET_CURRENT_AGENT"; payload: Agent | null }
  | { type: "SET_STATS"; payload: AgentStats }
  | { type: "SET_FILTERS"; payload: AgentFilters }
  | {
      type: "SET_PAGINATION"
      payload: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }
  | { type: "SET_IS_ADMIN"; payload: boolean }
  | { type: "SET_LOUNGES"; payload: any[] }

const initialState: AgentState = {
  agents: [],
  currentAgent: null,
  stats: null,
  lounges: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  loading: false,
  error: null,
  isAdmin: false,
}

function agentReducer(state: AgentState, action: AgentAction): AgentState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "SET_AGENTS":
      return {
        ...state,
        agents: action.payload.data,
        pagination: {
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          total: action.payload.total,
          totalPages: Math.ceil(
            action.payload.total / (action.payload.limit || 10),
          ),
        },
      }
    case "ADD_AGENT":
      return { ...state, agents: [action.payload, ...state.agents] }
    case "UPDATE_AGENT":
      return {
        ...state,
        agents: state.agents.map((agent) =>
          agent._id === action.payload._id ? action.payload : agent,
        ),
        currentAgent:
          state.currentAgent?._id === action.payload._id
            ? action.payload
            : state.currentAgent,
      }
    case "DELETE_AGENT":
      return {
        ...state,
        agents: state.agents.filter((agent) => agent._id !== action.payload),
        currentAgent:
          state.currentAgent?._id === action.payload
            ? null
            : state.currentAgent,
      }
    case "SET_CURRENT_AGENT":
      return { ...state, currentAgent: action.payload }
    case "SET_STATS":
      return { ...state, stats: action.payload }
    case "SET_FILTERS":
      return { ...state, filters: action.payload }
    case "SET_PAGINATION":
      return { ...state, pagination: action.payload }
    case "SET_IS_ADMIN":
      return { ...state, isAdmin: action.payload }
    case "SET_LOUNGES":
      return { ...state, lounges: action.payload }
    default:
      return state
  }
}

interface AgentContextType extends AgentState {
  // Actions
  fetchAgents: (page?: number, limit?: number) => Promise<void> // eslint-disable-line no-unused-vars
  fetchAgentById: (id: string) => Promise<void> // eslint-disable-line no-unused-vars
  fetchLounges: () => Promise<void>
  createAgent: (data: any) => Promise<void> // eslint-disable-line no-unused-vars
  updateAgent: (id: string, data: any) => Promise<void> // eslint-disable-line no-unused-vars
  deleteAgent: (id: string) => Promise<void> // eslint-disable-line no-unused-vars
  setFilters: (filters: AgentFilters) => void // eslint-disable-line no-unused-vars
  clearFilters: () => void
  setPage: (page: number) => void // eslint-disable-line no-unused-vars
  refreshStats: () => Promise<void>
  bulkBlock: (ids: string[]) => Promise<void> // eslint-disable-line no-unused-vars
  bulkUnblock: (ids: string[]) => Promise<void> // eslint-disable-line no-unused-vars
  bulkDelete: (ids: string[]) => Promise<void> // eslint-disable-line no-unused-vars
  clearError: () => void
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export function AgentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(agentReducer, initialState)
  const { user } = useAuth()

  // Set admin status based on user type
  useEffect(() => {
    dispatch({ type: "SET_IS_ADMIN", payload: user?.type === "admin" })
  }, [user])

  const fetchAgents = useCallback(
    async (page = 1, limit = 10) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        dispatch({ type: "SET_ERROR", payload: null })

        let result: Paginated<Agent>
        if (state.isAdmin) {
          result = await agentService.getAllAgents(state.filters, page, limit)
        } else {
          // For lounge users, use the same getAllAgents endpoint
          // The backend will filter results based on authenticated user
          result = await agentService.getAllAgents(state.filters, page, limit)
        }

        dispatch({ type: "SET_AGENTS", payload: result })
      } catch (error: any) {
        if (isAuthError(error)) return
        dispatch({
          type: "SET_ERROR",
          payload: error.message || "Failed to fetch agents",
        })
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    [state.isAdmin, state.filters],
  )

  const fetchAgentById = async (id: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      const agent = await agentService.getAgentById(id)
      dispatch({ type: "SET_CURRENT_AGENT", payload: agent })
    } catch (error: any) {
      if (isAuthError(error)) return
      dispatch({
        type: "SET_ERROR",
        payload: error.message || "Failed to fetch agent",
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const fetchLounges = async () => {
    try {
      // Use the admin endpoint for getting lounge names
      const response = await apiClient.get<any>("/v1/admin/lounges/names")
      dispatch({ type: "SET_LOUNGES", payload: response.data || [] })
    } catch (error: any) {
      if (isAuthError(error)) return
      console.error("Failed to fetch lounges:", error)
      dispatch({ type: "SET_LOUNGES", payload: [] })
    }
  }

  const createAgent = async (data: any) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      await agentService.createAgent(data)
      // Always refetch to ensure frontend state is in sync with backend
      await fetchAgents(state.pagination.page, state.pagination.limit)
    } catch (error: any) {
      if (isAuthError(error)) return
      dispatch({
        type: "SET_ERROR",
        payload: error.message || "Failed to create agent",
      })
      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const updateAgent = async (id: string, data: any) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      const agent = await agentService.updateAgent(id, data)
      dispatch({ type: "UPDATE_AGENT", payload: agent })
    } catch (error: any) {
      if (isAuthError(error)) return
      dispatch({
        type: "SET_ERROR",
        payload: error.message || "Failed to update agent",
      })
      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const deleteAgent = async (id: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      await agentService.deleteAgent(id)
      dispatch({ type: "DELETE_AGENT", payload: id })
    } catch (error: any) {
      if (isAuthError(error)) return
      dispatch({
        type: "SET_ERROR",
        payload: error.message || "Failed to delete agent",
      })
      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const setFilters = (filters: AgentFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters })
  }

  const clearFilters = () => {
    dispatch({ type: "SET_FILTERS", payload: {} })
  }

  const setPage = (page: number) => {
    dispatch({ type: "SET_PAGINATION", payload: { ...state.pagination, page } })
  }

  const refreshStats = async () => {
    try {
      const stats = await agentService.getAgentStats()
      dispatch({ type: "SET_STATS", payload: stats })
    } catch (error: any) {
      if (isAuthError(error)) return
      console.error("Failed to fetch agent stats:", error)
    }
  }

  const bulkBlock = async (ids: string[]) => {
    if (!state.isAdmin) return
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      await agentService.bulkBlockAgents(ids)
      // Refresh the list
      await fetchAgents(state.pagination.page, state.pagination.limit)
    } catch (error: any) {
      if (isAuthError(error)) return
      dispatch({
        type: "SET_ERROR",
        payload: error.message || "Failed to block agents",
      })
      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const bulkUnblock = async (ids: string[]) => {
    if (!state.isAdmin) return
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      await agentService.bulkUnblockAgents(ids)
      // Refresh the list
      await fetchAgents(state.pagination.page, state.pagination.limit)
    } catch (error: any) {
      if (isAuthError(error)) return
      dispatch({
        type: "SET_ERROR",
        payload: error.message || "Failed to unblock agents",
      })
      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const bulkDelete = async (ids: string[]) => {
    if (!state.isAdmin) return
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      await agentService.bulkDeleteAgents(ids)
      // Refresh the list
      await fetchAgents(state.pagination.page, state.pagination.limit)
    } catch (error: any) {
      if (isAuthError(error)) return
      dispatch({
        type: "SET_ERROR",
        payload: error.message || "Failed to delete agents",
      })
      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const clearError = () => {
    dispatch({ type: "SET_ERROR", payload: null })
  }

  const value: AgentContextType = {
    ...state,
    fetchAgents,
    fetchAgentById,
    fetchLounges,
    createAgent,
    updateAgent,
    deleteAgent,
    setFilters,
    clearFilters,
    setPage,
    refreshStats,
    bulkBlock,
    bulkUnblock,
    bulkDelete,
    clearError,
  }

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
}

export function useAgent() {
  const context = useContext(AgentContext)
  if (context === undefined) {
    throw new Error("useAgent must be used within an AgentProvider")
  }
  return context
}
