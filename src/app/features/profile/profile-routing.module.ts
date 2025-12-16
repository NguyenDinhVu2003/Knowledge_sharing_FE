import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserInterestsComponent } from './user-interests/user-interests.component';
import { authGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  { 
    path: '', 
    component: UserInterestsComponent, 
    canActivate: [authGuard],
    title: 'Profile & Interests'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule {}
