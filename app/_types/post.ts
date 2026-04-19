// Re-export content types for backwards compatibility
// All post/reel/comment types now live in content.ts
export type {
  Post,
  Reel,
  Comment,
  FeedItem,
  PostMedia,
  AuthorSummary,
  Hashtag,
  Report,
  CreatePostInput,
  UpdatePostInput,
  CreateReelInput,
  UpdateReelInput,
  CreateCommentInput,
  CreateReportInput,
  ReviewReportInput,
  PaginatedContentResponse,
  SingleContentResponse,
  ContentPagination,
} from "./content"

export { ContentType, AuthorType, ReportStatus } from "./content"
