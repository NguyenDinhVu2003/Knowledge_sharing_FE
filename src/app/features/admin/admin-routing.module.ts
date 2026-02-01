import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { UserGroupManagementComponent } from './user-group-management/user-group-management.component';
import { GroupManagementComponent } from './group-management/group-management.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: AdminDashboardComponent,
    title: 'Admin Dashboard'
  },
  {
    path: 'users',
    component: UserManagementComponent,
    title: 'User Management'
  },
  {
    path: 'user-groups',
    component: UserGroupManagementComponent,
    title: 'User-Group Management'
  },
  {
    path: 'groups',
    component: GroupManagementComponent,
    title: 'Group Management'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
