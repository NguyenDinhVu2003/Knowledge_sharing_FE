import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Document } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = environment.apiUrl;
  private readonly isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));

  // Mock data for testing (will be replaced with actual API calls)
  private mockDocuments: Document[] = [
    {
      id: 1,
      title: 'Angular Best Practices 2025',
      summary: 'Complete guide to modern Angular development with signals, zoneless change detection, and standalone components. Learn the latest patterns and techniques.',
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
      updated_at: '2025-12-14T10:30:00Z'
    },
    {
      id: 2,
      title: 'TypeScript Advanced Patterns',
      summary: 'Deep dive into TypeScript type system, generics, conditional types, and utility types. Master advanced TypeScript features for better code quality.',
      file_path: '/files/typescript-advanced.pdf',
      file_type: 'PDF',
      file_size: 1536000,
      owner_id: 2,
      owner_name: 'Jane Smith',
      sharing_level: 'PUBLIC',
      version_number: 2,
      is_archived: false,
      average_rating: 4.9,
      created_at: '2025-12-13T14:20:00Z',
      updated_at: '2025-12-13T16:45:00Z'
    },
    {
      id: 3,
      title: 'RxJS Operators Handbook',
      summary: 'Comprehensive guide to RxJS operators with practical examples. Learn how to handle async operations efficiently in Angular applications.',
      file_path: '/files/rxjs-handbook.pdf',
      file_type: 'PDF',
      file_size: 1792000,
      owner_id: 1,
      owner_name: 'John Doe',
      sharing_level: 'DEPARTMENT',
      version_number: 1,
      is_archived: false,
      average_rating: 4.7,
      created_at: '2025-12-12T09:15:00Z',
      updated_at: '2025-12-12T09:15:00Z'
    },
    {
      id: 4,
      title: 'Git Workflow Best Practices',
      summary: 'Learn effective Git branching strategies, commit conventions, and collaborative workflows for team development.',
      file_path: '/files/git-workflow.pdf',
      file_type: 'PDF',
      file_size: 1024000,
      owner_id: 3,
      owner_name: 'Mike Johnson',
      sharing_level: 'PUBLIC',
      version_number: 1,
      is_archived: false,
      average_rating: 4.6,
      created_at: '2025-12-11T11:00:00Z',
      updated_at: '2025-12-11T11:00:00Z'
    },
    {
      id: 5,
      title: 'CSS Grid and Flexbox Mastery',
      summary: 'Master modern CSS layout techniques with Grid and Flexbox. Build responsive, maintainable layouts with practical examples.',
      file_path: '/files/css-layout.pdf',
      file_type: 'PDF',
      file_size: 2304000,
      owner_id: 4,
      owner_name: 'Sarah Wilson',
      sharing_level: 'PUBLIC',
      version_number: 1,
      is_archived: false,
      average_rating: 4.5,
      created_at: '2025-12-10T15:30:00Z',
      updated_at: '2025-12-10T15:30:00Z'
    },
    {
      id: 6,
      title: 'REST API Design Guidelines',
      summary: 'Best practices for designing RESTful APIs: resource naming, HTTP methods, status codes, versioning, and documentation.',
      file_path: '/files/rest-api-design.pdf',
      file_type: 'PDF',
      file_size: 1280000,
      owner_id: 2,
      owner_name: 'Jane Smith',
      sharing_level: 'PUBLIC',
      version_number: 3,
      is_archived: false,
      average_rating: 4.9,
      created_at: '2025-12-09T13:45:00Z',
      updated_at: '2025-12-09T18:20:00Z'
    },
    {
      id: 7,
      title: 'Docker for Developers',
      summary: 'Introduction to Docker containers, images, Docker Compose, and container orchestration for modern application deployment.',
      file_path: '/files/docker-guide.pdf',
      file_type: 'PDF',
      file_size: 3072000,
      owner_id: 1,
      owner_name: 'John Doe',
      sharing_level: 'DEPARTMENT',
      version_number: 1,
      is_archived: false,
      average_rating: 4.4,
      created_at: '2025-12-08T10:00:00Z',
      updated_at: '2025-12-08T10:00:00Z'
    },
    {
      id: 8,
      title: 'Unit Testing with Jest',
      summary: 'Complete guide to unit testing JavaScript applications with Jest. Learn mocking, async testing, and best practices.',
      file_path: '/files/jest-testing.pdf',
      file_type: 'PDF',
      file_size: 1536000,
      owner_id: 5,
      owner_name: 'Tom Anderson',
      sharing_level: 'PUBLIC',
      version_number: 2,
      is_archived: false,
      average_rating: 4.7,
      created_at: '2025-12-07T16:20:00Z',
      updated_at: '2025-12-07T17:30:00Z'
    },
    {
      id: 9,
      title: 'PostgreSQL Performance Tuning',
      summary: 'Optimize PostgreSQL database performance: indexing strategies, query optimization, connection pooling, and monitoring.',
      file_path: '/files/postgres-performance.pdf',
      file_type: 'PDF',
      file_size: 2560000,
      owner_id: 3,
      owner_name: 'Mike Johnson',
      sharing_level: 'PRIVATE',
      version_number: 1,
      is_archived: false,
      average_rating: 4.8,
      created_at: '2025-12-06T09:30:00Z',
      updated_at: '2025-12-06T09:30:00Z'
    },
    {
      id: 10,
      title: 'Microservices Architecture Patterns',
      summary: 'Design patterns for microservices: service discovery, API gateway, circuit breaker, saga pattern, and event-driven architecture.',
      file_path: '/files/microservices-patterns.pdf',
      file_type: 'PDF',
      file_size: 3584000,
      owner_id: 2,
      owner_name: 'Jane Smith',
      sharing_level: 'PUBLIC',
      version_number: 1,
      is_archived: false,
      average_rating: 4.9,
      created_at: '2025-12-05T14:00:00Z',
      updated_at: '2025-12-05T14:00:00Z'
    },
    {
      id: 11,
      title: 'Security Best Practices for Web Apps',
      summary: 'Essential security practices: OWASP Top 10, XSS prevention, CSRF protection, secure authentication, and data encryption.',
      file_path: '/files/web-security.pdf',
      file_type: 'PDF',
      file_size: 2048000,
      owner_id: 4,
      owner_name: 'Sarah Wilson',
      sharing_level: 'PUBLIC',
      version_number: 2,
      is_archived: false,
      average_rating: 4.8,
      created_at: '2025-12-04T11:15:00Z',
      updated_at: '2025-12-04T15:30:00Z'
    },
    {
      id: 12,
      title: 'Node.js Performance Optimization',
      summary: 'Boost Node.js application performance: event loop understanding, clustering, caching strategies, and profiling tools.',
      file_path: '/files/nodejs-performance.pdf',
      file_type: 'PDF',
      file_size: 1792000,
      owner_id: 1,
      owner_name: 'John Doe',
      sharing_level: 'PUBLIC',
      version_number: 1,
      is_archived: false,
      average_rating: 4.6,
      created_at: '2025-12-03T10:45:00Z',
      updated_at: '2025-12-03T10:45:00Z'
    },
    {
      id: 13,
      title: 'Kubernetes Deployment Guide',
      summary: 'Deploy and manage containerized applications with Kubernetes: pods, services, deployments, ConfigMaps, and Secrets.',
      file_path: '/files/kubernetes-guide.pdf',
      file_type: 'PDF',
      file_size: 4096000,
      owner_id: 5,
      owner_name: 'Tom Anderson',
      sharing_level: 'DEPARTMENT',
      version_number: 3,
      is_archived: false,
      average_rating: 4.7,
      created_at: '2025-12-02T13:00:00Z',
      updated_at: '2025-12-02T16:45:00Z'
    },
    {
      id: 14,
      title: 'GraphQL API Development',
      summary: 'Build modern APIs with GraphQL: schema design, resolvers, mutations, subscriptions, and Apollo Server implementation.',
      file_path: '/files/graphql-guide.pdf',
      file_type: 'PDF',
      file_size: 2304000,
      owner_id: 3,
      owner_name: 'Mike Johnson',
      sharing_level: 'PUBLIC',
      version_number: 1,
      is_archived: false,
      average_rating: 4.5,
      created_at: '2025-12-01T09:20:00Z',
      updated_at: '2025-12-01T09:20:00Z'
    },
    {
      id: 15,
      title: 'CI/CD Pipeline with GitHub Actions',
      summary: 'Automate your development workflow with GitHub Actions: build, test, deploy, and release automation strategies.',
      file_path: '/files/github-actions.pdf',
      file_type: 'PDF',
      file_size: 1536000,
      owner_id: 1,
      owner_name: 'John Doe',
      sharing_level: 'PUBLIC',
      version_number: 2,
      is_archived: false,
      average_rating: 4.8,
      created_at: '2025-11-30T14:30:00Z',
      updated_at: '2025-11-30T16:00:00Z'
    }
  ];

  /**
   * Get recent documents (sorted by creation date)
   * @param limit - Number of documents to return (default: 5)
   * @returns Observable of Document array
   */
  getRecentDocuments(limit: number = 5): Observable<Document[]> {
    // MOCK IMPLEMENTATION - Replace with actual API call when backend is ready
    const sortedByDate = [...this.mockDocuments]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
    
    return of(sortedByDate).pipe(delay(500));

    /* ACTUAL API IMPLEMENTATION - Uncomment when backend is ready
    const params = new HttpParams()
      .set('sort', 'recent')
      .set('limit', limit.toString());
    
    return this.http.get<Document[]>(`${this.apiUrl}/documents`, { params });
    */
  }

  /**
   * Get popular documents (sorted by rating)
   * @param limit - Number of documents to return (default: 5)
   * @returns Observable of Document array
   */
  getPopularDocuments(limit: number = 5): Observable<Document[]> {
    // MOCK IMPLEMENTATION - Replace with actual API call when backend is ready
    const sortedByRating = [...this.mockDocuments]
      .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
      .slice(0, limit);
    
    return of(sortedByRating).pipe(delay(500));

    /* ACTUAL API IMPLEMENTATION - Uncomment when backend is ready
    const params = new HttpParams()
      .set('sort', 'popular')
      .set('limit', limit.toString());
    
    return this.http.get<Document[]>(`${this.apiUrl}/documents`, { params });
    */
  }

  /**
   * Get current user's documents
   * @param limit - Number of documents to return (default: 5)
   * @returns Observable of Document array
   */
  getUserDocuments(limit: number = 5): Observable<Document[]> {
    // MOCK IMPLEMENTATION - Replace with actual API call when backend is ready
    // Filter documents by owner_id = 1 (mock admin user)
    const userDocs = this.mockDocuments
      .filter(doc => doc.owner_id === 1)
      .slice(0, limit);
    
    return of(userDocs).pipe(delay(500));

    /* ACTUAL API IMPLEMENTATION - Uncomment when backend is ready
    const params = new HttpParams()
      .set('owner', 'me')
      .set('limit', limit.toString());
    
    return this.http.get<Document[]>(`${this.apiUrl}/documents`, { params });
    */
  }

  /**
   * Get document by ID
   * @param id - Document ID
   * @returns Observable of Document
   */
  getDocumentById(id: number): Observable<Document> {
    // MOCK IMPLEMENTATION - Replace with actual API call when backend is ready
    const document = this.mockDocuments.find(doc => doc.id === id);
    
    if (!document) {
      throw new Error(`Document with id ${id} not found`);
    }
    
    return of(document).pipe(delay(300));

    /* ACTUAL API IMPLEMENTATION - Uncomment when backend is ready
    return this.http.get<Document>(`${this.apiUrl}/documents/${id}`);
    */
  }

  /**
   * Get all documents with optional filters
   * @param params - Query parameters for filtering
   * @returns Observable of Document array
   */
  getAllDocuments(params?: HttpParams): Observable<Document[]> {
    // MOCK IMPLEMENTATION - Replace with actual API call when backend is ready
    return of(this.mockDocuments).pipe(delay(500));

    /* ACTUAL API IMPLEMENTATION - Uncomment when backend is ready
    return this.http.get<Document[]>(`${this.apiUrl}/documents`, { params });
    */
  }
}
