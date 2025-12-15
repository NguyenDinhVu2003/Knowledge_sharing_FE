import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, map, delay, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Favorite } from '../models/favorite.model';
import { Document } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/favorites`;
  
  // State management
  private favoritesSubject = new BehaviorSubject<Favorite[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  // Mock data
  private mockFavorites: Favorite[] = [];
  private mockIdCounter = 1;

  constructor() {
    this.loadMockData();
  }

  /**
   * Initialize mock data with sample favorites
   */
  private loadMockData(): void {
    this.mockFavorites = [
      {
        id: 1,
        documentId: 1,
        userId: 1,
        createdAt: new Date('2025-12-10T08:30:00Z'),
        document: {
          id: 1,
          title: 'Angular Best Practices 2025',
          summary: 'Complete guide to modern Angular development with signals, zoneless change detection, and standalone components.',
          file_path: '/files/angular-2025.pdf',
          file_type: 'PDF',
          file_size: 2048000,
          owner_id: 1,
          owner_name: 'John Doe',
          sharing_level: 'PUBLIC',
          version_number: 1,
          is_archived: false,
          average_rating: 4.8,
          created_at: '2025-12-14T10:30:00Z',
          updated_at: '2025-12-14T10:30:00Z',
          tags: ['Angular', 'Frontend', 'Best Practices']
        }
      },
      {
        id: 2,
        documentId: 3,
        userId: 1,
        createdAt: new Date('2025-12-11T14:15:00Z'),
        document: {
          id: 3,
          title: 'RxJS Operators Handbook',
          summary: 'Comprehensive guide to RxJS operators with practical examples. Learn how to handle async operations efficiently.',
          file_path: '/files/rxjs-operators.pdf',
          file_type: 'PDF',
          file_size: 1843200,
          owner_id: 1,
          owner_name: 'John Doe',
          sharing_level: 'PUBLIC',
          version_number: 1,
          is_archived: false,
          average_rating: 4.7,
          created_at: '2025-12-12T11:00:00Z',
          updated_at: '2025-12-12T11:00:00Z',
          tags: ['RxJS', 'Angular', 'Reactive Programming']
        }
      },
      {
        id: 3,
        documentId: 5,
        userId: 1,
        createdAt: new Date('2025-12-12T09:00:00Z'),
        document: {
          id: 5,
          title: 'Docker for Developers',
          summary: 'Introduction to Docker containers, images, Docker Compose, and container orchestration.',
          file_path: '/files/docker-guide.pdf',
          file_type: 'PDF',
          file_size: 2621440,
          owner_id: 3,
          owner_name: 'Bob Wilson',
          sharing_level: 'PUBLIC',
          version_number: 1,
          is_archived: false,
          average_rating: 4.6,
          created_at: '2025-12-08T13:20:00Z',
          updated_at: '2025-12-08T13:20:00Z',
          tags: ['Docker', 'DevOps', 'Containers']
        }
      }
    ];
    
    this.mockIdCounter = this.mockFavorites.length + 1;
    this.favoritesSubject.next([...this.mockFavorites]);
  }

  /**
   * Get all favorites for current user
   * GET /api/favorites
   * @returns Observable of Favorite array with populated document details
   */
  getFavorites(): Observable<Favorite[]> {
    // MOCK IMPLEMENTATION
    return of([...this.mockFavorites]).pipe(
      delay(300),
      tap(favorites => this.favoritesSubject.next(favorites)),
      catchError(err => {
        console.error('Failed to load favorites', err);
        return of([]);
      })
    );

    /* ACTUAL API IMPLEMENTATION - Uncomment when backend is ready
    return this.http.get<Favorite[]>(this.apiUrl).pipe(
      tap(favorites => this.favoritesSubject.next(favorites)),
      catchError(err => {
        console.error('Failed to load favorites', err);
        return of([]);
      })
    );
    */
  }

  /**
   * Add document to favorites
   * POST /api/favorites
   * @param documentId - ID of document to add
   * @returns Observable of created Favorite object
   */
  addFavorite(documentId: number): Observable<Favorite> {
    // MOCK IMPLEMENTATION
    // Check if already favorited
    const existing = this.mockFavorites.find(f => f.documentId === documentId);
    if (existing) {
      return of(existing).pipe(delay(200));
    }

    // Create new favorite (in real app, backend will populate document)
    const newFavorite: Favorite = {
      id: this.mockIdCounter++,
      documentId: documentId,
      userId: 1, // Current user
      createdAt: new Date()
      // document will be populated by backend
    };

    this.mockFavorites.push(newFavorite);
    this.favoritesSubject.next([...this.mockFavorites]);

    return of(newFavorite).pipe(
      delay(200),
      catchError(err => {
        console.error('Failed to add favorite', err);
        return throwError(() => err);
      })
    );

    /* ACTUAL API IMPLEMENTATION - Uncomment when backend is ready
    return this.http.post<Favorite>(this.apiUrl, { documentId }).pipe(
      tap(favorite => {
        this.mockFavorites.push(favorite);
        this.favoritesSubject.next([...this.mockFavorites]);
      }),
      catchError(err => {
        console.error('Failed to add favorite', err);
        return throwError(() => err);
      })
    );
    */
  }

  /**
   * Remove favorite by ID
   * DELETE /api/favorites/{id}
   * @param favoriteId - ID of favorite to remove
   * @returns Observable<void>
   */
  removeFavorite(favoriteId: number): Observable<void> {
    // MOCK IMPLEMENTATION
    const index = this.mockFavorites.findIndex(f => f.id === favoriteId);
    if (index > -1) {
      this.mockFavorites.splice(index, 1);
      this.favoritesSubject.next([...this.mockFavorites]);
    }

    return of(void 0).pipe(
      delay(200),
      catchError(err => {
        console.error('Failed to remove favorite', err);
        return throwError(() => err);
      })
    );

    /* ACTUAL API IMPLEMENTATION - Uncomment when backend is ready
    return this.http.delete<void>(`${this.apiUrl}/${favoriteId}`).pipe(
      tap(() => {
        const index = this.mockFavorites.findIndex(f => f.id === favoriteId);
        if (index > -1) {
          this.mockFavorites.splice(index, 1);
          this.favoritesSubject.next([...this.mockFavorites]);
        }
      }),
      catchError(err => {
        console.error('Failed to remove favorite', err);
        return throwError(() => err);
      })
    );
    */
  }

  /**
   * Remove favorite by document ID (helper method)
   * @param documentId - ID of document to unfavorite
   * @returns Observable<void>
   */
  removeFavoriteByDocumentId(documentId: number): Observable<void> {
    const favorite = this.mockFavorites.find(f => f.documentId === documentId);
    if (favorite) {
      return this.removeFavorite(favorite.id);
    }
    return of(void 0);
  }

  /**
   * Check if document is favorited by current user
   * @param documentId - ID of document to check
   * @returns Observable<boolean>
   */
  isFavorited(documentId: number): Observable<boolean> {
    // MOCK IMPLEMENTATION
    const favorited = this.mockFavorites.some(f => f.documentId === documentId);
    return of(favorited).pipe(delay(100));

    /* ACTUAL API IMPLEMENTATION - Uncomment when backend is ready
    return this.http.get<boolean>(`${this.apiUrl}/check/${documentId}`);
    */
  }

  /**
   * Get count of favorites for badge display
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
