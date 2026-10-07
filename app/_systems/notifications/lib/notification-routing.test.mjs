import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { test } from "node:test"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const notificationTypes = {
  BOOKING_CREATED: "booking:created",
  BOOKING_CONFIRMED: "booking:confirmed",
  BOOKING_CANCELLED: "booking:cancelled",
  BOOKING_IN_QUEUE: "booking:inQueue",
  BOOKING_COMPLETED: "booking:completed",
  BOOKING_ABSENT: "booking:absent",
  QUEUE_IN_SERVICE: "queue:inService",
  QUEUE_AUTO_CANCELLED: "queue:autoCancelled",
  QUEUE_BACK_IN_QUEUE: "queue:backInQueue",
  QUEUE_REMINDER: "queue:reminder",
  QUEUE_POSITION_CHANGED: "queue:positionChanged",
  POST_LIKED: "content:postLiked",
  POST_COMMENTED: "content:postCommented",
  REEL_LIKED: "content:reelLiked",
  REEL_COMMENTED: "content:reelCommented",
  COMMENT_REPLIED: "content:commentReplied",
  COMMENT_LIKED: "content:commentLiked",
  NEW_FOLLOWER: "social:newFollower",
  LOUNGE_LIKED: "social:loungeLiked",
  LOUNGE_RATED: "social:loungeRated",
  AGENT_LIKED: "social:agentLiked",
  AGENT_RATED: "social:agentRated",
  SUGGESTION_CREATED: "admin:suggestionCreated",
  SUGGESTION_APPROVED: "admin:suggestionApproved",
  SUGGESTION_REJECTED: "admin:suggestionRejected",
  CONTENT_HIDDEN: "admin:contentHidden",
  PRODUCT_CATEGORY_SUGGESTION_CREATED: "admin:productCategorySuggestionCreated",
  PRODUCT_CATEGORY_SUGGESTION_APPROVED: "admin:productCategorySuggestionApproved",
  PRODUCT_CATEGORY_SUGGESTION_REJECTED: "admin:productCategorySuggestionRejected",
  CHAT_MESSAGE: "chat:message",
}

const sourcePath = fileURLToPath(
  new URL("./notification-routing.ts", import.meta.url),
)
const source = await readFile(sourcePath, "utf8")
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})
const routingModule = { exports: {} }
const localRequire = createRequire(import.meta.url)
new Function("require", "module", "exports", outputText)(
  (name) => {
    if (name === "@/app/_types") return { NotificationType: notificationTypes }
    return localRequire(name)
  },
  routingModule,
  routingModule.exports,
)

const { getRedirectPath, resolveRouteFromFCM } = routingModule.exports
const sample = {
  _id: "notification",
  userId: "recipient",
  title: "Notification",
  body: "",
  category: "",
  isRead: false,
  createdAt: "",
  updatedAt: "",
}

const cases = [
  ["BOOKING_CREATED", { bookingId: "booking1" }, "/bookings?highlight=booking1"],
  ["BOOKING_CONFIRMED", { bookingId: "booking1" }, "/bookings?highlight=booking1"],
  ["BOOKING_CANCELLED", { bookingId: "booking1" }, "/bookings?view=history&highlight=booking1"],
  ["BOOKING_IN_QUEUE", { bookingId: "booking1", loungeId: "lounge1" }, "/lounges/lounge1?tab=queue&bookingId=booking1"],
  ["BOOKING_COMPLETED", { bookingId: "booking1" }, "/bookings?view=history&highlight=booking1"],
  ["BOOKING_ABSENT", { bookingId: "booking1" }, "/bookings?view=history&highlight=booking1"],
  ["QUEUE_IN_SERVICE", { bookingId: "booking1", loungeId: "lounge1" }, "/lounges/lounge1?tab=queue&bookingId=booking1"],
  ["QUEUE_AUTO_CANCELLED", { bookingId: "booking1" }, "/bookings?view=history&highlight=booking1"],
  ["QUEUE_BACK_IN_QUEUE", { bookingId: "booking1", loungeId: "lounge1" }, "/lounges/lounge1?tab=queue&bookingId=booking1"],
  ["QUEUE_REMINDER", { bookingId: "booking1", loungeId: "lounge1" }, "/lounges/lounge1?tab=queue&bookingId=booking1"],
  ["QUEUE_POSITION_CHANGED", { bookingId: "booking1", loungeId: "lounge1" }, "/lounges/lounge1?tab=queue&bookingId=booking1"],
  ["POST_LIKED", { postId: "post1" }, "/home?focusPost=post1"],
  ["POST_COMMENTED", { postId: "post1", commentId: "comment1" }, "/home?focusPost=post1&openComments=post1&commentId=comment1"],
  ["REEL_LIKED", { reelId: "reel1" }, "/reels?id=reel1"],
  ["REEL_COMMENTED", { reelId: "reel1", commentId: "comment1" }, "/reels?id=reel1&openComments=true&commentId=comment1"],
  ["COMMENT_REPLIED", { postId: "post1", commentId: "comment1" }, "/home?focusPost=post1&openComments=post1&commentId=comment1"],
  ["COMMENT_LIKED", { reelId: "reel1", commentId: "comment1" }, "/reels?id=reel1&openComments=true&commentId=comment1"],
  ["NEW_FOLLOWER", { followerId: "person1", actorType: "client" }, "/clients/person1"],
  ["LOUNGE_LIKED", { actorId: "person1", actorType: "agent", loungeId: "lounge1" }, "/agents/person1"],
  ["LOUNGE_RATED", { actorId: "person1", actorType: "lounge", loungeId: "lounge1" }, "/lounges/person1"],
  ["AGENT_LIKED", { actorId: "person1", actorType: "client", agentId: "agent1" }, "/clients/person1"],
  ["AGENT_RATED", { actorId: "person1", actorType: "agent", agentId: "agent1" }, "/agents/person1"],
  ["SUGGESTION_CREATED", { suggestionId: "suggestion1" }, "/admin/suggestions"],
  ["SUGGESTION_APPROVED", { suggestionId: "suggestion1" }, "/lounge/servicemanagement"],
  ["SUGGESTION_REJECTED", { suggestionId: "suggestion1" }, "/lounge/servicemanagement"],
  ["CONTENT_HIDDEN", { postId: "post1" }, "/home?focusPost=post1"],
  ["PRODUCT_CATEGORY_SUGGESTION_CREATED", { suggestionId: "suggestion1" }, "/admin/categories"],
  ["PRODUCT_CATEGORY_SUGGESTION_APPROVED", { suggestionId: "suggestion1" }, "/store/my-store/suggestions"],
  ["PRODUCT_CATEGORY_SUGGESTION_REJECTED", { suggestionId: "suggestion1" }, "/store/my-store/suggestions"],
  ["CHAT_MESSAGE", { conversationId: "conversation1" }, "/messages/conversation1"],
]

for (const [typeName, metadata, expected] of cases) {
  test(`${typeName} resolves to an existing app route`, () => {
    const route = getRedirectPath({
      ...sample,
      type: notificationTypes[typeName],
      metadata,
    })
    assert.equal(route, expected)
    const pathname = new URL(route, "https://frame.test").pathname
    assert.ok(
      /^\/(?:bookings|(?:agents|clients|lounges)\/[^/]+|home|reels|admin(?:\/categories|\/suggestions)?|lounge\/servicemanagement|store\/my-store\/suggestions|messages(?:\/[^/]+)?)$/.test(
        pathname,
      ),
      `Unexpected or unimplemented route: ${pathname}`,
    )
  })
}

test("legacy broken action URLs are normalized to existing routes", () => {
  const cases = [
    ["/posts/post1", "/home?focusPost=post1"],
    ["/reels/reel1", "/reels?id=reel1"],
    ["/bookings/booking1", "/bookings?highlight=booking1"],
    ["/admin/suggestions/suggestion1", "/admin/suggestions"],
    ["/admin/marketplace/category-suggestions/suggestion1", "/admin/categories"],
    ["/marketplace/category-suggestions/suggestion1", "/store/my-store/suggestions"],
    ["/lounge/services", "/lounge/servicemanagement"],
    ["/lounge/suggestions", "/lounge/servicemanagement"],
    ["/chat/conversation1", "/messages/conversation1"],
    ["/profile/person1", "/notifications"],
  ]
  for (const [actionUrl, expected] of cases) {
    assert.equal(
      getRedirectPath({ ...sample, type: "legacy:unknown", actionUrl }),
      expected,
    )
  }
})

test("FCM social notifications use actor type to navigate directly", () => {
  assert.equal(
    resolveRouteFromFCM({
      type: notificationTypes.NEW_FOLLOWER,
      followerId: "person1",
      actorId: "person1",
      actorType: "agent",
      actionUrl: "/agents/person1",
    }),
    "/agents/person1",
  )
})

test("FCM content notifications open their exact post, reel, or comment target", () => {
  assert.equal(
    resolveRouteFromFCM({
      type: notificationTypes.POST_LIKED,
      postId: "post1",
    }),
    "/home?focusPost=post1",
  )
  assert.equal(
    resolveRouteFromFCM({
      type: notificationTypes.REEL_COMMENTED,
      reelId: "reel1",
      commentId: "comment1",
      targetType: "reel",
    }),
    "/reels?id=reel1&openComments=true&commentId=comment1",
  )
})

test("social notifications without a profile type do not probe profile APIs", () => {
  assert.equal(
    getRedirectPath({
      ...sample,
      type: notificationTypes.NEW_FOLLOWER,
      metadata: { followerId: "person1" },
      actionUrl: "/profile/person1",
    }),
    "/notifications",
  )
})
