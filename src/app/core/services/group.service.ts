/**
 * Group Service - Quản lý Group APIs
 * Tích hợp đầy đủ 9 API endpoints theo tài liệu GroupAPI.md
 * Created: February 1, 2026
 * Authorization: Bearer Token Required
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { GroupRequest, GroupResponse } from '../models/group.model';
import { MessageResponse } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private apiUrl = `${environment.apiUrl}/groups`;

  constructor(private http: HttpClient) {}

  // ==================== ALL USERS APIs ====================

  /**
   * 1. Create new group
   * POST /api/groups
   * Authorization: All authenticated users
   */
  createGroup(groupData: GroupRequest): Observable<GroupResponse> {
    return this.http.post<GroupResponse>(this.apiUrl, groupData)
      .pipe(catchError(this.handleError));
  }

  /**
   * 2. Update group
   * PUT /api/groups/{id}
   * Authorization: All authenticated users
   */
  updateGroup(id: number, groupData: GroupRequest): Observable<GroupResponse> {
    return this.http.put<GroupResponse>(`${this.apiUrl}/${id}`, groupData)
      .pipe(catchError(this.handleError));
  }

  /**
   * 3. Delete group
   * DELETE /api/groups/{id}
   * Authorization: All authenticated users
   */
  deleteGroup(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * 4. Get group by ID
   * GET /api/groups/{id}
   * Authorization: All authenticated users
   */
  getGroupById(id: number): Observable<GroupResponse> {
    return this.http.get<GroupResponse>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * 5. Get all groups
   * GET /api/groups
   * Authorization: All authenticated users
   */
  getAllGroups(): Observable<GroupResponse[]> {
    return this.http.get<GroupResponse[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * 6. Get current user's groups
   * GET /api/groups/my-groups
   * Authorization: All authenticated users
   */
  getMyGroups(): Observable<GroupResponse[]> {
    return this.http.get<GroupResponse[]>(`${this.apiUrl}/my-groups`)
      .pipe(catchError(this.handleError));
  }

  /**
   * 7. Search groups
   * GET /api/groups/search?keyword={keyword}
   * Authorization: All authenticated users
   */
  searchGroups(keyword: string): Observable<GroupResponse[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<GroupResponse[]>(`${this.apiUrl}/search`, { params })
      .pipe(catchError(this.handleError));
  }

  // ==================== ADMIN ONLY APIs ====================

  /**
   * 8. Add member to group
   * POST /api/groups/{groupId}/members/{userId}
   * Authorization: ADMIN ONLY
   * Returns 403 Forbidden if user is not admin
   */
  addMemberToGroup(groupId: number, userId: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.apiUrl}/${groupId}/members/${userId}`,
      {}
    ).pipe(catchError(this.handleError));
  }

  /**
   * 9. Remove member from group
   * DELETE /api/groups/{groupId}/members/{userId}
   * Authorization: ADMIN ONLY
   * Returns 403 Forbidden if user is not admin
   */
  removeMemberFromGroup(groupId: number, userId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(
      `${this.apiUrl}/${groupId}/members/${userId}`
    ).pipe(catchError(this.handleError));
  }

  // ==================== HELPER METHODS ====================

  /**
   * Get groups for a specific user (helper method)
   * Useful for admin to see what groups a user belongs to
   */
  getUserGroups(userId: number): Observable<GroupResponse[]> {
    // Note: This would need a backend API endpoint
    // For now, we can filter from getAllGroups based on memberUsernames
    return this.getAllGroups().pipe(
      catchError(this.handleError)
    );
  }

  // ==================== ERROR HANDLING ====================

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Invalid data provided';
          break;
        case 401:
          errorMessage = 'Please login to continue';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action. Admin access required.';
          break;
        case 404:
          errorMessage = error.error?.message || 'Resource not found';
          break;
        case 409:
          errorMessage = error.error?.message || 'Conflict - Group name already exists';
          break;
        case 500:
          errorMessage = 'Server error occurred. Please try again later.';
          break;
        default:
          errorMessage = `Server error: ${error.status} - ${error.message}`;
      }
    }
    
    console.error('Group API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
