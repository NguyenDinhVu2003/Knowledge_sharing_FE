import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentListComponent } from './document-list/document-list.component';
import { authGuard } from '../../core/guards/auth.guard';

// Lazy load detail, upload, edit components
const routes: Routes = [
  {
    path: '',
    component: DocumentListComponent,
    title: 'Documents - Knowledge Sharing Platform'
  },
  {
    path: 'upload',
    loadComponent: () => import('./document-upload/document-upload.component').then(m => m.DocumentUploadComponent),
    canActivate: [authGuard],
    title: 'Upload Document - Knowledge Sharing Platform'
  },
  {
    path: ':id',
    loadComponent: () => import('./document-detail/document-detail.component').then(m => m.DocumentDetailComponent),
    canActivate: [authGuard],
    title: 'Document Detail - Knowledge Sharing Platform'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./document-edit/document-edit.component').then(m => m.DocumentEditComponent),
    canActivate: [authGuard],
    title: 'Edit Document - Knowledge Sharing Platform'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentsRoutingModule { }
