# Shared Module Documentation

## Overview
The Shared Module contains reusable UI components that can be used across different feature modules. All components follow Material Design principles and are fully responsive.

## Structure

```
shared/
├── components/
│   ├── header/              # Navigation header with user menu
│   ├── footer/              # Application footer
│   └── document-card/       # Document display card
├── pipes/                   # Shared pipes (placeholder)
├── directives/              # Shared directives (placeholder)
├── shared-test/            # Test component
├── shared.module.ts        # Module configuration
└── index.ts                # Barrel export
```

---

## Components

### 1. HeaderComponent

A responsive navigation header with user authentication features.

#### Selector
```html
<app-header></app-header>
```

#### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `unreadNotifications` | `number` | `0` | Number of unread notifications (shows badge) |
| `currentUser` | `User \| null` | `null` | Current logged-in user object |

#### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `logoutClicked` | `EventEmitter<void>` | Emitted when user clicks logout button |

#### Features
- ✅ Responsive navigation (desktop + mobile hamburger menu)
- ✅ Material Design toolbar
- ✅ Navigation links: Home, Search, My Documents, Favorites, Notifications
- ✅ Notification badge (shows count when > 0)
- ✅ User menu dropdown (Profile, Logout)
- ✅ Login button when user is not authenticated
- ✅ Active route highlighting
- ✅ Accessibility (ARIA labels)

#### Usage Example

```typescript
import { HeaderComponent } from '@/app/shared';
import { AuthService } from '@/app/core';

@Component({
  selector: 'app-layout',
  template: `
    <app-header 
      [unreadNotifications]="unreadCount"
      [currentUser]="currentUser$ | async"
      (logoutClicked)="onLogout()">
    </app-header>
    <router-outlet></router-outlet>
  `
})
export class LayoutComponent {
  unreadCount = 5;
  currentUser$ = inject(AuthService).getCurrentUser$();
  
  onLogout() {
    inject(AuthService).logout();
  }
}
```

#### Styling
- Primary color theme
- Sticky positioning at top
- Box shadow for depth
- Mobile breakpoint: 960px

---

### 2. FooterComponent

A simple, minimalist footer with copyright information.

#### Selector
```html
<app-footer></app-footer>
```

#### Inputs
None

#### Outputs
None

#### Features
- ✅ Copyright text with dynamic year
- ✅ Responsive design
- ✅ Minimalist styling
- ✅ Auto-updates year

#### Usage Example

```typescript
import { FooterComponent } from '@/app/shared';

@Component({
  selector: 'app-layout',
  template: `
    <app-header></app-header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `
})
export class LayoutComponent {}
```

#### Content
```
© 2025 Knowledge Sharing Platform | Student Project
```

---

### 3. DocumentCardComponent

A Material Design card for displaying document information in a grid layout.

#### Selector
```html
<app-document-card></app-document-card>
```

#### Inputs

| Input | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `document` | `Document` | ✅ Yes | - | Document object to display |
| `showActions` | `boolean` | No | `false` | Show action buttons (View, Edit, Delete) |

#### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `cardClicked` | `EventEmitter<number>` | Emitted when card is clicked (emits document ID) |
| `actionClicked` | `EventEmitter<{action: string, documentId: number}>` | Emitted when action button is clicked |

#### Features
- ✅ Document title (2-line truncation)
- ✅ Summary (truncated to 150 characters)
- ✅ Sharing level indicator with emoji and color:
  - 🔒 Private (red)
  - 👥 Group (orange)
  - 🌐 Public (green)
- ✅ Metadata display:
  - File type
  - Owner ID
  - Creation date
  - Version number
- ✅ Star rating display (read-only, 5 stars)
- ✅ Archived badge (if document is archived)
- ✅ Optional action buttons (View, Edit, Delete)
- ✅ Hover elevation effect
- ✅ Fully clickable card
- ✅ Responsive design
- ✅ Tooltip on title

#### Usage Example

**Basic Usage:**
```typescript
import { DocumentCardComponent, Document } from '@/app/shared';

@Component({
  template: `
    <app-document-card
      [document]="myDocument"
      (cardClicked)="navigateToDocument($event)">
    </app-document-card>
  `
})
export class MyComponent {
  myDocument: Document = {
    id: 1,
    title: 'Angular Guide',
    summary: 'Complete guide to Angular...',
    file_path: '/docs/angular.pdf',
    file_type: 'pdf',
    owner_id: 123,
    sharing_level: 'public',
    created_at: new Date(),
    updated_at: new Date(),
    version_number: 1,
    is_archived: false
  };

  navigateToDocument(docId: number) {
    this.router.navigate(['/documents', docId]);
  }
}
```

**With Actions:**
```typescript
@Component({
  template: `
    <app-document-card
      [document]="doc"
      [showActions]="true"
      (cardClicked)="viewDocument($event)"
      (actionClicked)="handleAction($event)">
    </app-document-card>
  `
})
export class DocumentListComponent {
  handleAction(event: {action: string, documentId: number}) {
    switch(event.action) {
      case 'view':
        this.viewDocument(event.documentId);
        break;
      case 'edit':
        this.editDocument(event.documentId);
        break;
      case 'delete':
        this.deleteDocument(event.documentId);
        break;
    }
  }
}
```

**Grid Layout:**
```html
<div class="documents-grid">
  @for (doc of documents; track doc.id) {
    <app-document-card 
      [document]="doc"
      [showActions]="true"
      (cardClicked)="onCardClick($event)"
      (actionClicked)="onAction($event)">
    </app-document-card>
  }
</div>
```

```css
.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}
```

---

## SharedModule

### Configuration

The SharedModule exports all shared components and Material modules for easy reuse.

#### Imports
```typescript
import { SharedModule } from '@/app/shared/shared.module';

@NgModule({
  imports: [SharedModule]
})
export class FeatureModule { }
```

#### Exported Modules
- `CommonModule`
- `RouterModule`
- All Material Design modules used by shared components

#### Exported Components
- `HeaderComponent`
- `FooterComponent`
- `DocumentCardComponent`

---

## Test Page

A dedicated test page is available to verify all shared components.

### Access
Navigate to: `/test-shared`

### Features
- Interactive controls to test component inputs
- Sample document cards
- User authentication toggle
- Notification counter
- Component feature checklist

### Usage
```bash
ng serve
# Navigate to http://localhost:4200/test-shared
```

---

## Design Guidelines

### Responsive Breakpoints
- **Desktop**: > 960px - Full navigation menu
- **Tablet**: 600px - 960px - Responsive adjustments
- **Mobile**: < 600px - Hamburger menu

### Color Palette
- **Primary**: `#3f51b5` (Indigo)
- **Accent**: Material accent colors
- **Warn**: `#f44336` (Red)

### Typography
- Uses Material Design typography
- Font family: Roboto
- Responsive font sizes

### Accessibility
- All components include ARIA labels
- Keyboard navigation support
- Semantic HTML structure
- Color contrast compliance

---

## Integration with Feature Modules

### Example Layout Component

```typescript
import { Component } from '@angular/core';
import { SharedModule } from '@/app/shared/shared.module';
import { AuthService } from '@/app/core';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [SharedModule],
  template: `
    <app-header 
      [unreadNotifications]="notificationCount$ | async"
      [currentUser]="currentUser$ | async"
      (logoutClicked)="logout()">
    </app-header>
    
    <main class="content">
      <router-outlet></router-outlet>
    </main>
    
    <app-footer></app-footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .content {
      flex: 1;
      padding: 24px;
    }
  `]
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  
  currentUser$ = this.authService.getCurrentUser$();
  notificationCount$ = this.notificationService.getUnreadCount$();
  
  logout() {
    this.authService.logout();
  }
}
```

---

## Future Enhancements

### Planned Pipes
- `truncate` - Text truncation pipe
- `timeAgo` - Relative time display
- `fileSize` - Format file sizes

### Planned Directives
- `highlight` - Text highlighting
- `clickOutside` - Click outside detection
- `lazyLoad` - Image lazy loading

### Component Improvements
- Add user avatar support to HeaderComponent
- Add search bar integration to HeaderComponent
- Add pagination to DocumentCard grid
- Add filtering/sorting to DocumentCard grid
- Add skeleton loading states

---

## Testing

### Component Tests

Run tests:
```bash
ng test
```

### Manual Testing
Use the test page at `/test-shared` to manually verify:
1. Header responsiveness (resize browser)
2. User menu functionality
3. Notification badge updates
4. Document card interactions
5. Footer display

---

## Dependencies

### Required Angular Material Modules
- `MatToolbarModule`
- `MatButtonModule`
- `MatIconModule`
- `MatBadgeModule`
- `MatMenuModule`
- `MatCardModule`
- `MatChipsModule`
- `MatTooltipModule`
- `MatDividerModule`

All dependencies are included in SharedModule exports.

---

## Best Practices

1. **Import SharedModule once per feature module**
2. **Use standalone components for lazy loading**
3. **Always provide required inputs**
4. **Handle output events appropriately**
5. **Use Material Design guidelines**
6. **Test responsiveness on multiple screen sizes**
7. **Ensure accessibility compliance**
8. **Keep components simple and focused**

---

## Support

For issues or questions:
1. Check the test page at `/test-shared`
2. Review component source code
3. Check Material Design documentation
4. Review Angular documentation
