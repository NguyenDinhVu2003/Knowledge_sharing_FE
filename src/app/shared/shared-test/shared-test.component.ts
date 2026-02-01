import { Component, signal } from '@angular/core';
import { SharedModule } from '../shared.module';
import { User, Document } from '../../core/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shared-test',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './shared-test.component.html',
  styleUrl: './shared-test.component.scss'
})
export class SharedTestComponent {
  // Mock data for testing
  unreadNotifications = signal(5);
  
  currentUser = signal<User | null>({
    id: 1,
    username: 'john.doe',
    email: 'john.doe@example.com',
    role: 'USER'
  });

  sampleDocuments = signal<Document[]>([
    {
      id: 1,
      title: 'Introduction to Angular Components',
      summary: 'This comprehensive guide covers the fundamentals of Angular components, including component lifecycle, data binding, and component communication. Learn how to build reusable and maintainable components.',
      filePath: '/documents/angular-intro.pdf',
      fileType: 'PDF',
      fileSize: 1024000,
      ownerId: 1,
      ownerUsername: 'John Doe',
      sharingLevel: 'PUBLIC',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
      versionNumber: 2,
      isArchived: false,
      averageRating: 4.5,
      ratingCount: 10,
      tags: ['Angular', 'Components']
    },
    {
      id: 2,
      title: 'TypeScript Best Practices',
      summary: 'Explore advanced TypeScript patterns and best practices for enterprise applications. This document includes type safety, generics, decorators, and more.',
      filePath: '/documents/typescript-guide.docx',
      fileType: 'DOCX',
      fileSize: 512000,
      ownerId: 2,
      ownerUsername: 'Jane Smith',
      sharingLevel: 'PUBLIC',
      createdAt: '2024-02-10T00:00:00Z',
      updatedAt: '2024-02-10T00:00:00Z',
      versionNumber: 1,
      isArchived: false,
      averageRating: 4.8,
      ratingCount: 5,
      tags: ['TypeScript', 'Best Practices']
    },
    {
      id: 3,
      title: 'RxJS Operators Deep Dive',
      summary: 'Master RxJS operators with practical examples and use cases. Learn about map, filter, switchMap, and more essential operators.',
      filePath: '/documents/rxjs-operators.pdf',
      fileType: 'PDF',
      fileSize: 768000,
      ownerId: 1,
      ownerUsername: 'John Doe',
      sharingLevel: 'PRIVATE',
      createdAt: '2024-03-05T00:00:00Z',
      updatedAt: '2024-03-15T00:00:00Z',
      versionNumber: 3,
      isArchived: false,
      averageRating: 4.9,
      ratingCount: 15,
      tags: ['RxJS', 'Operators']
    },
    {
      id: 4,
      title: 'Angular Material Design System',
      summary: 'Complete guide to implementing Material Design in Angular applications. Covers theming, components, and responsive layouts.',
      filePath: '/documents/material-design.pdf',
      fileType: 'PDF',
      fileSize: 2048000,
      ownerId: 3,
      ownerUsername: 'Mike Johnson',
      sharingLevel: 'PUBLIC',
      createdAt: '2023-12-01T00:00:00Z',
      updatedAt: '2023-12-01T00:00:00Z',
      versionNumber: 1,
      isArchived: true,
      averageRating: 4.3,
      ratingCount: 8,
      tags: ['Angular', 'Material']
    }
  ]);

  constructor(private router: Router) {}

  onLogout(): void {
    console.log('Logout clicked');
    alert('Logout functionality - will redirect to login page');
  }

  onCardClick(documentId: number): void {
    console.log('Document card clicked:', documentId);
    alert(`Navigating to document ${documentId}`);
  }

  onActionClick(event: { action: string; documentId: number }): void {
    console.log('Action clicked:', event);
    alert(`Action: ${event.action} on document ${event.documentId}`);
  }

  toggleUser(): void {
    if (this.currentUser()) {
      this.currentUser.set(null);
    } else {
      this.currentUser.set({
        id: 1,
        username: 'john.doe',
        email: 'john.doe@example.com',
        role: 'USER'
      });
    }
  }

  addNotification(): void {
    this.unreadNotifications.update(count => count + 1);
  }

  clearNotifications(): void {
    this.unreadNotifications.set(0);
  }
}
