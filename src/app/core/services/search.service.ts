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
  q?: string;
  tags?: string[];
  matchAllTags?: boolean;
  sharingLevel?: 'PRIVATE' | 'GROUP' | 'DEPARTMENT' | 'PUBLIC';
  fileType?: string;
  ownerId?: number;
  ownerUsername?: string;
  groupIds?: number[];
  minRating?: number;
  maxRating?: number;
  fromDate?: Date;
  toDate?: Date;
  sortBy?: 'recent' | 'oldest' | 'popular' | 'title' | 'rating' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  includeArchived?: boolean;
  onlyFavorited?: boolean;
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
   * Perform unified search with all filters
   * GET /api/search?q=...&tags=...&page=...&size=...
   */
  searchDocuments(request: SearchRequest): Observable<SearchResponse> {
    let params = new HttpParams()
      .set('page', request.page.toString())
      .set('size', request.pageSize.toString());
    
    if (request.filters.q) params = params.set('q', request.filters.q);
    if (request.filters.tags?.length) params = params.set('tags', request.filters.tags.join(','));
    if (request.filters.matchAllTags !== undefined) params = params.set('matchAllTags', request.filters.matchAllTags.toString());
    if (request.filters.sharingLevel) params = params.set('sharingLevel', request.filters.sharingLevel);
    if (request.filters.fileType) params = params.set('fileType', request.filters.fileType);
    if (request.filters.ownerId) params = params.set('ownerId', request.filters.ownerId.toString());
    if (request.filters.ownerUsername) params = params.set('ownerUsername', request.filters.ownerUsername);
    if (request.filters.groupIds?.length) params = params.set('groupIds', request.filters.groupIds.join(','));
    if (request.filters.minRating) params = params.set('minRating', request.filters.minRating.toString());
    if (request.filters.maxRating) params = params.set('maxRating', request.filters.maxRating.toString());
    if (request.filters.fromDate) params = params.set('fromDate', request.filters.fromDate.toISOString());
    if (request.filters.toDate) params = params.set('toDate', request.filters.toDate.toISOString());
    if (request.filters.sortBy) params = params.set('sortBy', request.filters.sortBy);
    if (request.filters.sortOrder) params = params.set('sortOrder', request.filters.sortOrder);
    if (request.filters.includeArchived !== undefined) params = params.set('includeArchived', request.filters.includeArchived.toString());
    if (request.filters.onlyFavorited !== undefined) params = params.set('onlyFavorited', request.filters.onlyFavorited.toString());
    
    return this.http.get<SearchResponse>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Search error:', error);
        throw error;
      })
    );
  }

  /**
   * Perform advanced search with all filters (uses same unified endpoint)
   * GET /api/search?query=...&tags=...&page=...&size=...
   */
  advancedSearch(request: SearchRequest): Observable<SearchResponse> {
    return this.searchDocuments(request);
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

  /**
   * Perform AI Semantic Search
   * GET /api/search/semantic?q=...&limit=...
   * Uses Gemini AI for natural language understanding and concept-based search
   */
  semanticSearch(query: string, limit: number = 10): Observable<Document[]> {
    let params = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString());
    
    return this.http.get<Document[]>(`${this.apiUrl}/semantic`, { params }).pipe(
      catchError(error => {
        console.error('Semantic search error:', error);
        throw error;
      })
    );
  }
}
