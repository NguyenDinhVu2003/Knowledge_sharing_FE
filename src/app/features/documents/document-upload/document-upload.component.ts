import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { DragDropDirective } from '../../../shared/directives/drag-drop.directive';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-document-upload',
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
    HeaderComponent,
    FooterComponent,
    DragDropDirective
  ],
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss']
})
export class DocumentUploadComponent implements OnInit {
  private fb = inject(FormBuilder);
  private documentService = inject(DocumentService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  uploadForm!: FormGroup;
  selectedFile: File | null = null;
  fileError = '';
  uploading = false;
  generatingSummary = false;
  
  selectedTags: string[] = [];
  availableTags: string[] = [];
  filteredTags$!: Observable<string[]>;
  tagInput = new FormControl('');

  sharingLevels = [
    { value: 'PUBLIC', label: 'Public - Everyone can access' },
    { value: 'DEPARTMENT', label: 'Department - Department members only' },
    { value: 'PRIVATE', label: 'Private - Only me' }
  ];

  allowedFileTypes = [
    '.doc', '.docx', '.pdf', '.xls', '.xlsx', 
    '.ppt', '.pptx', '.txt', '.png', '.jpg', '.jpeg', '.gif'
  ];
  maxFileSize = 10 * 1024 * 1024; // 10MB

  ngOnInit(): void {
    this.initForm();
    this.loadAvailableTags();
    this.setupTagFilter();
  }

  initForm(): void {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      summary: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      sharingLevel: ['PUBLIC', Validators.required]
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
    
    // Auto-fill title if empty
    if (!this.uploadForm.get('title')?.value) {
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      this.uploadForm.patchValue({ title: fileName });
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileError = '';
  }

  generateSummary(): void {
    if (!this.selectedFile) {
      this.snackBar.open('Please select a file first', 'Close', { duration: 3000 });
      return;
    }

    this.generatingSummary = true;

    // Create FormData with file
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.documentService.generateSummary(formData).subscribe({
      next: (response) => {
        this.uploadForm.patchValue({ summary: response.summary });
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
    if (this.uploadForm.invalid) {
      Object.keys(this.uploadForm.controls).forEach(key => {
        this.uploadForm.get(key)?.markAsTouched();
      });
      this.snackBar.open('Please fill all required fields correctly', 'Close', { duration: 3000 });
      return;
    }

    if (!this.selectedFile) {
      this.fileError = 'Please select a file to upload';
      return;
    }

    this.uploading = true;
    
    // Create FormData according to backend API contract
    // Part 1: data (application/json)
    const documentData = {
      title: this.uploadForm.get('title')?.value,
      summary: this.uploadForm.get('summary')?.value,
      sharingLevel: this.uploadForm.get('sharingLevel')?.value,
      tags: this.selectedTags
    };
    
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(documentData)], { type: 'application/json' }));
    // Part 2: file (multipart file)
    formData.append('file', this.selectedFile);

    this.documentService.uploadDocument(formData).subscribe({
      next: (document) => {
        this.uploading = false;
        this.snackBar.open('Document uploaded successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/documents', document.id]);
      },
      error: (error) => {
        console.error('Error uploading document:', error);
        this.uploading = false;
        this.snackBar.open('Failed to upload document', 'Close', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/documents']);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
