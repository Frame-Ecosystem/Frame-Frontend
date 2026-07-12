# Frame Beauty — Chat System: Frontend Integration Guide

> **Purpose:** This document is a complete reference for the frontend team (or AI agent) to integrate with the Frame Beauty chat system. It covers every REST endpoint, every Socket.IO event, authentication, pagination, error handling, and real-time update patterns with full request/response examples.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Base URLs & Environment](#2-base-urls--environment)
3. [Authentication](#3-authentication)
4. [Mutual Follow Requirement](#4-mutual-follow-requirement)
5. [REST API — Conversations](#5-rest-api--conversations)
6. [REST API — Messages](#6-rest-api--messages)
7. [REST API — Search & Utilities](#7-rest-api--search--utilities)
8. [Socket.IO — Connection](#8-socketio--connection)
9. [Socket.IO — Client → Server Events](#9-socketio--client--server-events)
10. [Socket.IO — Server → Client Events](#10-socketio--server--client-events)
11. [Pagination Guide](#11-pagination-guide)
12. [Data Models](#12-data-models)
13. [Error Handling](#13-error-handling)
14. [Frontend Implementation Checklist](#14-frontend-implementation-checklist)
15. [Full Integration Example (React Native)](#15-full-integration-example-react-native)

---

## 1. Overview

Frame Beauty provides a **1-to-1 direct messaging** system between any two authenticated users (clients, lounges, agents, admins). The system uses:

- **REST API** for CRUD operations (conversations, messages, reactions, search)
- **Socket.IO** for real-time delivery (new messages, typing indicators, read receipts, reactions, edits, deletes)

**Key rules:**
- Both users **must follow each other** before a conversation can be created or messages sent (admin users bypass this).
- Conversations are identified by a stable `slug` derived from both participant IDs — no duplicate conversations are possible.
- Messages support text, images, files, and audio via Cloudflare R2.
- All conversations and messages are soft-deletable per user.

---

## 2. Base URLs & Environment

| Environment | Base URL |
|-------------|----------|
| Development | `http://localhost:2000` |
| Production  | `https://frame-backend-apis.onrender.com` |
| Swagger UI  | `http://<LAN_IP>:2000/api-docs` |

All endpoints are prefixed with `/v1/chat`.

---

## 3. Authentication

Every REST endpoint requires a valid JWT in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

For Socket.IO, the token is passed in the handshake `auth` object:

```js
const socket = io('wss://frame-backend-apis.onrender.com', {
  auth: { token: 'Bearer <accessToken>' }
});
```

**CSRF:** Mutating requests (`POST`, `PATCH`, `DELETE`) require an `x-csrf-token` header. Obtain the token from `GET /v1/auth/csrf-token` and send it on every mutating request.

---

## 4. Mutual Follow Requirement

Before a conversation can be created or a message sent, the server enforces a **mutual follow check**:

- **User A must follow User B** AND **User B must follow User A**.
- If either direction is missing, the request fails with `403: "You must follow each other to send messages"`.
- **Admin users bypass this restriction entirely** — admins can always message anyone.
- The check runs on **every** `sendMessage` call, not just conversation creation. If the follow relationship changes after a conversation is created, new messages will be blocked.

**Frontend action:** Before allowing a user to start a chat, call `GET /v1/follows/check/:targetId` for both directions, or handle the `403` error gracefully and show a "You must follow each other" message.

---

## 5. REST API — Conversations

### `POST /v1/chat/conversations` — Find or Create Conversation

Finds an existing DM or creates a new one atomically. Returns `201` for new, `200` for existing.

**Request:**
```http
POST /v1/chat/conversations
Content-Type: application/json
Authorization: Bearer <token>
x-csrf-token: <csrf>

{
  "recipientId": "664f1a2b3c4d5e6f7a8b9c0d"
}
```

**Response `201` (new conversation):**
```json
{
  "success": true,
  "data": {
    "_id": "664f1a2b3c4d5e6f7a8b9c0e",
    "participants": [
      { "_id": "...", "firstName": "John", "lastName": "Doe", "type": "client", "profileImage": "..." },
      { "_id": "...", "loungeTitle": "Beauty Lounge", "type": "lounge", "profileImage": "..." }
    ],
    "slug": "664f..._664f...",
    "unreadCounts": [
      { "userId": "664f...", "count": 0 },
      { "userId": "664f...", "count": 0 }
    ],
    "deletedFor": [],
    "isArchived": false,
    "createdAt": "2026-04-21T10:00:00.000Z",
    "updatedAt": "2026-04-21T10:00:00.000Z"
  },
  "message": "Conversation created"
}
```

**Response `200` (existing conversation):** Same shape, `message: "Conversation retrieved"`.

**Errors:**
| Status | Message |
|--------|---------|
| 400 | You cannot start a conversation with yourself |
| 403 | This user type cannot participate in conversations |
| 403 | You must follow each other to send messages |
| 404 | Recipient not found |

---

### `GET /v1/chat/conversations` — List My Conversations

Returns all conversations for the authenticated user, newest first.

**Request:**
```http
GET /v1/chat/conversations?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "participants": [ /* populated User objects */ ],
      "slug": "...",
      "lastMessage": {
        "messageId": "...",
        "senderId": "...",
        "text": "Hey, how are you?",
        "contentType": "text",
        "createdAt": "2026-04-21T10:05:00.000Z"
      },
      "unreadCounts": [
        { "userId": "...", "count": 3 },
        { "userId": "...", "count": 0 }
      ],
      "deletedFor": [],
      "isArchived": false,
      "updatedAt": "2026-04-21T10:05:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3,
  "message": "Conversations retrieved successfully"
}
```

**Query params:**
| Param | Type | Default | Max |
|-------|------|---------|-----|
| `page` | number | 1 | — |
| `limit` | number | 20 | 50 |

---

### `GET /v1/chat/conversations/:id` — Get Single Conversation

**Response:**
```json
{
  "success": true,
  "data": { /* Conversation with participants populated */ },
  "message": "Conversation retrieved successfully"
}
```

**Errors:** `404` if not a participant or conversation is soft-deleted for this user.

---

### `DELETE /v1/chat/conversations/:id` — Soft-Delete Conversation

Hides the conversation from the requesting user's inbox only. The other participant is unaffected.

**Request:**
```http
DELETE /v1/chat/conversations/:id
Authorization: Bearer <token>
x-csrf-token: <csrf>
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation removed from your inbox"
}
```

**Note:** If the user later calls `POST /conversations` with the same recipient, the conversation is automatically restored (pulled from `deletedFor`).

---

## 6. REST API — Messages

### `POST /v1/chat/conversations/:id/messages` — Send Message

**Rate limit:** 100 requests per 15 minutes per IP.

#### Text message (JSON):
```http
POST /v1/chat/conversations/:id/messages
Content-Type: application/json
Authorization: Bearer <token>
x-csrf-token: <csrf>

{
  "contentType": "text",
  "text": "Hello! How are you?",
  "replyTo": "664f...optional_parent_msg_id"
}
```

#### File/image/audio message (multipart):
```http
POST /v1/chat/conversations/:id/messages
Content-Type: multipart/form-data
Authorization: Bearer <token>
x-csrf-token: <csrf>

contentType: "image"
file: <binary file data>
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "_id": "664f...",
    "conversationId": "664f...",
    "senderId": {
      "_id": "664f...",
      "firstName": "John",
      "lastName": "Doe",
      "type": "client",
      "profileImage": "..."
    },
    "contentType": "text",
    "text": "Hello! How are you?",
    "replyTo": {
      "_id": "664f...",
      "text": "Original message",
      "contentType": "text",
      "senderId": "664f...",
      "createdAt": "2026-04-21T09:50:00.000Z"
    },
    "reactions": [],
    "readBy": [],
    "deletedFor": [],
    "isDeleted": false,
    "createdAt": "2026-04-21T10:05:00.000Z"
  },
  "message": "Message sent"
}
```

**Body fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `contentType` | `text` \| `image` \| `file` \| `audio` | Yes | |
| `text` | string | Yes for `text` | Max 4000 chars |
| `replyTo` | MongoId | No | `_id` of the parent message for threading |
| `file` | binary | Yes for image/file/audio | Uploaded to Cloudflare R2 |

**Errors:**
| Status | Message |
|--------|---------|
| 400 | Text content is required for text messages |
| 400 | Attachment is required for image, file, or audio messages |
| 400 | replyTo message not found in this conversation |
| 403 | You must follow each other to send messages |
| 404 | Conversation not found |

---

### `GET /v1/chat/conversations/:id/messages` — Get Messages

Supports **cursor-based** and **offset-based** pagination. Messages are returned in **chronological order** (oldest first).

#### Cursor mode (infinite scroll):
```http
GET /v1/chat/conversations/:id/messages?before=<messageId>&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": [ /* Message[] */ ],
  "hasMore": true,
  "limit": 50,
  "message": "Messages retrieved successfully"
}
```

#### Offset mode (numbered pages):
```http
GET /v1/chat/conversations/:id/messages?page=2&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": [ /* Message[] */ ],
  "total": 320,
  "page": 2,
  "totalPages": 7,
  "limit": 50,
  "message": "Messages retrieved successfully"
}
```

**Query params:**
| Param | Type | Default | Max | Notes |
|-------|------|---------|-----|-------|
| `page` | number | 1 | — | Ignored when `before` is set |
| `limit` | number | 50 | 100 | |
| `before` | MongoId | — | | Cursor: fetch messages older than this ID |

---

### `PATCH /v1/chat/conversations/:id/messages/read` — Mark as Read

Mark specific messages (or all unread messages) as read.

**Request:**
```http
PATCH /v1/chat/conversations/:id/messages/read
Content-Type: application/json
Authorization: Bearer <token>
x-csrf-token: <csrf>

{
  "messageIds": ["664f...", "664f..."]
}
```

Omit `messageIds` (or send `{}`) to mark **all** unread messages as read.

**Response:**
```json
{
  "success": true,
  "data": { "readMessageIds": ["664f...", "664f..."] },
  "message": "Messages marked as read"
}
```

**Side-effect:** Emits `chat:read` to the conversation room so the other participant sees read receipts update in real time.

---

### `PATCH /v1/chat/conversations/:id/messages/:msgId` — Edit Message

Edit the text of a message you sent. Only `contentType === 'text'` messages within a **15-minute window** can be edited.

**Request:**
```http
PATCH /v1/chat/conversations/:id/messages/:msgId
Content-Type: application/json
Authorization: Bearer <token>
x-csrf-token: <csrf>

{
  "text": "Corrected message text"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated Message with editedAt set */ },
  "message": "Message edited"
}
```

**Errors:** `403` if not the sender or edit window expired; `404` if message not found.

**Side-effect:** Emits `chat:message:edited` to the conversation room.

---

### `DELETE /v1/chat/conversations/:id/messages/:msgId` — Delete/Recall Message

**Request:**
```http
DELETE /v1/chat/conversations/:id/messages/:msgId
Content-Type: application/json
Authorization: Bearer <token>
x-csrf-token: <csrf>

{
  "recallForEveryone": true
}
```

| `recallForEveryone` | Who can call | Effect |
|---------------------|-------------|--------|
| `true` | Sender only | Sets `isDeleted = true`, clears text/attachment; all participants see "This message was deleted" |
| `false` (default) | Any participant | Adds userId to `deletedFor`; only hides for the requester |

**Side-effect:** Emits `chat:message:deleted` to the conversation room.

---

### `POST /v1/chat/conversations/:id/messages/:msgId/reactions` — Toggle Reaction

Toggle an emoji reaction. Same emoji = remove, different emoji = replace, new emoji = add.

**Request:**
```http
POST /v1/chat/conversations/:id/messages/:msgId/reactions
Content-Type: application/json
Authorization: Bearer <token>
x-csrf-token: <csrf>

{
  "emoji": "👍"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reactions": [
      { "userId": "664f...", "emoji": "👍", "createdAt": "2026-04-21T10:10:00.000Z" }
    ]
  },
  "message": "Reaction updated"
}
```

**Side-effect:** Emits `chat:reaction` to the conversation room.

---

## 7. REST API — Search & Utilities

### `GET /v1/chat/conversations/:id/messages/search` — Full-Text Search

```http
GET /v1/chat/conversations/:id/messages/search?q=appointment&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [ /* Message[] sorted by relevance, then recency */ ],
  "message": "Search completed"
}
```

**Query params:**
| Param | Type | Required | Max |
|-------|------|----------|-----|
| `q` | string | Yes | 200 chars |
| `limit` | number | No | 50 (default 20) |

---

### `POST /v1/chat/conversations/:id/typing` — REST Typing Indicator

Fallback for clients that cannot use WebSockets. **Prefer** Socket.IO for lower latency.

```http
POST /v1/chat/conversations/:id/typing
Content-Type: application/json
Authorization: Bearer <token>
x-csrf-token: <csrf>

{ "isTyping": true }
```

**Response:** `204` (no body).

---

## 8. Socket.IO — Connection

```js
import { io } from 'socket.io-client';

const BASE_URL = 'https://frame-backend-apis.onrender.com'; // or localhost:2000

const socket = io(BASE_URL, {
  auth: { token: `Bearer ${accessToken}` },
  transports: ['websocket'], // recommended for React Native
});

socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('Socket connection error:', err.message);
});
```

**Important rooms:**

| Room | Who joins | Purpose |
|------|-----------|---------|
| `chat:{conversationId}` | Conversation participants (explicit join via `chat:join`) | Receive all real-time chat events for that conversation |
| `notifications:{userId}` | All authenticated users (auto-joined by the backend on connect) | Receive `chat:conversation:updated` events for inbox refresh |

---

## 9. Socket.IO — Client → Server Events

### `chat:join` — Join a Conversation Room

**Must be called** before sending typing indicators. Also needed to receive real-time events for that conversation.

```js
socket.emit('chat:join', {
  conversationId: '664f...',
  token: `Bearer ${accessToken}`
}, (response) => {
  if (response.ok) {
    console.log('Joined chat room');
  } else {
    console.error('Join failed:', response.error);
  }
});
```

**ACK responses:**
| Response | Meaning |
|----------|---------|
| `{ ok: true }` | Successfully joined |
| `{ error: 'conversationId and token are required' }` | Missing payload |
| `{ error: 'Invalid or expired token' }` | JWT verification failed |
| `{ error: 'Access denied' }` | User is not a participant |
| `{ error: 'Internal error' }` | Server error |

---

### `chat:leave` — Leave a Conversation Room

Call when navigating away from a conversation view. Rooms are also auto-left on disconnect.

```js
socket.emit('chat:leave', { conversationId: '664f...' });
```

---

### `chat:typing` — Typing Indicator

```js
// User started typing
socket.emit('chat:typing', { conversationId: '664f...', isTyping: true });

// User stopped typing (send immediately — no throttle)
socket.emit('chat:typing', { conversationId: '664f...', isTyping: false });
```

**Throttle:** The server throttles `isTyping: true` to at most once every **2 seconds** per user+conversation pair. `isTyping: false` is always forwarded immediately.

**Prerequisite:** Socket must have called `chat:join` first.

---

## 10. Socket.IO — Server → Client Events

All server events include a `timestamp` field (ISO 8601).

### `chat:message` — New Message

```js
socket.on('chat:message', (payload) => {
  const message = payload.data;
  // message._id, message.senderId (populated), message.text, message.contentType, etc.
  // Add to messages list, update conversation preview, etc.
});
```

**Payload:**
```json
{
  "data": {
    "_id": "...",
    "conversationId": "...",
    "senderId": { "_id": "...", "firstName": "John", "lastName": "Doe", "type": "client" },
    "contentType": "text",
    "text": "Hello!",
    "reactions": [],
    "readBy": [],
    "createdAt": "2026-04-21T10:05:00.000Z"
  },
  "timestamp": "2026-04-21T10:05:00.000Z"
}
```

**Room:** `chat:{conversationId}`

---

### `chat:message:edited` — Message Edited

```js
socket.on('chat:message:edited', (payload) => {
  const updated = payload.data;
  // Patch the message in your local state: text = updated.text, editedAt = updated.editedAt
});
```

**Payload:**
```json
{
  "data": { "_id": "...", "text": "Corrected text", "editedAt": "2026-04-21T10:15:00.000Z" },
  "timestamp": "..."
}
```

**Room:** `chat:{conversationId}`

---

### `chat:message:deleted` — Message Deleted/Recalled

```js
socket.on('chat:message:deleted', (payload) => {
  const { messageId, recalledForAll } = payload;
  // If recalledForAll: replace message content with "This message was deleted"
  // If not recalledForAll: remove from local list (hidden for this user only)
});
```

**Payload:**
```json
{
  "messageId": "...",
  "recalledForAll": true,
  "timestamp": "..."
}
```

**Room:** `chat:{conversationId}`

---

### `chat:reaction` — Reaction Toggled

```js
socket.on('chat:reaction', (payload) => {
  const { messageId, userId, emoji, reactions } = payload;
  // Update the reactions array on the matching message in your local state
});
```

**Payload:**
```json
{
  "messageId": "...",
  "userId": "...",
  "emoji": "👍",
  "reactions": [
    { "userId": "...", "emoji": "👍", "createdAt": "..." }
  ],
  "timestamp": "..."
}
```

**Room:** `chat:{conversationId}`

---

### `chat:read` — Read Receipts Updated

```js
socket.on('chat:read', (payload) => {
  const { readBy, messageIds } = payload;
  // Update readBy on matching messages, show "Seen" indicators
});
```

**Payload:**
```json
{
  "readBy": "664f...",
  "messageIds": ["664f...", "664f..."],
  "timestamp": "..."
}
```

**Room:** `chat:{conversationId}`

---

### `chat:typing` — Typing Indicator

```js
socket.on('chat:typing', (payload) => {
  const { userId, isTyping } = payload;
  // Show/hide "… is typing" indicator for this userId
});
```

**Payload:**
```json
{
  "userId": "664f...",
  "isTyping": true,
  "timestamp": "2026-04-21T10:05:00.000Z"
}
```

**Room:** `chat:{conversationId}` (emitted to everyone except the sender)

---

### `chat:conversation:updated` — Inbox Refresh

```js
socket.on('chat:conversation:updated', (payload) => {
  const conversation = payload.data;
  // Update the conversation list: set lastMessage, increment unread badge
});
```

**Payload:**
```json
{
  "data": {
    "_id": "664f...",
    "lastMessage": {
      "messageId": "...",
      "senderId": "...",
      "text": "Hey!",
      "contentType": "text",
      "createdAt": "2026-04-21T10:05:00.000Z"
    }
  },
  "timestamp": "..."
}
```

**Room:** `notifications:{userId}` (emitted to **every participant** after each message)

---

## 11. Pagination Guide

### Conversation List (Offset-based)

```js
const loadConversations = async (page = 1) => {
  const res = await fetch(`/v1/chat/conversations?page=${page}&limit=20`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const { data, total, totalPages } = await res.json();
  return { conversations: data, total, totalPages };
};
```

### Message List (Cursor-based — recommended for infinite scroll)

```js
const [messages, setMessages] = useState([]);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);

const loadInitialMessages = async (conversationId) => {
  const res = await fetch(`/v1/chat/conversations/${conversationId}/messages?limit=50`);
  const { data, hasMore: more } = await res.json();
  setMessages(data.reverse()); // API returns oldest-first; reverse for chat UI (newest at bottom)
  setHasMore(more);
};

const loadMoreMessages = async (conversationId) => {
  if (loading || !hasMore) return;
  setLoading(true);
  const oldestId = messages[0]._id;
  const res = await fetch(`/v1/chat/conversations/${conversationId}/messages?before=${oldestId}&limit=50`);
  const { data, hasMore: more } = await res.json();
  setMessages(prev => [...data.reverse(), ...prev]); // prepend older messages
  setHasMore(more);
  setLoading(false);
};
```

### Receiving new messages in real time

```js
socket.on('chat:message', (payload) => {
  setMessages(prev => [...prev, payload.data]);
  // Also update conversation preview in inbox list
});
```

---

## 12. Data Models

### Conversation

```typescript
interface Conversation {
  _id: string;
  participants: User[];      // exactly 2, populated with: firstName, lastName, loungeTitle, profileImage, type
  slug: string;              // stable key: [idA, idB].sort().join('_')
  lastMessage?: {
    messageId: string;
    senderId: string;
    text?: string;            // truncated to 80 chars
    contentType: 'text' | 'image' | 'file' | 'audio';
    createdAt: string;
  };
  unreadCounts: Array<{
    userId: string;
    count: number;
  }>;
  deletedFor: string[];      // user IDs who soft-deleted this conversation
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Message

```typescript
interface Message {
  _id: string;
  conversationId: string;
  senderId: User;            // populated: firstName, lastName, loungeTitle, profileImage, type
  contentType: 'text' | 'image' | 'file' | 'audio';
  text?: string;              // max 4000 chars
  attachment?: {
    url: string;              // Cloudflare R2 public URL
    publicId: string;         // R2 key
    mimeType?: string;
    fileName?: string;
    sizeBytes?: number;
  };
  replyTo?: {                 // populated parent message preview
    _id: string;
    text?: string;
    contentType: string;
    senderId: string;
    createdAt: string;
  };
  reactions: Array<{
    userId: string;
    emoji: string;
    createdAt: string;
  }>;
  readBy: Array<{
    userId: string;
    readAt: string;
  }>;
  deletedFor: string[];
  isDeleted: boolean;         // true = recalled for everyone
  editedAt?: string;          // set when sender edits
  createdAt: string;
  updatedAt: string;
}
```

### User (sender projection)

```typescript
// The senderId on messages is populated with these fields:
interface SenderSummary {
  _id: string;
  firstName?: string;
  lastName?: string;
  loungeTitle?: string;      // for lounge users
  profileImage?: string;
  type: 'client' | 'lounge' | 'admin' | 'agent';
}
```

---

## 13. Error Handling

All errors follow the same shape:

```json
{
  "success": false,
  "message": "Error description",
  "code": 403
}
```

### Common errors

| Status | When | Frontend action |
|--------|------|-----------------|
| 400 | Self-DM, missing text, invalid replyTo | Show validation message |
| 401 | Invalid/expired JWT | Redirect to login, refresh token |
| 403 | Mutual follow required | Show "You must follow each other to message" |
| 403 | Not sender (edit/recall) | Disable edit/recall buttons |
| 404 | Conversation/message not found | Remove from UI, show error toast |
| 429 | Rate limit on send (100/15min) | Show "Slow down" message, disable send briefly |

### Socket errors

| ACK error | Meaning | Action |
|-----------|---------|--------|
| `conversationId and token are required` | Missing payload | Ensure both fields are sent |
| `Invalid or expired token` | JWT issue | Re-authenticate |
| `Access denied` | Not a participant | Remove conversation from UI |
| `Internal error` | Server error | Retry after delay |

---

## 14. Frontend Implementation Checklist

### Phase 1: Conversation List
- [ ] Fetch conversations on app open (`GET /v1/chat/conversations`)
- [ ] Render conversation list with participant avatars, last message preview, unread badge
- [ ] Handle pagination (load more on scroll)
- [ ] Listen for `chat:conversation:updated` to update inbox in real time
- [ ] Navigate to conversation detail on tap

### Phase 2: Conversation Detail + Messages
- [ ] Join room on open (`chat:join`)
- [ ] Leave room on close (`chat:leave`)
- [ ] Fetch initial messages (`GET /v1/chat/conversations/:id/messages?limit=50`)
- [ ] Implement infinite scroll up (load more with `?before=<oldestId>`)
- [ ] Listen for `chat:message` to append new messages in real time
- [ ] Auto-scroll to bottom on new message if user is at bottom
- [ ] Mark messages as read on conversation open (`PATCH /v1/chat/conversations/:id/messages/read`)

### Phase 3: Sending Messages
- [ ] Text input with send button
- [ ] POST text message (`POST /v1/chat/conversations/:id/messages`)
- [ ] Image/file picker → multipart upload
- [ ] Show optimistic message in UI before server confirms
- [ ] Handle `403` mutual follow error gracefully
- [ ] Handle `429` rate limit with cooldown UI

### Phase 4: Real-Time Features
- [ ] Typing indicator: emit `chat:typing` on keystroke (debounced), listen for `chat:typing`
- [ ] Read receipts: listen for `chat:read`, update "Seen" indicators
- [ ] Reactions: long-press → emoji picker → POST reaction, listen for `chat:reaction`
- [ ] Message editing: swipe/tap → edit option → PATCH, listen for `chat:message:edited`
- [ ] Message deletion: swipe/tap → delete option → DELETE, listen for `chat:message:deleted`

### Phase 5: Search
- [ ] Search bar in conversation detail
- [ ] `GET /v1/chat/conversations/:id/messages/search?q=...`
- [ ] Highlight search terms in results

### Phase 6: Polish
- [ ] Push notification handling (FCM) for background messages
- [ ] Unread badge on conversation list + app icon
- [ ] Soft-delete conversation with swipe
- [ ] Reply-to / quote message UI
- [ ] "Edited" indicator on edited messages

---

## 15. Full Integration Example (React Native)

```tsx
import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config';

const BASE_URL = API_BASE_URL; // e.g. 'https://frame-backend-apis.onrender.com'

// ─── Socket singleton ───────────────────────────────────────────────
let socket: Socket | null = null;

export const getSocket = (token: string) => {
  if (!socket) {
    socket = io(BASE_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
    });
  }
  return socket;
};

// ─── Hook: Conversation List ────────────────────────────────────────
export const useConversations = (token: string) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const sock = getSocket(token);

  const fetchConversations = useCallback(async (p = 1) => {
    const res = await fetch(`${BASE_URL}/v1/chat/conversations?page=${p}&limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (p === 1) {
      setConversations(json.data);
    } else {
      setConversations(prev => [...prev, ...json.data]);
    }
    setTotal(json.total);
    setPage(p);
  }, [token]);

  // Real-time inbox updates
  useEffect(() => {
    sock.on('chat:conversation:updated', (payload) => {
      const updated = payload.data;
      setConversations(prev => {
        const idx = prev.findIndex(c => c._id === updated._id);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], lastMessage: updated.lastMessage };
        // Move to top
        const [item] = next.splice(idx, 1);
        next.unshift(item);
        return next;
      });
    });
    return () => { sock.off('chat:conversation:updated'); };
  }, []);

  return { conversations, total, page, fetchConversations };
};

// ─── Hook: Chat Messages ────────────────────────────────────────────
export const useChatMessages = (conversationId: string, token: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const sock = getSocket(token);

  // Join room + load initial messages
  useEffect(() => {
    sock.emit('chat:join', { conversationId, token: `Bearer ${token}` }, (ack: any) => {
      if (!ack.ok) console.error('Join failed:', ack.error);
    });

    fetch(`${BASE_URL}/v1/chat/conversations/${conversationId}/messages?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => {
        setMessages(json.data.reverse());
        setHasMore(json.hasMore);
      });

    return () => {
      sock.emit('chat:leave', { conversationId });
    };
  }, [conversationId, token]);

  // Real-time: new message
  useEffect(() => {
    const handler = (payload: any) => {
      setMessages(prev => [...prev, payload.data]);
    };
    sock.on('chat:message', handler);
    return () => { sock.off('chat:message', handler); };
  }, []);

  // Real-time: message edited
  useEffect(() => {
    const handler = (payload: any) => {
      const updated = payload.data;
      setMessages(prev => prev.map(m => m._id === updated._id ? { ...m, ...updated } : m));
    };
    sock.on('chat:message:edited', handler);
    return () => { sock.off('chat:message:edited', handler); };
  }, []);

  // Real-time: message deleted
  useEffect(() => {
    const handler = (payload: any) => {
      setMessages(prev => prev.filter(m => m._id !== payload.messageId));
    };
    sock.on('chat:message:deleted', handler);
    return () => { sock.off('chat:message:deleted', handler); };
  }, []);

  // Real-time: reactions
  useEffect(() => {
    const handler = (payload: any) => {
      setMessages(prev => prev.map(m =>
        m._id === payload.messageId ? { ...m, reactions: payload.reactions } : m
      ));
    };
    sock.on('chat:reaction', handler);
    return () => { sock.off('chat:reaction', handler); };
  }, []);

  // Load more (scroll up)
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || messages.length === 0) return;
    setLoading(true);
    const oldestId = messages[0]._id;
    const res = await fetch(
      `${BASE_URL}/v1/chat/conversations/${conversationId}/messages?before=${oldestId}&limit=50`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const json = await res.json();
    setMessages(prev => [...json.data.reverse(), ...prev]);
    setHasMore(json.hasMore);
    setLoading(false);
  }, [conversationId, token, loading, hasMore, messages]);

  // Send message
  const sendMessage = useCallback(async (text: string) => {
    const res = await fetch(`${BASE_URL}/v1/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-csrf-token': await getCsrfToken(),
      },
      body: JSON.stringify({ contentType: 'text', text }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message);
    }
  }, [conversationId, token]);

  // Mark as read
  const markAsRead = useCallback(async () => {
    await fetch(`${BASE_URL}/v1/chat/conversations/${conversationId}/messages/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-csrf-token': await getCsrfToken(),
      },
      body: JSON.stringify({}),
    });
  }, [conversationId, token]);

  return { messages, hasMore, loading, loadMore, sendMessage, markAsRead };
};

// ─── Hook: Typing Indicator ─────────────────────────────────────────
export const useTypingIndicator = (conversationId: string, token: string) => {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const sock = getSocket(token);
  const throttleRef = useRef(0);

  const emitTyping = useCallback(() => {
    const now = Date.now();
    if (now - throttleRef.current < 2000) return; // Client-side debounce
    throttleRef.current = now;
    sock.emit('chat:typing', { conversationId, isTyping: true });
  }, [conversationId]);

  const emitStopTyping = useCallback(() => {
    sock.emit('chat:typing', { conversationId, isTyping: false });
  }, [conversationId]);

  useEffect(() => {
    const handler = (payload: any) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        if (payload.isTyping) next.add(payload.userId);
        else next.delete(payload.userId);
        return next;
      });
    };
    sock.on('chat:typing', handler);
    return () => { sock.off('chat:typing', handler); };
  }, []);

  return { typingUsers, emitTyping, emitStopTyping };
};
```

---

## Quick Reference Card

```
REST BASE:  /v1/chat
AUTH:       Authorization: Bearer <token>
CSRF:       x-csrf-token: <csrf>  (on POST/PATCH/DELETE)

CONVERSATIONS
  POST   /conversations                          → find or create DM
  GET    /conversations                          → list my conversations
  GET    /conversations/:id                      → get single conversation
  DELETE /conversations/:id                      → soft-delete (my inbox only)

MESSAGES
  GET    /conversations/:id/messages             → get messages (cursor or offset)
  POST   /conversations/:id/messages             → send message (JSON or multipart)
  PATCH  /conversations/:id/messages/read        → mark as read
  PATCH  /conversations/:id/messages/:msgId      → edit text (15 min window)
  DELETE /conversations/:id/messages/:msgId      → delete / recall
  POST   /conversations/:id/messages/:msgId/reactions → toggle emoji reaction

SEARCH & MISC
  GET    /conversations/:id/messages/search?q=   → full-text search
  POST   /conversations/:id/typing               → REST typing proxy

SOCKET.IO EVENTS (client → server)
  chat:join      { conversationId, token }       → ACK: { ok } | { error }
  chat:leave     { conversationId }
  chat:typing    { conversationId, isTyping }

SOCKET.IO EVENTS (server → client)
  chat:message                { data: Message }
  chat:message:edited         { data: Message }
  chat:message:deleted        { messageId, recalledForAll }
  chat:reaction               { messageId, userId, emoji, reactions }
  chat:read                   { readBy, messageIds }
  chat:typing                 { userId, isTyping, timestamp }
  chat:conversation:updated   { data: { _id, lastMessage } }
```
