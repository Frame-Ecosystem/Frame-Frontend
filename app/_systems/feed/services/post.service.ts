import { apiClient } from "@/app/_core/api/api"
import type {
  Post,
  UpdatePostInput,
  PaginatedContentResponse,
  SingleContentResponse,
} from "@/app/_types"

class PostServiceClass {
  /** Create a new post (multipart/form-data) */
  async createPost(input: {
    text?: string
    media?: File[]
    hashtags?: string[]
  }): Promise<Post> {
    const formData = new FormData()
    if (input.text) formData.append("text", input.text)
    if (input.hashtags?.length) {
      formData.append("hashtags", JSON.stringify(input.hashtags))
    }
    if (input.media?.length) {
      input.media.forEach((file) => formData.append("media", file))
    }
    const res = await apiClient.post<SingleContentResponse<Post>>(
      "/v1/posts",
      formData,
    )
    return res.data
  }

  /** Get a single post */
  async getPost(postId: string): Promise<Post> {
    const res = await apiClient.get<SingleContentResponse<Post>>(
      `/v1/posts/${postId}`,
    )
    return res.data
  }

  /** Get a user's posts (paginated) */
  async getUserPosts(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedContentResponse<Post>> {
    return apiClient.get<PaginatedContentResponse<Post>>(
      `/v1/posts/user/${userId}?page=${page}&limit=${limit}`,
    )
  }

  /** Update post text/hashtags (owner only) */
  async updatePost(postId: string, data: UpdatePostInput): Promise<Post> {
    const res = await apiClient.put<SingleContentResponse<Post>>(
      `/v1/posts/${postId}`,
      data,
    )
    return res.data
  }

  /** Delete own post */
  async deletePost(postId: string): Promise<void> {
    await apiClient.delete(`/v1/posts/${postId}`)
  }

  /** Toggle like on a post */
  async toggleLike(postId: string): Promise<{ liked: boolean }> {
    const res = await apiClient.post<{ data: { liked: boolean } }>(
      `/v1/posts/${postId}/like`,
    )
    return res.data
  }

  /** Toggle save/bookmark on a post */
  async toggleSave(postId: string): Promise<{ saved: boolean }> {
    const res = await apiClient.post<{ data: { saved: boolean } }>(
      `/v1/posts/${postId}/save`,
    )
    return res.data
  }

  /* ── Admin ── */

  async hidePost(postId: string): Promise<Post> {
    const res = await apiClient.put<SingleContentResponse<Post>>(
      `/v1/posts/${postId}/hide`,
    )
    return res.data
  }

  async unhidePost(postId: string): Promise<Post> {
    const res = await apiClient.put<SingleContentResponse<Post>>(
      `/v1/posts/${postId}/unhide`,
    )
    return res.data
  }

  async adminDeletePost(postId: string): Promise<void> {
    await apiClient.delete(`/v1/posts/${postId}/admin`)
  }
}

export const postService = new PostServiceClass()

// Keep named export for backwards compat
export const PostService = {
  getPosts: (page: number, limit: number) =>
    postService.getUserPosts("", page, limit),
  getUserPosts: (userId: string, page: number, limit: number) =>
    postService.getUserPosts(userId, page, limit),
  createPost: (data: { text?: string; media?: File[]; hashtags?: string[] }) =>
    postService.createPost(data),
  deletePost: (postId: string) => postService.deletePost(postId),
  toggleLikePost: ({ postId }: { postId: string }) =>
    postService.toggleLike(postId),
}
