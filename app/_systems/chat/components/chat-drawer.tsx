"use client"

import { useCallback } from "react"
import { MessageCircle, X } from "lucide-react"
import { useAuth } from "@/app/_auth"
import { Sheet, SheetContent, SheetTitle } from "@/app/_components/ui/sheet"
import { ConversationList } from "./conversation-list"
import { ChatWindow } from "./chat-window"
import { ChatIconBtn } from "./ui/chat-atoms"
import { useChatPanel } from "@/app/_providers/chat-panel"
import {
  useConversations,
  useDeleteConversation,
} from "../hooks/useChatQueries"
import { useConversationsSocket } from "../hooks/useChatSocket"

export function ChatDrawer() {
  const { user } = useAuth()
  const {
    isOpen,
    activeConversationId,
    close,
    openConversation,
    goBackToList,
  } = useChatPanel()

  const { data, isLoading } = useConversations()
  const deleteConversation = useDeleteConversation()

  // Keep conversation list in sync with real-time events while mounted
  useConversationsSocket(user?._id ?? "")

  const handleDelete = useCallback(() => {
    if (!activeConversationId) return
    deleteConversation.mutate(activeConversationId, {
      onSuccess: goBackToList,
    })
  }, [activeConversationId, deleteConversation, goBackToList])

  if (!user) return null

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent
        side="right"
        // Hide the default shadcn close button — we use our own header controls
        className="flex h-full w-full flex-col p-0 sm:w-[420px] [&>button]:hidden"
      >
        {/* Radix Dialog requires a title for screen reader accessibility */}
        <SheetTitle className="sr-only">Messages</SheetTitle>
        {activeConversationId ? (
          <ChatWindow
            conversationId={activeConversationId}
            onBack={goBackToList}
            onDeleteConversation={handleDelete}
          />
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Panel header */}
            <div className="border-border/60 flex h-14 shrink-0 items-center justify-between border-b px-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="text-primary h-5 w-5" />
                <h2 className="text-lg font-bold">Messages</h2>
              </div>
              <ChatIconBtn onClick={close} label="Close panel">
                <X className="h-4 w-4" />
              </ChatIconBtn>
            </div>

            {/* Conversation list */}
            <ConversationList
              conversations={data?.data ?? []}
              currentUserId={user._id ?? ""}
              isLoading={isLoading}
              onSelect={openConversation}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
