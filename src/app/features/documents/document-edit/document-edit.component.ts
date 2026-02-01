import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';
import { Document } from '../../../core/models/document.model';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { DragDropDirective } from '../../../shared/directives/drag-drop.directive';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

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
    MatAutocompleteModule,
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
  private cdr = inject(ChangeDetectorRef);

  editForm!: FormGroup;
  document: Document | null = null;
  selectedFile: File | null = null;
  fileError = '';
  loading = true;
  saving = false;
  generatingSummary = false;
  
  selectedTags: string[] = [];
  availableTags: string[] = [];
  filteredTags$!: Observable<string[]>;
  tagInput = new FormControl('');
  uploadNewVersion = false;

  sharingLevels = [
    { value: 'PUBLIC', label: 'Public - Everyone can access' },
    { value: 'PRIVATE', label: 'Private - Only me' }
  ];

  allowedFileTypes = [
    '.doc', '.docx', '.pdf', '.xls', '.xlsx', 
    '.ppt', '.pptx', '.txt', '.png', '.jpg', '.jpeg', '.gif'
  ];
  maxFileSize = 50 * 1024 * 1024; // 50MB (matching backend spec)

  ngOnInit(): void {
    this.initForm();
    this.loadAvailableTags();
    this.setupTagFilter();
    
    const docId = this.route.snapshot.paramMap.get('id');
    if (docId) {
      this.loadDocument(parseInt(docId));
    }
  }

  initForm(): void {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      summary: ['', [Validators.maxLength(500)]],
      sharingLevel: ['PUBLIC', Validators.required]
    });
  }

  loadDocument(id: number): void {
    console.log('📄 Loading document for edit:', id);
    this.loading = true;
    
    this.documentService.getDocumentById(id).subscribe({
      next: (doc) => {
        console.log('✅ Document loaded:', doc);
        this.document = doc;
        this.loading = false;
        
        // Check if current user is owner
        const currentUser = this.authService.getCurrentUser();
        console.log('👤 Current user:', currentUser);
        console.log('📝 Document owner ID:', doc.ownerId);
        
        if (currentUser && currentUser.id !== doc.ownerId) {
          console.warn('⚠️ User is not owner of this document');
          this.snackBar.open('You do not have permission to edit this document', 'Close', { duration: 3000 });
          this.router.navigate(['/documents', id]);
          return;
        }

        // Pre-fill form
        this.editForm.patchValue({
          title: doc.title,
          summary: doc.summary,
          sharingLevel: doc.sharingLevel
        });

        // Set tags
        this.selectedTags = doc.tags ? [...doc.tags] : [];
        console.log('✅ Form populated with document data');
        
        // Force change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error loading document:', error);
        this.loading = false;
        
        let errorMessage = 'Failed to load document';
        if (error.status === 404) {
          errorMessage = 'Document not found';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to edit this document';
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
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
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileError = '';
    this.uploadNewVersion = false;
  }

  generateSummary(): void {
    if (!this.selectedFile) {
      this.snackBar.open('Please select a file first to generate AI summary', 'Close', { duration: 3000 });
      return;
    }

    this.generatingSummary = true;

    // Create FormData with file
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.documentService.generateSummary(formData).subscribe({
      next: (response) => {
        this.editForm.patchValue({ summary: response.summary });
        this.generatingSummary = false;
        this.snackBar.open('✨ AI summary generated successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error generating summary:', error);
        this.generatingSummary = false;
        let errorMessage = 'Failed to generate AI summary';
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  loadAvailableTags(): void {
    this.documentService.getAllTags().subscribe({
      next: (tags) => {
        // Extract tag names from Tag objects
        this.availableTags = tags.map(tag => typeof tag === 'string' ? tag : tag.name);
      },
      error: (error) => {
        console.error('Error loading tags:', error);
        this.availableTags = [];
      }
    });
  }

  setupTagFilter(): void {
    this.filteredTags$ = this.tagInput.valueChanges.pipe(
      startWith(''),
      map(value => this._filterTags(value || ''))
    );
  }

  private _filterTags(value: string): string[] {
    const filterValue = value.toLowerCase().trim();
    if (!filterValue) {
      return this.availableTags.filter(tag => !this.selectedTags.includes(tag)).slice(0, 10);
    }
    return this.availableTags
      .filter(tag => !this.selectedTags.includes(tag))
      .filter(tag => tag.toLowerCase().includes(filterValue))
      .slice(0, 10);
  }

  selectTag(tag: string): void {
    const trimmedTag = tag.trim();
    if (trimmedTag && !this.selectedTags.includes(trimmedTag)) {
      this.selectedTags.push(trimmedTag);
      this.tagInput.setValue('');
    }
  }

  addCustomTag(): void {
    const tag = this.tagInput.value?.trim();
    if (tag && !this.selectedTags.includes(tag)) {
      this.selectedTags.push(tag);
      // Add to available tags for future use
      if (!this.availableTags.includes(tag)) {
        this.availableTags.push(tag);
      }
      this.tagInput.setValue('');
    }
  }

  removeTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
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
    
    // Create data object for the document metadata
    const documentData: any = {
      title: this.editForm.get('title')?.value,
      summary: this.editForm.get('summary')?.value || '',
      sharingLevel: this.editForm.get('sharingLevel')?.value,
      tags: this.selectedTags
    };

    // Create FormData with 'data' as JSON blob (matching backend API)
    const formData = new FormData();
    const dataBlob = new Blob([JSON.stringify(documentData)], { type: 'application/json' });
    formData.append('data', dataBlob);
    
    // Add file only if user selected a new file (optional)
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
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
}
