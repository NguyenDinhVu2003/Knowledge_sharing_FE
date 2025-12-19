/**
 * Generic paged response interface for paginated API responses
 */
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * Generic API response interface
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string;
}
