import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';
import { Group } from '../../../core/models/document.model';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { DragDropDirective } from '../../../shared/directives/drag-drop.directive';

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
  generatingTags = false;
  
  availableGroups: Group[] = [];
  tags: string[] = [];
  newTag = '';

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
  }

  initForm(): void {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      summary: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      sharingLevel: ['PUBLIC', Validators.required],
      groupIds: [[]]
    });

    // Watch sharing level changes
    this.uploadForm.get('sharingLevel')?.valueChanges.subscribe(level => {
      const groupControl = this.uploadForm.get('groupIds');
      if (level === 'GROUP') {
        groupControl?.setValidators([Validators.required]);
      } else {
        groupControl?.clearValidators();
        groupControl?.setValue([]);
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
    const title = this.uploadForm.get('title')?.value;
    if (!title) {
      this.snackBar.open('Please enter a title first', 'Close', { duration: 3000 });
      return;
    }

    this.generatingSummary = true;
    this.documentService.generateSummary(title).subscribe({
      next: (summary) => {
        this.uploadForm.patchValue({ summary });
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
    const content = this.uploadForm.get('title')?.value + ' ' + this.uploadForm.get('summary')?.value;
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
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('title', this.uploadForm.get('title')?.value);
    formData.append('summary', this.uploadForm.get('summary')?.value);
    formData.append('sharing_level', this.uploadForm.get('sharingLevel')?.value);
    formData.append('tags', JSON.stringify(this.tags));
    
    const groupIds = this.uploadForm.get('groupIds')?.value;
    if (groupIds && groupIds.length > 0) {
      formData.append('group_ids', JSON.stringify(groupIds));
    }

    // Get current user
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      formData.append('owner_id', currentUser.id.toString());
    }

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

  get showGroupSelection(): boolean {
    return this.uploadForm.get('sharingLevel')?.value === 'GROUP';
  }
}
