import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { noAuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [noAuthGuard],
    title: 'Login - Knowledge Sharing Platform'
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [noAuthGuard],
    title: 'Register - Knowledge Sharing Platform'
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
