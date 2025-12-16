import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { authGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  { 
    path: '', 
    component: NotificationListComponent,
    canActivate: [authGuard],
    title: 'Notifications'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationsRoutingModule {}
