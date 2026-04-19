import { apiClient } from "@/app/_core/api/api"
import type {
  Comment,
  CreateCommentInput,
  PaginatedContentResponse,
  SingleContentResponse,
} from "@/app/_types"

class CommentServiceClass {
  /** Add a comment (or reply) to a post or reel */
  async addComment(
    targetType: "post" | "reel",
    targetId: string,
    data: CreateCommentInput,
  ): Promise<Comment> {
    const res = await apiClient.post<SingleContentResponse<Comment>>(
      `/v1/comments/${targetType}/${targetId}`,
      data,
    )
    return res.data
  }

  /** List top-level comments on a post or reel */
  async getComments(
    targetType: "post" | "reel",
    targetId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedContentResponse<Comment>> {
    return apiClient.get<PaginatedContentResponse<Comment>>(
      `/v1/comments/${targetType}/${targetId}?page=${page}&limit=${limit}`,
    )
  }

  /** List replies to a comment */
  async getReplies(
    commentId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedContentResponse<Comment>> {
    return apiClient.get<PaginatedContentResponse<Comment>>(
      `/v1/comments/${commentId}/replies?page=${page}&limit=${limit}`,
    )
  }

  /** Delete own comment */
  async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(`/v1/comments/${commentId}`)
  }

  /** Toggle like on a comment */
  async toggleLike(commentId: string): Promise<{ liked: boolean }> {
    const res = await apiClient.post<{ data: { liked: boolean } }>(
      `/v1/comments/${commentId}/like`,
    )
    return res.data
  }

  /* ── Admin ── */

  async hideComment(commentId: string): Promise<Comment> {
    const res = await apiClient.put<SingleContentResponse<Comment>>(
      `/v1/comments/${commentId}/hide`,
    )
    return res.data
  }

  async unhideComment(commentId: string): Promise<Comment> {
    const res = await apiClient.put<SingleContentResponse<Comment>>(
      `/v1/comments/${commentId}/unhide`,
    )
    return res.data
  }

  async adminDeleteComment(commentId: string): Promise<void> {
    await apiClient.delete(`/v1/comments/${commentId}/admin`)
  }
}

export const commentService = new CommentServiceClass()
