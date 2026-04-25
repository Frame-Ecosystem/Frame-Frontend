"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"

interface ChatPanelContextValue {
  isOpen: boolean
  activeConversationId: string | null
  open: (conversationId?: string) => void
  close: () => void
  openConversation: (id: string) => void
  goBackToList: () => void
}

const ChatPanelContext = createContext<ChatPanelContextValue | null>(null)

export function ChatPanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null)

  const open = useCallback((conversationId?: string) => {
    if (conversationId) setActiveConversationId(conversationId)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    // Delay clearing so the closing animation stays clean
    setTimeout(() => setActiveConversationId(null), 300)
  }, [])

  const openConversation = useCallback((id: string) => {
    setActiveConversationId(id)
    setIsOpen(true)
  }, [])

  const goBackToList = useCallback(() => {
    setActiveConversationId(null)
  }, [])

  return (
    <ChatPanelContext.Provider
      value={{
        isOpen,
        activeConversationId,
        open,
        close,
        openConversation,
        goBackToList,
      }}
    >
      {children}
    </ChatPanelContext.Provider>
  )
}

export function useChatPanel(): ChatPanelContextValue {
  const ctx = useContext(ChatPanelContext)
  if (!ctx)
    throw new Error("useChatPanel must be used inside ChatPanelProvider")
  return ctx
}
