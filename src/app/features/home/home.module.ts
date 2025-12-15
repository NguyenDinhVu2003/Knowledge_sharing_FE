import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Material Modules
import { MatButtonModule } from '@angular/material/button';

// Routing
import { HomeRoutingModule } from './home-routing.module';

// Components (imported as standalone)
import { HomeComponent } from './home.component';

// Shared Components (already standalone)
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { DocumentCardComponent } from '../../shared/components/document-card/document-card.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    HomeRoutingModule,
    
    // Material Modules
    MatButtonModule,
    
    // Standalone Components
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    DocumentCardComponent
  ]
})
export class HomeModule { }
