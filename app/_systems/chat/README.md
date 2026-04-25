# Chat System

The chat system provides real-time one-to-one conversations, message history, reactions, typing indicators, and attachment support.

---

## Directory Structure

```
app/_systems/chat/
├── index.ts                 Public exports
├── service.ts               ChatService (REST client methods)
├── types/                   Conversation/message DTOs and response models
├── hooks/                   React Query + socket integration hooks
└── components/              Chat UI (drawer, list, bubbles, input, search)
```

---

## API Surface

Base path: `/v1/chat`

### Conversations

- `POST /conversations` — find-or-create direct conversation
- `GET /conversations` — list conversations (paginated)
- `GET /conversations/:id` — get conversation details
- `DELETE /conversations/:id` — delete conversation

### Messages

- `GET /conversations/:id/messages` — paginated history (cursor or offset)
- `POST /conversations/:id/messages` — send text or attachment
- `PATCH /conversations/:id/messages/:messageId` — edit message
- `DELETE /conversations/:id/messages/:messageId` — delete message
- `PATCH /conversations/:id/messages/read` — mark messages as read
- `POST /conversations/:id/messages/:messageId/reactions` — toggle reaction
- `GET /conversations/:id/messages/search` — search messages
- `POST /conversations/:id/typing` — send typing state

---

## Design Notes

- `service.ts` handles backend response shape variation (`res.data` vs direct payloads).
- Message send supports both JSON (text-only) and `FormData` (attachments).
- Hooks layer is responsible for cache invalidation and optimistic updates.
