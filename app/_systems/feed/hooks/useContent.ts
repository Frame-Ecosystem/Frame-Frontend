/**
 * Re-export all content-related hooks from their domain-specific files.
 * This barrel keeps backward-compatibility — existing imports from
 * "useContent" continue to work without changes.
 */

export { contentKeys } from "./content-keys"
export {
  extractPagination,
  isRateLimitError,
  updateFeedItemOptimistic,
  RATE_LIMIT_COOLDOWN,
} from "./content-keys"

// Feeds
export {
  useFollowingFeed,
  useExploreFeed,
  useSavedFeed,
  useHashtagFeed,
} from "./useFeeds"

// Posts
export {
  usePost,
  useUserPosts,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  useTogglePostLike,
  useTogglePostSave,
} from "./usePosts"

// Reels
export {
  useReel,
  useUserReels,
  useLoungeReels,
  useCreateReel,
  useUpdateReel,
  useDeleteReel,
  useToggleReelLike,
  useToggleReelSave,
} from "./useReels"

// Comments
export {
  useComments,
  useReplies,
  useAddComment,
  useDeleteComment,
  useToggleCommentLike,
} from "./useComments"

// Hashtags
export { useTrendingHashtags, useSearchHashtags } from "./useHashtags"

// Reports
export { useCreateReport, useReports, useReviewReport } from "./useReports"

// Admin content actions
export {
  useAdminHidePost,
  useAdminUnhidePost,
  useAdminDeletePost,
  useAdminHideReel,
  useAdminUnhideReel,
  useAdminDeleteReel,
  useAdminHideComment,
  useAdminUnhideComment,
  useAdminDeleteComment,
} from "@/app/_systems/admin/hooks/useAdminContent"
