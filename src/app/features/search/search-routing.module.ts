import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./search.component').then(m => m.SearchComponent),
    canActivate: [authGuard],
    title: 'Search Documents - Knowledge Sharing Platform'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchRoutingModule { }
