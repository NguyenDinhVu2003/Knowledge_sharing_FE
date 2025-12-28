import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Rating, RatingStats, RatingRequest } from '../models/rating.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ratings`;

  /**
   * Rate document (POST /api/ratings/documents/{documentId})
   * Creates new rating or updates existing one
   */
  rateDocument(documentId: number, ratingValue: number): Observable<Rating> {
    const request: RatingRequest = { ratingValue };
    return this.http.post<Rating>(`${this.apiUrl}/documents/${documentId}`, request).pipe(
      catchError(error => {
        console.error(`Error rating document ${documentId}:`, error);
        throw error;
      })
    );
  }

  /**
   * Update rating (PUT /api/ratings/documents/{documentId})
   */
  updateRating(documentId: number, ratingValue: number): Observable<Rating> {
    const request: RatingRequest = { ratingValue };
    return this.http.put<Rating>(`${this.apiUrl}/documents/${documentId}`, request).pipe(
      catchError(error => {
        console.error(`Error updating rating for document ${documentId}:`, error);
        throw error;
      })
    );
  }

  /**
   * Delete rating (DELETE /api/ratings/documents/{documentId})
   */
  deleteRating(documentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/documents/${documentId}`).pipe(
      catchError(error => {
        console.error(`Error deleting rating for document ${documentId}:`, error);
        throw error;
      })
    );
  }

  /**
   * Get my rating for document (GET /api/ratings/documents/{documentId}/my-rating)
   * Returns null if not rated yet (204 No Content)
   */
  getMyRating(documentId: number): Observable<Rating | null> {
    return this.http.get<Rating>(`${this.apiUrl}/documents/${documentId}/my-rating`).pipe(
      catchError(error => {
        // 204 No Content or 404 means not rated yet
        if (error.status === 204 || error.status === 404) {
          return of(null);
        }
        console.error(`Error getting my rating for document ${documentId}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Get all ratings for document (GET /api/ratings/documents/{documentId})
   */
  getDocumentRatings(documentId: number): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/documents/${documentId}`).pipe(
      catchError(error => {
        console.error(`Error getting ratings for document ${documentId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Get rating statistics (GET /api/ratings/documents/{documentId}/stats)
   */
  getRatingStats(documentId: number): Observable<RatingStats> {
    return this.http.get<RatingStats>(`${this.apiUrl}/documents/${documentId}/stats`).pipe(
      catchError(error => {
        console.error(`Error getting rating stats for document ${documentId}:`, error);
        throw error;
      })
    );
  }

  /**
   * Get all my ratings (GET /api/ratings/my-ratings)
   */
  getMyRatings(): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/my-ratings`).pipe(
      catchError(error => {
        console.error('Error getting my ratings:', error);
        return of([]);
      })
    );
  }
}
