// Social media / post types

import type { User } from "./user"

export interface Post {
  _id: string
  id: string
  author: User
  content: string
  images?: string[]
  likes: string[]
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

export interface Comment {
  _id: string
  id: string
  author: User
  content: string
  likes: string[]
  createdAt: string
  updatedAt: string
}

export interface CreatePostInput {
  content: string
  images?: File[]
}

export interface CreateCommentInput {
  postId: string
  content: string
}

export interface LikePostInput {
  postId: string
}

export interface LikeCommentInput {
  commentId: string
}
