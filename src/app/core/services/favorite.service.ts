import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Favorite, FavoriteCheckResponse, FavoriteCountResponse } from '../models/favorite.model';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/favorites`;
  
  // State management for caching
  private favoritesSubject = new BehaviorSubject<Favorite[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  /**
   * Get all favorites for current user
   * GET /api/favorites
   * @returns Observable of Favorite array
   */
  getFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(this.apiUrl).pipe(
      tap(favorites => this.favoritesSubject.next(favorites)),
      catchError(err => {
        console.error('Failed to load favorites', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Add document to favorites
   * POST /api/favorites/documents/{documentId}
   * @param documentId - ID of document to add
   * @returns Observable of created Favorite object
   */
  addFavorite(documentId: number): Observable<Favorite> {
    return this.http.post<Favorite>(`${this.apiUrl}/documents/${documentId}`, {}).pipe(
      tap(() => this.refreshFavorites()),
      catchError(err => {
        console.error('Failed to add favorite', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Remove favorite by document ID
   * DELETE /api/favorites/documents/{documentId}
   * @param documentId - ID of document to remove from favorites
   * @returns Observable<{message: string}>
   */
  removeFavorite(documentId: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/documents/${documentId}`).pipe(
      tap(() => this.refreshFavorites()),
      catchError(err => {
        console.error('Failed to remove favorite', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Check if document is favorited by current user
   * GET /api/favorites/documents/{documentId}/check
   * @param documentId - ID of document to check
   * @returns Observable<boolean>
   */
  isFavorited(documentId: number): Observable<boolean> {
    return this.http.get<FavoriteCheckResponse>(`${this.apiUrl}/documents/${documentId}/check`).pipe(
      map(response => response.isFavorited),
      catchError(err => {
        console.error('Failed to check favorite status', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Get count of favorites for a specific document
   * GET /api/favorites/documents/{documentId}/count
   * @param documentId - ID of document
   * @returns Observable<number>
   */
  getFavoriteCountByDocument(documentId: number): Observable<number> {
    return this.http.get<FavoriteCountResponse>(`${this.apiUrl}/documents/${documentId}/count`).pipe(
      map(response => response.count),
      catchError(err => {
        console.error('Failed to get favorite count', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Get count of user's favorites for badge display
   * @returns Observable<number>
   */
  getFavoriteCount(): Observable<number> {
    return this.favorites$.pipe(
      map(favorites => favorites.length)
    );
  }

  /**
   * Refresh favorites list (call after add/remove)
   */
  refreshFavorites(): void {
    this.getFavorites().subscribe();
  }
}
