/**
 * Group Models - Các interface cho Group API
 * Created: February 1, 2026
 * Note: Group và MessageResponse đã được định nghĩa trong document.model và notification.model
 */

/**
 * Request body khi tạo hoặc cập nhật group
 */
export interface GroupRequest {
  name: string;          // Required, max 100 characters, must be unique
  description?: string;  // Optional, max 500 characters
  userIds?: number[];    // Optional, list of member user IDs
}

/**
 * Response data từ Group API
 */
export interface GroupResponse {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  documentCount: number;
  memberUsernames: string[];
  createdAt: string;     // ISO 8601 format: "2026-02-01T10:30:00"
  updatedAt: string;     // ISO 8601 format: "2026-02-01T10:30:00"
}

/**
 * User-Group relationship data
 */
export interface UserGroupInfo {
  userId: number;
  username: string;
  email: string;
  groups: GroupResponse[];
}
