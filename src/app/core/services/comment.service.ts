import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Comment, 
  CommentPage, 
  CreateCommentRequest, 
  UpdateCommentRequest,
  CommentCount,
  LikeResponse
} from '../models/comment.model';
import { MessageResponse } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get comments with pagination (top-level only)
   * @param documentId Document ID
   * @param page Page number (0-based)
   * @param size Page size
   */
  getComments(documentId: number, page: number = 0, size: number = 10): Observable<CommentPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<CommentPage>(
      `${this.apiUrl}/documents/${documentId}/comments`,
      { params }
    );
  }

  /**
   * Get total comment count for document
   * @param documentId Document ID
   */
  getCommentCount(documentId: number): Observable<CommentCount> {
    return this.http.get<CommentCount>(
      `${this.apiUrl}/documents/${documentId}/comments/count`
    );
  }

  /**
   * Get single comment with all replies
   * @param documentId Document ID
   * @param commentId Comment ID
   */
  getComment(documentId: number, commentId: number): Observable<Comment> {
    return this.http.get<Comment>(
      `${this.apiUrl}/documents/${documentId}/comments/${commentId}`
    );
  }

  /**
   * Get all replies for a comment
   * @param documentId Document ID
   * @param commentId Comment ID
   */
  getReplies(documentId: number, commentId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(
      `${this.apiUrl}/documents/${documentId}/comments/${commentId}/replies`
    );
  }

  /**
   * Create a new comment or reply
   * @param documentId Document ID
   * @param request Comment data
   */
  createComment(documentId: number, request: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.apiUrl}/documents/${documentId}/comments`,
      request
    );
  }

  /**
   * Update a comment (owner only)
   * @param documentId Document ID
   * @param commentId Comment ID
   * @param request Updated content
   */
  updateComment(documentId: number, commentId: number, request: UpdateCommentRequest): Observable<Comment> {
    return this.http.put<Comment>(
      `${this.apiUrl}/documents/${documentId}/comments/${commentId}`,
      request
    );
  }

  /**
   * Delete a comment (owner only, cascade deletes replies)
   * @param documentId Document ID
   * @param commentId Comment ID
   */
  deleteComment(documentId: number, commentId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(
      `${this.apiUrl}/documents/${documentId}/comments/${commentId}`
    );
  }

  /**
   * Toggle like/unlike on a comment
   * @param documentId Document ID
   * @param commentId Comment ID
   */
  toggleLike(documentId: number, commentId: number): Observable<LikeResponse> {
    return this.http.post<LikeResponse>(
      `${this.apiUrl}/documents/${documentId}/comments/${commentId}/like`,
      {}
    );
  }
}
