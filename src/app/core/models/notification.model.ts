/**
 * Notification interface - matches Backend API response
 * Based on API-CONTRACT-NOTIFICATION.md
 */
export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  documentId: number | null;
  documentTitle: string | null;
  createdAt: string; // ISO 8601 date format
}

/**
 * Response for unread count
 * GET /api/notifications/unread/count
 */
export interface NotificationCountResponse {
  count: number;
}

/**
 * Generic message response from notification APIs
 */
export interface MessageResponse {
  message: string;
}
