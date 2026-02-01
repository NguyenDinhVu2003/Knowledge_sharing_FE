import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { GroupService } from '../../../core/services/group.service';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { GroupResponse } from '../../../core/models/group.model';
import { UserManagement } from '../../../core/models/admin.model';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { forkJoin } from 'rxjs';

interface UserGroupAssignment {
  user: UserManagement;
  assignedGroups: GroupResponse[];
  availableGroups: GroupResponse[];
}

@Component({
  selector: 'app-user-group-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatListModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './user-group-management.component.html',
  styleUrls: ['./user-group-management.component.scss']
})
export class UserGroupManagementComponent implements OnInit {
  private groupService = inject(GroupService);
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  users: UserManagement[] = [];
  allGroups: GroupResponse[] = [];
  loading = true;
  selectedUserId: number | null = null;
  selectedUser: UserManagement | null = null;
  userAssignedGroups: GroupResponse[] = [];
  selectedGroupsToAdd: number[] = [];
  processing = false;

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Load all users and groups
   */
  loadData(): void {
    this.loading = true;
    
    forkJoin({
      users: this.adminService.getAllUsers(),
      groups: this.groupService.getAllGroups()
    }).subscribe({
      next: (result) => {
        this.users = result.users;
        this.allGroups = result.groups;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.loading = false;
        this.cdr.detectChanges();
        
        if (error.status === 403) {
          this.snackBar.open('Access denied - Admin role required', 'Close', { duration: 3000 });
          this.router.navigate(['/home']);
        } else {
          this.snackBar.open('Failed to load data', 'Close', { duration: 3000 });
        }
      }
    });
  }

  /**
   * Khi chọn user, load các group mà user đang tham gia
   */
  onUserSelected(): void {
    if (!this.selectedUserId) {
      this.selectedUser = null;
      this.userAssignedGroups = [];
      this.selectedGroupsToAdd = [];
      return;
    }

    this.selectedUser = this.users.find(u => u.id === this.selectedUserId) || null;
    
    if (this.selectedUser) {
      this.loadUserGroups();
    }
  }

  /**
   * Load danh sách groups mà user đang là thành viên
   */
  loadUserGroups(): void {
    if (!this.selectedUser) return;

    // Filter groups where user is a member
    this.userAssignedGroups = this.allGroups.filter(group => 
      group.memberUsernames.includes(this.selectedUser!.username)
    );
    
    this.cdr.detectChanges();
  }

  /**
   * Lấy danh sách groups chưa được assign cho user
   */
  get availableGroupsForUser(): GroupResponse[] {
    if (!this.selectedUser) return [];
    
    return this.allGroups.filter(group => 
      !group.memberUsernames.includes(this.selectedUser!.username)
    );
  }

  /**
   * Add selected groups to user
   */
  addGroupsToUser(): void {
    if (!this.selectedUserId || this.selectedGroupsToAdd.length === 0) {
      this.snackBar.open('Please select at least one group', 'Close', { duration: 3000 });
      return;
    }

    this.processing = true;
    const groupsToAdd = this.selectedGroupsToAdd;
    const totalGroups = groupsToAdd.length;
    let completedCount = 0;
    let successCount = 0;
    let failedGroups: string[] = [];

    // Add user to each selected group
    groupsToAdd.forEach(groupId => {
      this.groupService.addMemberToGroup(groupId, this.selectedUserId!).subscribe({
        next: (response) => {
          completedCount++;
          successCount++;
          
          if (completedCount === totalGroups) {
            this.onAddComplete(successCount, failedGroups);
          }
        },
        error: (error) => {
          completedCount++;
          const groupName = this.allGroups.find(g => g.id === groupId)?.name || `Group ${groupId}`;
          failedGroups.push(groupName);
          console.error(`Error adding user to ${groupName}:`, error);
          
          if (completedCount === totalGroups) {
            this.onAddComplete(successCount, failedGroups);
          }
        }
      });
    });
  }

  /**
   * Handler khi hoàn thành việc add groups
   */
  private onAddComplete(successCount: number, failedGroups: string[]): void {
    this.processing = false;
    this.selectedGroupsToAdd = [];
    
    // Reload data
    this.loadData();
    
    if (this.selectedUserId) {
      this.onUserSelected();
    }

    // Show result message
    if (failedGroups.length === 0) {
      this.snackBar.open(
        `Successfully added user to ${successCount} group(s)`, 
        'Close', 
        { duration: 3000 }
      );
    } else {
      this.snackBar.open(
        `Added to ${successCount} groups. Failed: ${failedGroups.join(', ')}`, 
        'Close', 
        { duration: 5000 }
      );
    }
  }

  /**
   * Remove user from a group
   */
  removeUserFromGroup(group: GroupResponse): void {
    if (!this.selectedUserId || !this.selectedUser) return;

    if (!confirm(`Remove ${this.selectedUser.username} from group "${group.name}"?`)) {
      return;
    }

    this.processing = true;
    
    this.groupService.removeMemberFromGroup(group.id, this.selectedUserId).subscribe({
      next: (response) => {
        this.processing = false;
        this.snackBar.open(response.message, 'Close', { duration: 3000 });
        
        // Reload data
        this.loadData();
        
        if (this.selectedUserId) {
          this.onUserSelected();
        }
      },
      error: (error) => {
        this.processing = false;
        console.error('Error removing user from group:', error);
        this.snackBar.open(error.message || 'Failed to remove user from group', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Navigate to group management
   */
  goToGroupManagement(): void {
    this.router.navigate(['/admin/groups']);
  }

  /**
   * Get role badge color
   */
  getRoleBadgeColor(role: string): string {
    return role === 'ADMIN' ? 'warn' : 'primary';
  }
}
