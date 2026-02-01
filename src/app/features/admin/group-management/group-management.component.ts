import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { GroupService } from '../../../core/services/group.service';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { GroupResponse, GroupRequest } from '../../../core/models/group.model';
import { UserManagement } from '../../../core/models/admin.model';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-group-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './group-management.component.html',
  styleUrls: ['./group-management.component.scss']
})
export class GroupManagementComponent implements OnInit {
  private groupService = inject(GroupService);
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  groups: GroupResponse[] = [];
  users: UserManagement[] = [];
  loading = true;
  showCreateForm = false;
  editingGroupId: number | null = null;
  
  groupForm: FormGroup;
  displayedColumns: string[] = ['name', 'description', 'members', 'documents', 'created', 'actions'];

  constructor() {
    this.groupForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      userIds: [[]]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    // Load groups and users in parallel
    this.groupService.getAllGroups().subscribe({
      next: (groups) => {
        this.groups = groups;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.loading = false;
        this.cdr.detectChanges();
        
        if (error.status === 403) {
          this.snackBar.open('Access denied - Admin role required', 'Close', { duration: 3000 });
          this.router.navigate(['/home']);
        } else {
          this.snackBar.open('Failed to load groups', 'Close', { duration: 3000 });
        }
      }
    });

    // Load users for member selection
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  showCreateGroupForm(): void {
    this.showCreateForm = true;
    this.editingGroupId = null;
    this.groupForm.reset();
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.editingGroupId = null;
    this.groupForm.reset();
  }

  editGroup(group: GroupResponse): void {
    this.editingGroupId = group.id;
    this.showCreateForm = true;
    
    this.groupForm.patchValue({
      name: group.name,
      description: group.description,
      userIds: []
    });
  }

  onSubmit(): void {
    if (this.groupForm.invalid) {
      this.markFormGroupTouched(this.groupForm);
      return;
    }

    const groupData: GroupRequest = this.groupForm.value;

    if (this.editingGroupId) {
      // Update existing group
      this.groupService.updateGroup(this.editingGroupId, groupData).subscribe({
        next: (response) => {
          this.snackBar.open('Group updated successfully', 'Close', { duration: 3000 });
          this.cancelForm();
          this.loadData();
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Failed to update group', 'Close', { duration: 3000 });
        }
      });
    } else {
      // Create new group
      this.groupService.createGroup(groupData).subscribe({
        next: (response) => {
          this.snackBar.open('Group created successfully', 'Close', { duration: 3000 });
          this.cancelForm();
          this.loadData();
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Failed to create group', 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteGroup(group: GroupResponse): void {
    if (!confirm(`Are you sure you want to delete group "${group.name}"?\n\nThis will remove all members from the group.`)) {
      return;
    }

    this.groupService.deleteGroup(group.id).subscribe({
      next: (response) => {
        this.snackBar.open(response.message, 'Close', { duration: 3000 });
        this.loadData();
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Failed to delete group', 'Close', { duration: 3000 });
      }
    });
  }

  searchGroups(keyword: string): void {
    if (!keyword.trim()) {
      this.loadData();
      return;
    }

    this.loading = true;
    this.groupService.searchGroups(keyword).subscribe({
      next: (groups) => {
        this.groups = groups;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error searching groups:', error);
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Search failed', 'Close', { duration: 3000 });
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get totalMembers(): number {
    return this.groups.reduce((sum, g) => sum + g.memberCount, 0);
  }

  get totalDocuments(): number {
    return this.groups.reduce((sum, g) => sum + g.documentCount, 0);
  }

  get name() { return this.groupForm.get('name'); }
  get description() { return this.groupForm.get('description'); }
}
