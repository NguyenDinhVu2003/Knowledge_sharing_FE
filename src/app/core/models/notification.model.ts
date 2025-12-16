import { Document } from './document.model';

export interface Notification {
  id: number;
  userId: number;
  documentId: number;
  message: string;
  isRead: boolean;
  createdAt: Date;
  document?: Document; // Optional populated document info
}

export enum NotificationType {
  NEW_DOCUMENT = 'NEW_DOCUMENT',           // New doc matches user interests
  DOCUMENT_UPDATE = 'DOCUMENT_UPDATE',      // Favorited doc updated
  DOCUMENT_RATING = 'DOCUMENT_RATING',      // User's doc was rated
  DOCUMENT_COMMENT = 'DOCUMENT_COMMENT'     // User's doc received comment (future)
}

export interface NotificationCreateRequest {
  user_id: number;
  document_id: number;
  message: string;
}

export interface NotificationUpdateRequest {
  is_read: boolean;
}
