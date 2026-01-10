import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserInterest, Tag, UserProfile, UpdateUserInterestsRequest } from '../models/user-interest.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UserInterestService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/profile`;

  /**
   * Get current user profile with interests and statistics
   * GET /api/profile
   */
  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error getting user profile:', error);
        throw error;
      })
    );
  }

  /**
   * Get current user interest IDs only
   * GET /api/profile/interests
   */
  getUserInterestIds(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/interests`).pipe(
      catchError(error => {
        console.error('Error getting user interest IDs:', error);
        throw error;
      })
    );
  }

  /**
   * Get all available tags with interest status and optional search
   * GET /api/profile/tags?search=keyword
   */
  getAllTags(search?: string): Observable<Tag[]> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    
    return this.http.get<Tag[]>(`${this.apiUrl}/tags`, { params }).pipe(
      catchError(error => {
        console.error('Error getting all tags:', error);
        throw error;
      })
    );
  }

  /**
   * Get current user's interested tags (from profile)
   * GET /api/profile
   */
  getUserInterests(): Observable<UserInterest[]> {
    return this.getUserProfile().pipe(
      map(profile => {
        // Convert profile interests to UserInterest format for backward compatibility
        return profile.interests.map((tag, index) => ({
          id: index + 1,
          userId: profile.id,
          tagId: tag.id,
          tagName: tag.name,
          createdAt: new Date(profile.updatedAt)
        }));
      }),
      catchError(error => {
        console.error('Error getting user interests:', error);
        throw error;
      })
    );
  }

  /**
   * Update user's interests (replace all)
   * PUT /api/profile/interests
   * Body: { tagIds: number[] }
   */
  updateUserInterests(tagIds: number[]): Observable<Tag[]> {
    const request: UpdateUserInterestsRequest = { tagIds };
    return this.http.put<Tag[]>(`${this.apiUrl}/interests`, request).pipe(
      catchError(error => {
        console.error('Error updating user interests:', error);
        throw error;
      })
    );
  }

  /**
   * Add single interest (toggle on)
   * POST /api/profile/interests/{tagId}
   */
  addInterest(tagId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/interests/${tagId}`, {}).pipe(
      catchError(error => {
        console.error('Error adding interest:', error);
        throw error;
      })
    );
  }

  /**
   * Remove single interest (toggle off)
   * DELETE /api/profile/interests/{tagId}
   */
  removeInterest(tagId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/interests/${tagId}`).pipe(
      catchError(error => {
        console.error('Error removing interest:', error);
        throw error;
      })
    );
  }

  /**
   * Get popular tags with interest status
   * GET /api/profile/tags/popular?limit=10
   */
  getPopularTags(limit: number = 10): Observable<Tag[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<Tag[]>(`${this.apiUrl}/tags/popular`, { params }).pipe(
      catchError(error => {
        console.error('Error getting popular tags:', error);
        throw error;
      })
    );
  }
}
