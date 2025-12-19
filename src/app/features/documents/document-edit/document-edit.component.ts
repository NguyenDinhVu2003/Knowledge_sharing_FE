import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';
import { Document, Group } from '../../../core/models/document.model';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { DragDropDirective } from '../../../shared/directives/drag-drop.directive';

@Component({
  selector: 'app-document-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatCheckboxModule,
    HeaderComponent,
    FooterComponent,
    DragDropDirective
  ],
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.scss']
})
export class DocumentEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private documentService = inject(DocumentService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  editForm!: FormGroup;
  document: Document | null = null;
  selectedFile: File | null = null;
  fileError = '';
  loading = true;
  saving = false;
  generatingSummary = false;
  generatingTags = false;
  
  availableGroups: Group[] = [];
  tags: string[] = [];
  newTag = '';
  uploadNewVersion = false;

  sharingLevels = [
    { value: 'PUBLIC', label: 'Public - Everyone can access' },
    { value: 'DEPARTMENT', label: 'Department - Department members only' },
    { value: 'GROUP', label: 'Group - Selected groups only' },
    { value: 'PRIVATE', label: 'Private - Only me' }
  ];

  allowedFileTypes = [
    '.doc', '.docx', '.pdf', '.xls', '.xlsx', 
    '.ppt', '.pptx', '.txt', '.png', '.jpg', '.jpeg', '.gif'
  ];
  maxFileSize = 10 * 1024 * 1024; // 10MB

  ngOnInit(): void {
    this.initForm();
    this.loadGroups();
    
    const docId = this.route.snapshot.paramMap.get('id');
    if (docId) {
      this.loadDocument(parseInt(docId));
    }
  }

  initForm(): void {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      summary: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      sharingLevel: ['PUBLIC', Validators.required],
      groupIds: [[]],
      versionNotes: ['', [Validators.maxLength(500)]]
    });

    // Watch sharing level changes
    this.editForm.get('sharingLevel')?.valueChanges.subscribe(level => {
      const groupControl = this.editForm.get('groupIds');
      if (level === 'GROUP') {
        groupControl?.setValidators([Validators.required]);
      } else {
        groupControl?.clearValidators();
      }
      groupControl?.updateValueAndValidity();
    });
  }

  loadGroups(): void {
    this.documentService.getAvailableGroups().subscribe({
      next: (groups) => {
        this.availableGroups = groups;
      },
      error: (error) => {
        console.error('Error loading groups:', error);
      }
    });
  }

  loadDocument(id: number): void {
    this.loading = true;
    this.documentService.getDocumentById(id).subscribe({
      next: (doc) => {
        this.document = doc;
        this.loading = false;
        
        // Check if current user is owner
        const currentUser = this.authService.getCurrentUser();
        if (currentUser?.id !== doc.ownerId) {
          this.snackBar.open('You do not have permission to edit this document', 'Close', { duration: 3000 });
          this.router.navigate(['/documents', id]);
          return;
        }

        // Pre-fill form
        this.editForm.patchValue({
          title: doc.title,
          summary: doc.summary,
          sharingLevel: doc.sharingLevel,
          groupIds: doc.groupIds || []
        });

        // Set tags
        this.tags = doc.tags ? [...doc.tags] : [];
      },
      error: (error) => {
        console.error('Error loading document:', error);
        this.loading = false;
        this.snackBar.open('Failed to load document', 'Close', { duration: 3000 });
        this.router.navigate(['/documents']);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onFileDropped(files: FileList): void {
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  handleFile(file: File): void {
    this.fileError = '';
    this.selectedFile = null;

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.allowedFileTypes.includes(fileExtension)) {
      this.fileError = `Invalid file type. Allowed types: ${this.allowedFileTypes.join(', ')}`;
      return;
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      this.fileError = `File size exceeds ${this.formatFileSize(this.maxFileSize)} limit`;
      return;
    }

    this.selectedFile = file;
    this.uploadNewVersion = true;
    
    // Make version notes required when uploading new version
    this.editForm.get('versionNotes')?.setValidators([Validators.required, Validators.maxLength(500)]);
    this.editForm.get('versionNotes')?.updateValueAndValidity();
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileError = '';
    this.uploadNewVersion = false;
    
    // Make version notes optional again
    this.editForm.get('versionNotes')?.setValidators([Validators.maxLength(500)]);
    this.editForm.get('versionNotes')?.updateValueAndValidity();
  }

  generateSummary(): void {
    const title = this.editForm.get('title')?.value;
    if (!title) {
      this.snackBar.open('Please enter a title first', 'Close', { duration: 3000 });
      return;
    }

    this.generatingSummary = true;
    this.documentService.generateSummary(title).subscribe({
      next: (summary) => {
        this.editForm.patchValue({ summary });
        this.generatingSummary = false;
        this.snackBar.open('AI summary generated', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error generating summary:', error);
        this.generatingSummary = false;
        this.snackBar.open('Failed to generate summary', 'Close', { duration: 3000 });
      }
    });
  }

  generateTags(): void {
    const content = this.editForm.get('title')?.value + ' ' + this.editForm.get('summary')?.value;
    if (!content.trim()) {
      this.snackBar.open('Please enter title and summary first', 'Close', { duration: 3000 });
      return;
    }

    this.generatingTags = true;
    this.documentService.suggestTags(content).subscribe({
      next: (response) => {
        // Add only new tags
        response.tags.forEach((tag: string) => {
          if (!this.tags.includes(tag)) {
            this.tags.push(tag);
          }
        });
        this.generatingTags = false;
        this.snackBar.open('AI tags suggested', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error generating tags:', error);
        this.generatingTags = false;
        this.snackBar.open('Failed to generate tags', 'Close', { duration: 3000 });
      }
    });
  }

  addTag(): void {
    const tag = this.newTag.trim();
    if (tag && !this.tags.includes(tag)) {
      this.tags.push(tag);
      this.newTag = '';
    }
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      Object.keys(this.editForm.controls).forEach(key => {
        this.editForm.get(key)?.markAsTouched();
      });
      this.snackBar.open('Please fill all required fields correctly', 'Close', { duration: 3000 });
      return;
    }

    if (!this.document) return;

    this.saving = true;
    
    // Create FormData
    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }
    formData.append('title', this.editForm.get('title')?.value);
    formData.append('summary', this.editForm.get('summary')?.value);
    formData.append('sharing_level', this.editForm.get('sharingLevel')?.value);
    formData.append('tags', JSON.stringify(this.tags));
    
    const groupIds = this.editForm.get('groupIds')?.value;
    if (groupIds && groupIds.length > 0) {
      formData.append('group_ids', JSON.stringify(groupIds));
    }

    const versionNotes = this.editForm.get('versionNotes')?.value;
    if (versionNotes) {
      formData.append('version_notes', versionNotes);
    }

    this.documentService.updateDocument(this.document.id, formData).subscribe({
      next: (updatedDoc) => {
        this.saving = false;
        this.snackBar.open('Document updated successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/documents', updatedDoc.id]);
      },
      error: (error) => {
        console.error('Error updating document:', error);
        this.saving = false;
        this.snackBar.open('Failed to update document', 'Close', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    if (this.document) {
      this.router.navigate(['/documents', this.document.id]);
    } else {
      this.router.navigate(['/documents']);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  get showGroupSelection(): boolean {
    return this.editForm.get('sharingLevel')?.value === 'GROUP';
  }
}
