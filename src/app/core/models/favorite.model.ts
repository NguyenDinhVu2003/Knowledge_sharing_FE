import { Document } from './document.model';

/**
 * Favorite interface representing a saved/bookmarked document
 */
export interface Favorite {
  id: number;
  documentId: number;
  userId: number;
  createdAt: Date;
  document?: Document; // Populated document details from backend
}
