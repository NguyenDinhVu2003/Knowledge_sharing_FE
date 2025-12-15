import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

// Shared Components (imported as standalone)
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { DocumentCardComponent } from './components/document-card/document-card.component';

// Material modules array for reexport
const MATERIAL_MODULES = [
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatBadgeModule,
  MatMenuModule,
  MatCardModule,
  MatChipsModule,
  MatTooltipModule,
  MatDividerModule
];

// Shared components array
const SHARED_COMPONENTS = [
  HeaderComponent,
  FooterComponent,
  DocumentCardComponent
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ...MATERIAL_MODULES,
    ...SHARED_COMPONENTS // Import standalone components
  ],
  exports: [
    // Export common modules for reuse
    CommonModule,
    RouterModule,
    
    // Export Material modules for reuse in feature modules
    ...MATERIAL_MODULES,
    
    // Export shared components
    ...SHARED_COMPONENTS
  ]
})
export class SharedModule { }
