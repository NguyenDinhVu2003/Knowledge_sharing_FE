/**
 * Comment Model - Based on API Contract
 */
export interface Comment {
  id: number;
  content: string;
  documentId: number;
  userId: number;
  username: string;
  parentCommentId: number | null;
  likeCount: number;
  replyCount: number;
  isLikedByCurrentUser: boolean;
  isOwnedByCurrentUser: boolean;
  isEdited: boolean;
  createdAt: string;  // ISO date string
  updatedAt: string;  // ISO date string
  replies?: Comment[];  // Optional nested replies
}

export interface CreateCommentRequest {
  content: string;  // Required, max 2000 chars
  parentCommentId?: number | null;  // Optional, for replies
}

export interface UpdateCommentRequest {
  content: string;  // Required, max 2000 chars
}

export interface CommentPage {
  content: Comment[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface CommentCount {
  count: number;
}

export interface LikeResponse {
  isLiked: boolean;
}
