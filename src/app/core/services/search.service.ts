import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Document } from '../models/document.model';
import { environment } from '../../../environments/environment';

export interface Tag {
  id: number;
  name: string;
  description: string;
  documentCount: number;
  createdAt: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  documentCount: number;
  memberUsernames: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  query?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  groupId?: number;
  sharingLevel?: 'PRIVATE' | 'GROUP' | 'DEPARTMENT' | 'PUBLIC';
  fileType?: string;
  minRating?: number;
  sortBy?: 'recent' | 'oldest' | 'popular' | 'title' | 'rating' | 'relevance';
}

export interface SearchRequest {
  filters: SearchFilters;
  searchType: 'KEYWORD' | 'SEMANTIC';
  page: number;
  pageSize: number;
}

export interface SearchResponse {
  documents: Document[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  tagFacets: { [key: string]: number } | null;
  fileTypeFacets: { [key: string]: number } | null;
  sharingLevelFacets: { [key: string]: number } | null;
  ownerFacets: { [key: string]: number } | null;
  query: string | null;
  searchTimeMs: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient) {}

  /**
   * Perform keyword-based search with filters
   * GET /api/search?q=...&tags=...&page=...&size=...
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
    if (request.filters.fileType) params = params.set('fileType', request.filters.fileType);
    if (request.filters.minRating) params = params.set('minRating', request.filters.minRating.toString());
    if (request.filters.sortBy) params = params.set('sortBy', request.filters.sortBy);
    
    return this.http.get<SearchResponse>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Search error:', error);
        throw error;
      })
    );
  }

  /**
   * Perform advanced search with all filters
   * GET /api/search/advanced?query=...&tags=...&page=...&size=...
   */
  advancedSearch(request: SearchRequest): Observable<SearchResponse> {
    let params = new HttpParams()
      .set('page', request.page.toString())
      .set('size', request.pageSize.toString());
    
    if (request.filters.query) params = params.set('query', request.filters.query);
    if (request.filters.tags?.length) params = params.set('tags', request.filters.tags.join(','));
    if (request.filters.dateFrom) params = params.set('fromDate', request.filters.dateFrom.toISOString());
    if (request.filters.dateTo) params = params.set('toDate', request.filters.dateTo.toISOString());
    if (request.filters.sharingLevel) params = params.set('sharingLevel', request.filters.sharingLevel);
    if (request.filters.fileType) params = params.set('fileType', request.filters.fileType);
    if (request.filters.minRating) params = params.set('minRating', request.filters.minRating.toString());
    if (request.filters.sortBy) params = params.set('sortBy', request.filters.sortBy);
    
    return this.http.get<SearchResponse>(`${this.apiUrl}/advanced`, { params }).pipe(
      catchError(error => {
        console.error('Advanced search error:', error);
        throw error;
      })
    );
  }

  /**
   * Get all available tags for filter dropdown
   * GET /api/tags
   */
  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${environment.apiUrl}/tags`).pipe(
      catchError(error => {
        console.error('Error loading tags:', error);
        throw error;
      })
    );
  }

  /**
   * Get all groups for filter dropdown
   * GET /api/groups
   */
  getAllGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${environment.apiUrl}/groups`).pipe(
      catchError(error => {
        console.error('Error loading groups:', error);
        throw error;
      })
    );
  }
}
