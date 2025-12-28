/**
 * Favorite interface representing a saved/bookmarked document
 * Matches Backend API response structure
 */
export interface Favorite {
  id: number;
  documentId: number;
  documentTitle: string;
  documentSummary: string;
  ownerUsername: string;
  averageRating: number;
  createdAt: string; // ISO date string from backend
}

/**
 * Response for check if favorited
 */
export interface FavoriteCheckResponse {
  isFavorited: boolean;
}

/**
 * Response for favorite count
 */
export interface FavoriteCountResponse {
  count: number;
}
