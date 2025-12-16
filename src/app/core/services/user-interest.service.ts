import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { UserInterest, Tag } from '../models/user-interest.model';

@Injectable({
  providedIn: 'root'
})
export class UserInterestService {
  private mockTags: Tag[] = [
    { id: 1, name: 'Angular', description: 'Angular framework', documentCount: 25 },
    { id: 2, name: 'Spring Boot', description: 'Spring Boot framework', documentCount: 20 },
    { id: 3, name: 'TypeScript', documentCount: 18 },
    { id: 4, name: 'Java', documentCount: 22 },
    { id: 5, name: 'REST API', documentCount: 15 },
    { id: 6, name: 'Security', documentCount: 12 },
    { id: 7, name: 'Database', documentCount: 14 },
    { id: 8, name: 'Testing', documentCount: 10 },
    { id: 9, name: 'Docker', documentCount: 8 },
    { id: 10, name: 'CI/CD', documentCount: 7 },
    { id: 11, name: 'Microservices', documentCount: 6 },
    { id: 12, name: 'Frontend', documentCount: 16 },
    { id: 13, name: 'Backend', documentCount: 14 },
    { id: 14, name: 'AWS', documentCount: 5 },
    { id: 15, name: 'DevOps', documentCount: 9 }
  ];

  private mockUserInterests: UserInterest[] = [
    { id: 1, userId: 1, tagId: 1, tagName: 'Angular', createdAt: new Date() },
    { id: 2, userId: 1, tagId: 3, tagName: 'TypeScript', createdAt: new Date() },
    { id: 3, userId: 1, tagId: 6, tagName: 'Security', createdAt: new Date() }
  ];

  constructor() {}

  /**
   * Get all available tags
   * GET /api/tags
   */
  getAllTags(): Observable<Tag[]> {
    return of(this.mockTags).pipe(delay(300));
  }

  /**
   * Get current user's interested tags
   * GET /api/users/me/interests
   */
  getUserInterests(): Observable<UserInterest[]> {
    return of(this.mockUserInterests).pipe(delay(300));
  }

  /**
   * Update user's interests (replace all)
   * POST /api/users/me/interests
   * Body: { tagIds: number[] }
   */
  updateUserInterests(tagIds: number[]): Observable<UserInterest[]> {
    // Replace all interests
    this.mockUserInterests = tagIds.map((tagId, index) => {
      const tag = this.mockTags.find(t => t.id === tagId);
      return {
        id: index + 1,
        userId: 1,
        tagId: tagId,
        tagName: tag?.name || '',
        createdAt: new Date()
      };
    });
    return of(this.mockUserInterests).pipe(delay(500));
  }

  /**
   * Add single interest
   * POST /api/users/me/interests/{tagId}
   */
  addInterest(tagId: number): Observable<UserInterest> {
    const tag = this.mockTags.find(t => t.id === tagId);
    const newInterest: UserInterest = {
      id: this.mockUserInterests.length + 1,
      userId: 1,
      tagId: tagId,
      tagName: tag?.name || '',
      createdAt: new Date()
    };
    this.mockUserInterests.push(newInterest);
    return of(newInterest).pipe(delay(300));
  }

  /**
   * Remove single interest
   * DELETE /api/users/me/interests/{tagId}
   */
  removeInterest(tagId: number): Observable<void> {
    const index = this.mockUserInterests.findIndex(i => i.tagId === tagId);
    if (index > -1) {
      this.mockUserInterests.splice(index, 1);
    }
    return of(void 0).pipe(delay(300));
  }

  /**
   * Get popular tags (top 10 by document count)
   * GET /api/tags/popular
   */
  getPopularTags(): Observable<Tag[]> {
    const sorted = [...this.mockTags].sort((a, b) => 
      (b.documentCount || 0) - (a.documentCount || 0)
    );
    return of(sorted.slice(0, 10)).pipe(delay(300));
  }
}
