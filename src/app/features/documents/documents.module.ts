import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Routing
import { DocumentsRoutingModule } from './documents-routing.module';

// Components (DocumentListComponent is standalone and imported in routing)
import { DocumentListComponent } from './document-list/document-list.component';

// Shared Components
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { DocumentCardComponent } from '../../shared/components/document-card/document-card.component';

// Directives
import { DragDropDirective } from '../../shared/directives/drag-drop.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DocumentsRoutingModule,
    
    // Material Modules
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatExpansionModule,
    MatListModule,
    MatSnackBarModule,
    
    // Standalone Components
    DocumentListComponent,
    HeaderComponent,
    FooterComponent,
    DocumentCardComponent,
    
    // Directives
    DragDropDirective
  ]
})
export class DocumentsModule { }
