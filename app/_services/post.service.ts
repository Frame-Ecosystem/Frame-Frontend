import { apiClient } from "./api"
import {
  Post,
  CreatePostInput,
  CreateCommentInput,
  LikePostInput,
  LikeCommentInput,
  Paginated,
} from "../_types"

// Mock data for development
const mockUsers = [
  {
    id: "1",
    _id: "1",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    profileImage: undefined,
    type: "client" as const,
  },
  {
    id: "2",
    _id: "2",
    email: "sarah@example.com",
    firstName: "Sarah",
    lastName: "Smith",
    profileImage: undefined,
    type: "lounge" as const,
    loungeTitle: "Beauty Lounge Pro",
  },
  {
    id: "3",
    _id: "3",
    email: "mike@example.com",
    firstName: "Mike",
    lastName: "Johnson",
    profileImage: undefined,
    type: "client" as const,
  },
]

const mockPosts: Post[] = [
  {
    _id: "1",
    id: "1",
    author: mockUsers[0],
    content:
      "Just had an amazing haircut at my local salon! The stylist was so professional and the atmosphere was perfect. Highly recommend checking out local beauty services! 💇‍♂️✨",
    images: [],
    likes: ["2", "3"],
    comments: [
      {
        _id: "1",
        id: "1",
        author: mockUsers[1],
        content:
          "Thanks for the recommendation! I'll definitely check them out.",
        likes: ["1"],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "2",
    id: "2",
    author: mockUsers[1],
    content:
      "Excited to announce that we've expanded our services! Now offering premium spa treatments and wellness packages. Book your appointment today! 🧖‍♀️💆‍♀️",
    images: ["/images/frameLight.png"],
    likes: ["1", "3"],
    comments: [],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "3",
    id: "3",
    author: mockUsers[2],
    content:
      "Looking for recommendations for a good massage place in the city. Any suggestions from the community?",
    images: [],
    likes: ["1"],
    comments: [
      {
        _id: "2",
        id: "2",
        author: mockUsers[1],
        content:
          "I highly recommend our lounge! We have certified massage therapists and use only premium oils. DM me for booking details! 😊",
        likes: ["3"],
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
]

export class PostService {
  // Get all posts with pagination
  static async getPosts(page = 1, limit = 20): Promise<Paginated<Post>> {
    try {
      const response = await apiClient.get<Paginated<Post>>(
        `/v1/posts?page=${page}&limit=${limit}`,
      )
      return response
    } catch {
      // Return mock data if API is not available
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedPosts = mockPosts.slice(startIndex, endIndex)

      return {
        data: paginatedPosts,
        total: mockPosts.length,
        page,
        limit,
      }
    }
  }

  // Get posts by user ID
  static async getUserPosts(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<Paginated<Post>> {
    try {
      const response = await apiClient.get<Paginated<Post>>(
        `/v1/posts/user/${userId}?page=${page}&limit=${limit}`,
      )
      return response
    } catch {
      // Return mock data filtered by user
      const userPosts = mockPosts.filter((post) => post.author._id === userId)
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedPosts = userPosts.slice(startIndex, endIndex)

      return {
        data: paginatedPosts,
        total: userPosts.length,
        page,
        limit,
      }
    }
  }

  // Create a new post
  static async createPost(data: CreatePostInput): Promise<Post> {
    try {
      const formData = new FormData()
      formData.append("content", data.content)

      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append(`images`, image)
        })
      }

      const response = await apiClient.post<Post>("/v1/posts", formData)
      return response
    } catch {
      // Simulate creating a post with mock data
      const newPost: Post = {
        _id: Date.now().toString(),
        id: Date.now().toString(),
        author: mockUsers[0], // Use first mock user as current user
        content: data.content,
        images: data.images
          ? data.images.map(() => "/images/placeholder.jpg")
          : [],
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Add to mock posts (in a real app, this would be persisted)
      mockPosts.unshift(newPost)

      return newPost
    }
  }

  // Like/Unlike a post
  static async toggleLikePost(data: LikePostInput): Promise<Post> {
    try {
      const response = await apiClient.post<Post>(
        `/v1/posts/${data.postId}/like`,
      )
      return response
    } catch {
      // Simulate liking a post
      const post = mockPosts.find((p) => p.id === data.postId)
      if (post) {
        const userId = "1" // Mock current user ID
        const likeIndex = post.likes.indexOf(userId)
        if (likeIndex > -1) {
          post.likes.splice(likeIndex, 1)
        } else {
          post.likes.push(userId)
        }
        return post
      }
      throw new Error("Post not found")
    }
  }

  // Add comment to a post
  static async addComment(data: CreateCommentInput): Promise<Post> {
    try {
      const commentResponse = await apiClient.post<Post>(
        `/v1/posts/${data.postId}/comments`,
        {
          content: data.content,
        },
      )
      return commentResponse
    } catch {
      // Simulate adding a comment
      const post = mockPosts.find((p) => p.id === data.postId)
      if (post) {
        const newComment = {
          _id: Date.now().toString(),
          id: Date.now().toString(),
          author: mockUsers[0], // Mock current user
          content: data.content,
          likes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        post.comments.push(newComment)
        return post
      }
      throw new Error("Post not found")
    }
  }

  // Like/Unlike a comment
  static async toggleLikeComment(data: LikeCommentInput): Promise<Post> {
    try {
      const response = await apiClient.post<Post>(
        `/v1/posts/${data.commentId}/like-comment`,
      )
      return response
    } catch {
      // Simulate liking a comment
      const post = mockPosts.find((p) =>
        p.comments.some((c) => c.id === data.commentId),
      )
      if (post) {
        const comment = post.comments.find((c) => c.id === data.commentId)
        if (comment) {
          const userId = "1" // Mock current user ID
          const likeIndex = comment.likes.indexOf(userId)
          if (likeIndex > -1) {
            comment.likes.splice(likeIndex, 1)
          } else {
            comment.likes.push(userId)
          }
          return post
        }
      }
      throw new Error("Comment not found")
    }
  }

  // Delete a post (only by author)
  static async deletePost(postId: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/posts/${postId}`)
    } catch {
      // Simulate deleting a post
      const postIndex = mockPosts.findIndex((p) => p.id === postId)
      if (postIndex > -1) {
        mockPosts.splice(postIndex, 1)
      }
    }
  }

  // Delete a comment (only by author)
  static async deleteComment(commentId: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/posts/comments/${commentId}`)
    } catch {
      // Simulate deleting a comment
      const post = mockPosts.find((p) =>
        p.comments.some((c) => c.id === commentId),
      )
      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentId)
        if (commentIndex > -1) {
          post.comments.splice(commentIndex, 1)
        }
      }
    }
  }
}
