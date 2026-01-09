/**
 * Document model matching backend API response
 * Response example:
 * {
 *   "id": 1,
 *   "title": "Angular Guide",
 *   "summary": "Complete Angular tutorial",
 *   "content": null,
 *   "filePath": "ff9d263b-ec0f-4b2f-a6d6-7f0cc071f51a.png",
 *   "fileName": "angular-guide.pdf",
 *   "fileType": "IMAGE",
 *   "fileSize": 112993,
 *   "sharingLevel": "PUBLIC",
 *   "versionNumber": 1,
 *   "isArchived": false,
 *   "ownerId": 1,
 *   "ownerUsername": "admin",
 *   "ownerEmail": "admin@example.com",
 *   "averageRating": 5.0,
 *   "ratingCount": 1,
 *   "totalRatings": 1,
 *   "downloadCount": 45,
 *   "isFavorited": true,
 *   "createdAt": "2025-12-17T01:07:23.288084",
 *   "updatedAt": "2025-12-17T01:07:23.288084",
 *   "tags": ["Angular", "Frontend"],
 *   "groupIds": []
 * }
 */
export interface DocumentModel {
  id: number;
  title: string;
  summary: string;
  content?: string | null;
  filePath: string;
  fileName?: string;
  fileType: string;
  fileSize: number;
  sharingLevel: 'PUBLIC' | 'PRIVATE' | 'GROUP';
  versionNumber: number;
  isArchived: boolean;
  ownerId: number;
  ownerUsername: string;
  ownerEmail?: string;
  averageRating: number;
  ratingCount: number;
  totalRatings?: number;
  downloadCount?: number;
  isFavorited?: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  groupIds: number[];
  semanticScore?: number; // AI similarity score (0.0-1.0) - only for semantic search results
}

/**
 * Request body for creating a document
 * Note: Sent as FormData with 'data' (JSON string) and 'file' (File object)
 */
export interface DocumentCreateRequest {
  title: string;
  summary: string;
  tags: string[];
  sharingLevel: 'PUBLIC' | 'PRIVATE' | 'GROUP';
}

/**
 * Request body for updating a document
 */
export interface DocumentUpdateRequest {
  title?: string;
  summary?: string;
  tags?: string[];
  sharingLevel?: 'PUBLIC' | 'PRIVATE' | 'GROUP';
}

// Alias for backward compatibility
export type Document = DocumentModel;

/**
 * Document version history
 */
export interface DocumentVersion {
  id: number;
  documentId: number;
  versionNumber: number;
  filePath: string;
  updatedBy: string;
  updatedAt: string;
  changeNotes: string;
}

/**
 * Group for document sharing
 */
export interface Group {
  id: number;
  name: string;
  description?: string;
}
