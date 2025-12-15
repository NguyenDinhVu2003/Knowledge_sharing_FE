export interface Notification {
  id: number;
  user_id: number;
  document_id: number;
  message: string;
  is_read: boolean;
  created_at: Date;
}

export interface NotificationCreateRequest {
  user_id: number;
  document_id: number;
  message: string;
}

export interface NotificationUpdateRequest {
  is_read: boolean;
}
