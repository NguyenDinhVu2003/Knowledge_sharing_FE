import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Document, Group } from '../models/document.model';
import { environment } from '../../../environments/environment';

export interface SearchFilters {
  query?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  groupId?: number;
  sharingLevel?: 'PRIVATE' | 'GROUP' | 'DEPARTMENT' | 'PUBLIC';
  sortBy?: 'recent' | 'oldest' | 'popular' | 'title';
}

export interface SearchRequest {
  filters: SearchFilters;
  searchType: 'KEYWORD' | 'SEMANTIC';
  page: number;
  pageSize: number;
}

export interface SearchResponse {
  documents: Document[];
  totalCount: number;
  page: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/documents`;

  private mockTags = [
    'Angular', 'Spring Boot', 'TypeScript', 'Java', 'REST API', 'Database', 
    'Security', 'Testing', 'Best Practices', 'Authentication', 'JWT', 
    'Microservices', 'Docker', 'DevOps', 'CI/CD', 'Kubernetes', 'SQL', 
    'JavaScript', 'Design Patterns', 'Architecture'
  ];

  private mockGroups: Group[] = [
    { id: 1, name: 'Frontend Team', description: 'Frontend development team' },
    { id: 2, name: 'Backend Team', description: 'Backend development team' },
    { id: 3, name: 'DevOps Team', description: 'DevOps and infrastructure team' },
    { id: 4, name: 'QA Team', description: 'Quality assurance team' }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Perform keyword-based search with filters
   * GET /api/documents/search?q=...&tags=...&page=...&size=...
   */
  searchDocuments(request: SearchRequest): Observable<SearchResponse> {
    let params = new HttpParams()
      .set('page', request.page.toString())
      .set('size', request.pageSize.toString());
    
    if (request.filters.query) params = params.set('q', request.filters.query);
    if (request.filters.tags?.length) params = params.set('tags', request.filters.tags.join(','));
    if (request.filters.dateFrom) params = params.set('fromDate', request.filters.dateFrom.toISOString());
    if (request.filters.dateTo) params = params.set('toDate', request.filters.dateTo.toISOString());
    if (request.filters.sharingLevel) params = params.set('sharingLevel', request.filters.sharingLevel);
    if (request.filters.sortBy) params = params.set('sortBy', request.filters.sortBy);
    
    return this.http.get<SearchResponse>(`${this.apiUrl}/search`, { params }).pipe(
      catchError(error => {
        console.error('Search error:', error);
        return of({ documents: [], totalCount: 0, page: 0, totalPages: 0 });
      })
    );
  }

  /**
   * Perform AI semantic search
   * GET /api/documents/search/semantic?query=...&page=...&size=...
   */
  semanticSearch(query: string, page: number, pageSize: number): Observable<SearchResponse> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', pageSize.toString());
    
    return this.http.get<SearchResponse>(`${this.apiUrl}/search/semantic`, { params }).pipe(
      catchError(error => {
        console.error('Semantic search error:', error);
        return of({ documents: [], totalCount: 0, page: 0, totalPages: 0 });
      })
    );
  }

  /**
   * Get all available tags for filter dropdown
   * GET /api/tags
   */
  getAllTags(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/tags`).pipe(
      catchError(() => of(this.mockTags))
    );
  }

  /**
   * Get all groups for filter dropdown
   * GET /api/groups
   */
  getAllGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${environment.apiUrl}/groups`).pipe(
      catchError(() => of(this.mockGroups))
    );
  }
}
