import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Document, Group } from '../models/document.model';

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
  private apiUrl = '/api/search';

  // Mock data for testing
  private mockDocuments: Document[] = [
    {
      id: 1,
      title: 'Angular Best Practices Guide',
      summary: 'Comprehensive guide covering Angular architecture, component design, and performance optimization techniques.',
      file_path: '/files/angular-guide.pdf',
      file_type: 'application/pdf',
      file_size: 2048000,
      owner_id: 1,
      owner_name: 'John Doe',
      sharing_level: 'PUBLIC',
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15'),
      version_number: 1,
      is_archived: false,
      average_rating: 4.5,
      views: 120,
      tags: ['Angular', 'TypeScript', 'Best Practices'],
      group_ids: [1]
    },
    {
      id: 2,
      title: 'Spring Boot REST API Development',
      summary: 'Step-by-step tutorial for building RESTful APIs with Spring Boot, including security and database integration.',
      file_path: '/files/spring-boot-rest.pdf',
      file_type: 'application/pdf',
      file_size: 3145728,
      owner_id: 2,
      owner_name: 'Jane Smith',
      sharing_level: 'PUBLIC',
      created_at: new Date('2024-02-10'),
      updated_at: new Date('2024-02-10'),
      version_number: 1,
      is_archived: false,
      average_rating: 4.8,
      views: 95,
      tags: ['Spring Boot', 'Java', 'REST API', 'Backend'],
      group_ids: [2]
    },
    {
      id: 3,
      title: 'Authentication Implementation Guide',
      summary: 'Complete guide to implementing JWT authentication in modern web applications with best security practices.',
      file_path: '/files/auth-guide.pdf',
      file_type: 'application/pdf',
      file_size: 1572864,
      owner_id: 1,
      owner_name: 'John Doe',
      sharing_level: 'DEPARTMENT',
      created_at: new Date('2024-03-05'),
      updated_at: new Date('2024-03-05'),
      version_number: 1,
      is_archived: false,
      average_rating: 4.7,
      views: 150,
      tags: ['Security', 'Authentication', 'JWT', 'Best Practices'],
      group_ids: []
    },
    {
      id: 4,
      title: 'Database Design Principles',
      summary: 'Essential database design patterns, normalization techniques, and optimization strategies for relational databases.',
      file_path: '/files/database-design.pdf',
      file_type: 'application/pdf',
      file_size: 2621440,
      owner_id: 3,
      owner_name: 'Mike Johnson',
      sharing_level: 'PUBLIC',
      created_at: new Date('2024-01-20'),
      updated_at: new Date('2024-01-20'),
      version_number: 1,
      is_archived: false,
      average_rating: 4.6,
      views: 88,
      tags: ['Database', 'SQL', 'Design Patterns'],
      group_ids: [2, 3]
    },
    {
      id: 5,
      title: 'TypeScript Advanced Features',
      summary: 'Deep dive into advanced TypeScript features including generics, decorators, and type inference.',
      file_path: '/files/typescript-advanced.pdf',
      file_type: 'application/pdf',
      file_size: 1048576,
      owner_id: 2,
      owner_name: 'Jane Smith',
      sharing_level: 'GROUP',
      created_at: new Date('2024-02-15'),
      updated_at: new Date('2024-02-15'),
      version_number: 1,
      is_archived: false,
      average_rating: 4.9,
      views: 200,
      tags: ['TypeScript', 'JavaScript', 'Programming'],
      group_ids: [1]
    },
    {
      id: 6,
      title: 'Testing Strategies for Angular Applications',
      summary: 'Comprehensive testing guide covering unit tests, integration tests, and e2e testing for Angular apps.',
      file_path: '/files/angular-testing.pdf',
      file_type: 'application/pdf',
      file_size: 1835008,
      owner_id: 1,
      owner_name: 'John Doe',
      sharing_level: 'PUBLIC',
      created_at: new Date('2024-03-10'),
      updated_at: new Date('2024-03-10'),
      version_number: 1,
      is_archived: false,
      average_rating: 4.4,
      views: 75,
      tags: ['Angular', 'Testing', 'Jasmine', 'Karma'],
      group_ids: [1, 4]
    },
    {
      id: 7,
      title: 'Microservices Architecture Guide',
      summary: 'Learn how to design and implement microservices architecture with Spring Cloud and Docker.',
      file_path: '/files/microservices.pdf',
      file_type: 'application/pdf',
      file_size: 3670016,
      owner_id: 3,
      owner_name: 'Mike Johnson',
      sharing_level: 'DEPARTMENT',
      created_at: new Date('2024-01-25'),
      updated_at: new Date('2024-01-25'),
      version_number: 1,
      is_archived: false,
      average_rating: 4.8,
      views: 110,
      tags: ['Microservices', 'Spring Cloud', 'Docker', 'Architecture'],
      group_ids: [2, 3]
    },
    {
      id: 8,
      title: 'DevOps Best Practices',
      summary: 'CI/CD pipelines, containerization, and infrastructure as code for modern DevOps practices.',
      file_path: '/files/devops-practices.pdf',
      file_type: 'application/pdf',
      file_size: 2097152,
      owner_id: 4,
      owner_name: 'Sarah Williams',
      sharing_level: 'PUBLIC',
      created_at: new Date('2024-02-20'),
      updated_at: new Date('2024-02-20'),
      version_number: 1,
      is_archived: false,
      average_rating: 4.7,
      views: 130,
      tags: ['DevOps', 'CI/CD', 'Docker', 'Kubernetes'],
      group_ids: [3]
    }
  ];

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
   * TODO: Replace with actual API call when backend is ready
   * GET /api/search?query=...&tags=...&dateFrom=...&dateTo=...&page=...&size=...
   */
  searchDocuments(request: SearchRequest): Observable<SearchResponse> {
    // TODO: Uncomment when backend is ready
    // let params = new HttpParams()
    //   .set('page', request.page.toString())
    //   .set('size', request.pageSize.toString());
    // 
    // if (request.filters.query) params = params.set('query', request.filters.query);
    // if (request.filters.tags?.length) params = params.set('tags', request.filters.tags.join(','));
    // if (request.filters.dateFrom) params = params.set('dateFrom', request.filters.dateFrom.toISOString());
    // if (request.filters.dateTo) params = params.set('dateTo', request.filters.dateTo.toISOString());
    // if (request.filters.sharingLevel) params = params.set('sharingLevel', request.filters.sharingLevel);
    // if (request.filters.groupId) params = params.set('groupId', request.filters.groupId.toString());
    // if (request.filters.sortBy) params = params.set('sortBy', request.filters.sortBy);
    // 
    // return this.http.get<SearchResponse>(`${this.apiUrl}`, { params });

    // Mock implementation
    let filtered = [...this.mockDocuments];

    // Filter by query (search in title and summary)
    if (request.filters.query) {
      const query = request.filters.query.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.summary.toLowerCase().includes(query)
      );
    }

    // Filter by tags
    if (request.filters.tags && request.filters.tags.length > 0) {
      filtered = filtered.filter(doc =>
        doc.tags?.some(tag => request.filters.tags!.includes(tag))
      );
    }

    // Filter by date range
    if (request.filters.dateFrom) {
      filtered = filtered.filter(doc =>
        new Date(doc.created_at) >= request.filters.dateFrom!
      );
    }

    if (request.filters.dateTo) {
      filtered = filtered.filter(doc =>
        new Date(doc.created_at) <= request.filters.dateTo!
      );
    }

    // Filter by sharing level
    if (request.filters.sharingLevel) {
      filtered = filtered.filter(doc =>
        doc.sharing_level === request.filters.sharingLevel
      );
    }

    // Filter by group
    if (request.filters.groupId) {
      filtered = filtered.filter(doc =>
        doc.group_ids?.includes(request.filters.groupId!)
      );
    }

    // Apply sorting
    switch (request.filters.sortBy) {
      case 'recent':
        filtered.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'oldest':
        filtered.sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case 'popular':
        filtered.sort((a, b) =>
          (b.average_rating || 0) - (a.average_rating || 0)
        );
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    // Pagination
    const start = request.page * request.pageSize;
    const end = start + request.pageSize;
    const paginatedResults = filtered.slice(start, end);

    return of({
      documents: paginatedResults,
      totalCount: filtered.length,
      page: request.page,
      totalPages: Math.ceil(filtered.length / request.pageSize)
    }).pipe(delay(300));
  }

  /**
   * Perform AI semantic search
   * TODO: Replace with actual API call when backend is ready
   * GET /api/search/semantic?query=...&page=...&size=...
   */
  semanticSearch(query: string, page: number, pageSize: number): Observable<SearchResponse> {
    // TODO: Uncomment when backend is ready
    // const params = new HttpParams()
    //   .set('query', query)
    //   .set('page', page.toString())
    //   .set('size', pageSize.toString());
    // 
    // return this.http.get<SearchResponse>(`${this.apiUrl}/semantic`, { params });

    // Mock semantic search - simulate AI processing
    console.log('Semantic search query:', query);

    // Simple relevance scoring based on query keywords
    const queryWords = query.toLowerCase().split(' ');
    const scoredDocs = this.mockDocuments.map(doc => {
      let score = 0;
      queryWords.forEach(word => {
        if (doc.title.toLowerCase().includes(word)) score += 3;
        if (doc.summary.toLowerCase().includes(word)) score += 2;
        if (doc.tags?.some(tag => tag.toLowerCase().includes(word))) score += 1;
      });
      return { doc, score };
    });

    // Sort by relevance score
    const sortedDocs = scoredDocs
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.doc);

    // Pagination
    const start = page * pageSize;
    const end = start + pageSize;
    const paginatedResults = sortedDocs.slice(start, end);

    return of({
      documents: paginatedResults,
      totalCount: sortedDocs.length,
      page: page,
      totalPages: Math.ceil(sortedDocs.length / pageSize)
    }).pipe(delay(1000)); // Longer delay to simulate AI processing
  }

  /**
   * Get all available tags for filter dropdown
   * TODO: Replace with actual API call when backend is ready
   * GET /api/tags
   */
  getAllTags(): Observable<string[]> {
    // TODO: Uncomment when backend is ready
    // return this.http.get<string[]>(`${this.apiUrl}/tags`);

    return of(this.mockTags).pipe(delay(200));
  }

  /**
   * Get all groups for filter dropdown
   * TODO: Replace with actual API call when backend is ready
   * GET /api/groups
   */
  getAllGroups(): Observable<Group[]> {
    // TODO: Uncomment when backend is ready
    // return this.http.get<Group[]>(`${this.apiUrl}/groups`);

    return of(this.mockGroups).pipe(delay(200));
  }
}
