import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserManagement, SystemStatistics, UpdateUserRoleRequest } from '../models/admin.model';
import { MessageResponse } from '../models/notification.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  /**
   * Get all users in the system
   * GET /api/admin/users
   */
  getAllUsers(): Observable<UserManagement[]> {
    return this.http.get<UserManagement[]>(`${this.apiUrl}/users`).pipe(
      catchError(error => {
        console.error('Error getting all users:', error);
        throw error;
      })
    );
  }

  /**
   * Get user details by ID
   * GET /api/admin/users/{userId}
   */
  getUserDetails(userId: number): Observable<UserManagement> {
    return this.http.get<UserManagement>(`${this.apiUrl}/users/${userId}`).pipe(
      catchError(error => {
        console.error(`Error getting user details for ${userId}:`, error);
        throw error;
      })
    );
  }

  /**
   * Update user role (EMPLOYEE or ADMIN)
   * PUT /api/admin/users/{userId}/role
   */
  updateUserRole(userId: number, role: 'EMPLOYEE' | 'ADMIN'): Observable<MessageResponse> {
    const request: UpdateUserRoleRequest = { role };
    return this.http.put<MessageResponse>(`${this.apiUrl}/users/${userId}/role`, request).pipe(
      catchError(error => {
        console.error(`Error updating role for user ${userId}:`, error);
        throw error;
      })
    );
  }

  /**
   * Delete user (cascade delete all related data)
   * DELETE /api/admin/users/{userId}
   */
  deleteUser(userId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/users/${userId}`).pipe(
      catchError(error => {
        console.error(`Error deleting user ${userId}:`, error);
        throw error;
      })
    );
  }

  /**
   * Get system statistics
   * GET /api/admin/statistics
   */
  getStatistics(): Observable<SystemStatistics> {
    return this.http.get<SystemStatistics>(`${this.apiUrl}/statistics`).pipe(
      catchError(error => {
        console.error('Error getting statistics:', error);
        throw error;
      })
    );
  }

  /**
   * Delete document (content moderation)
   * DELETE /api/admin/documents/{documentId}
   */
  deleteDocument(documentId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/documents/${documentId}`).pipe(
      catchError(error => {
        console.error(`Error deleting document ${documentId}:`, error);
        throw error;
      })
    );
  }

  /**
   * Delete rating (content moderation)
   * DELETE /api/admin/ratings/{ratingId}
   */
  deleteRating(ratingId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/ratings/${ratingId}`).pipe(
      catchError(error => {
        console.error(`Error deleting rating ${ratingId}:`, error);
        throw error;
      })
    );
  }

  /**
   * Delete notification (cleanup)
   * DELETE /api/admin/notifications/{notificationId}
   */
  deleteNotification(notificationId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/notifications/${notificationId}`).pipe(
      catchError(error => {
        console.error(`Error deleting notification ${notificationId}:`, error);
        throw error;
      })
    );
  }
}
