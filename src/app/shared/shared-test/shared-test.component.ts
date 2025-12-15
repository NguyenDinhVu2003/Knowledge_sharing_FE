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
      file_path: '/documents/angular-intro.pdf',
      file_type: 'pdf',
      file_size: 1024000,
      owner_id: 1,
      owner_name: 'John Doe',
      sharing_level: 'public',
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-20'),
      version_number: 2,
      is_archived: false,
      average_rating: 4.5
    },
    {
      id: 2,
      title: 'TypeScript Best Practices',
      summary: 'Explore advanced TypeScript patterns and best practices for enterprise applications. This document includes type safety, generics, decorators, and more.',
      file_path: '/documents/typescript-guide.docx',
      file_type: 'docx',
      file_size: 512000,
      owner_id: 2,
      owner_name: 'Jane Smith',
      sharing_level: 'group',
      created_at: new Date('2024-02-10'),
      updated_at: new Date('2024-02-10'),
      version_number: 1,
      is_archived: false,
      average_rating: 4.8
    },
    {
      id: 3,
      title: 'RxJS Operators Deep Dive',
      summary: 'Master RxJS operators with practical examples and use cases. Learn about map, filter, switchMap, and more essential operators.',
      file_path: '/documents/rxjs-operators.pdf',
      file_type: 'pdf',
      file_size: 768000,
      owner_id: 1,
      owner_name: 'John Doe',
      sharing_level: 'private',
      created_at: new Date('2024-03-05'),
      updated_at: new Date('2024-03-15'),
      version_number: 3,
      is_archived: false,
      average_rating: 4.9
    },
    {
      id: 4,
      title: 'Angular Material Design System',
      summary: 'Complete guide to implementing Material Design in Angular applications. Covers theming, components, and responsive layouts.',
      file_path: '/documents/material-design.pdf',
      file_type: 'pdf',
      file_size: 2048000,
      owner_id: 3,
      owner_name: 'Mike Johnson',
      sharing_level: 'public',
      created_at: new Date('2023-12-01'),
      updated_at: new Date('2023-12-01'),
      version_number: 1,
      is_archived: true,
      average_rating: 4.3
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
