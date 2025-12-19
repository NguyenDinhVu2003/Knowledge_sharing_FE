import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import type { Document } from '../models';
import { DocumentVersion, Group, PagedResponse } from '../models';
import { environment } from '../../../environments/environment.development';

export interface DocumentQueryParams {
  page?: number;
  size?: number;
  sortBy?: 'recent' | 'oldest' | 'popular' | 'title';
  level?: 'PUBLIC' | 'GROUP' | 'PRIVATE' | 'ALL';
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/documents`;

  getDocuments(params?: DocumentQueryParams): Observable<PagedResponse<Document>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.level) httpParams = httpParams.set('level', params.level);
      if (params.search) httpParams = httpParams.set('search', params.search);
    }
    return this.http.get<PagedResponse<Document>>(this.apiUrl, { params: httpParams }).pipe(
      catchError(error => {
        console.error('Error fetching documents:', error);
        return throwError(() => error);
      })
    );
  }

  getDocumentById(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error fetching document ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  createDocument(formData: FormData): Observable<Document> {
    return this.http.post<Document>(this.apiUrl, formData).pipe(
      catchError(error => {
        console.error('Error creating document:', error);
        return throwError(() => error);
      })
    );
  }

  uploadDocument(formData: FormData): Observable<Document> {
    return this.createDocument(formData);
  }

  updateDocument(id: number, data: FormData | Partial<Document>): Observable<Document> {
    return this.http.put<Document>(`/`, data).pipe(
      catchError(error => {
        console.error(`Error updating document :`, error);
        return throwError(() => error);
      })
    );
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`/`).pipe(
      catchError(error => {
        console.error(`Error deleting document :`, error);
        return throwError(() => error);
      })
    );
  }

  getRecentDocuments(limit: number = 10): Observable<Document[]> {
    console.log('api called', this.apiUrl)
    const params = new HttpParams()
      .set('sort', 'recent')
      .set('limit', limit.toString());
    return this.http.get<Document[]>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Error fetching recent documents:', error);
        return throwError(() => error);
      })
    );
  }

  getPopularDocuments(limit: number = 10): Observable<Document[]> {
    const params = new HttpParams()
      .set('sort', 'popular')
      .set('limit', limit.toString());
    return this.http.get<Document[]>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Error fetching popular documents:', error);
        return throwError(() => error);
      })
    );
  }

  getUserDocuments(limit?: number): Observable<Document[]> {
    let params = new HttpParams().set('owner', 'me');
    if (limit) params = params.set('limit', limit.toString());
    return this.http.get<Document[]>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Error fetching user documents:', error);
        return throwError(() => error);
      })
    );
  }

  getAllDocuments(params?: HttpParams): Observable<Document[]> {
    return this.http.get<Document[]>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Error fetching all documents:', error);
        return throwError(() => error);
      })
    );
  }

  archiveDocument(id: number, isArchived: boolean): Observable<Document> {
    return this.http.patch<Document>(`//archive`, { isArchived }).pipe(
      catchError(error => {
        console.error(`Error archiving document :`, error);
        return throwError(() => error);
      })
    );
  }

  searchDocuments(searchParams: {
    q: string;
    tags?: string;
    sharingLevel?: string;
    fileType?: string;
    fromDate?: string;
    toDate?: string;
    minRating?: number;
    sortBy?: string;
    page?: number;
    size?: number;
  }): Observable<PagedResponse<Document>> {
    let params = new HttpParams();
    Object.keys(searchParams).forEach(key => {
      const value = (searchParams as any)[key];
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get<PagedResponse<Document>>(`/search`, { params }).pipe(
      catchError(error => {
        console.error('Error searching documents:', error);
        return throwError(() => error);
      })
    );
  }

  getDocumentVersions(docId: number): Observable<DocumentVersion[]> {
    return this.http.get<DocumentVersion[]>(`//versions`).pipe(
      catchError(error => {
        console.error(`Error fetching versions for document :`, error);
        return throwError(() => error);
      })
    );
  }

  rateDocument(docId: number, rating: number): Observable<void> {
    return this.http.post<void>(`//rate`, { rating }).pipe(
      catchError(error => {
        console.error(`Error rating document :`, error);
        return throwError(() => error);
      })
    );
  }

  getRelatedDocuments(docId: number): Observable<Document[]> {
    return this.http.get<Document[]>(`//related`).pipe(
      catchError(error => {
        console.error(`Error fetching related documents for :`, error);
        return throwError(() => error);
      })
    );
  }

  generateSummary(content: string): Observable<{ summary: string }> {
    return this.http.post<{ summary: string }>(`/ai/summary`, { content }).pipe(
      catchError(error => {
        console.error('Error generating summary:', error);
        return throwError(() => error);
      })
    );
  }

  suggestTags(content: string): Observable<{ tags: string[] }> {
    return this.http.post<{ tags: string[] }>(`/ai/tags`, { content }).pipe(
      catchError(error => {
        console.error('Error suggesting tags:', error);
        return throwError(() => error);
      })
    );
  }

  getAvailableGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`/groups`).pipe(
      catchError(error => {
        console.error('Error fetching groups:', error);
        return throwError(() => error);
      })
    );
  }
}
