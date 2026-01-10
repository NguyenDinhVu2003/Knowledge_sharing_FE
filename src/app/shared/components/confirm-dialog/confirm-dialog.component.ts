import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  details?: string[];
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-header" [ngClass]="'type-' + data.type">
        <mat-icon class="dialog-icon">
          @if (data.type === 'danger') {
            warning
          } @else if (data.type === 'warning') {
            error_outline
          } @else {
            info
          }
        </mat-icon>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>
      
      <mat-dialog-content>
        <p class="dialog-message">{{ data.message }}</p>
        
        @if (data.details && data.details.length > 0) {
          <div class="dialog-details">
            <p class="details-header">This will permanently delete:</p>
            <ul>
              @for (detail of data.details; track detail) {
                <li>{{ detail }}</li>
              }
            </ul>
          </div>
        }
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button 
          mat-raised-button 
          [color]="data.type === 'danger' ? 'warn' : 'primary'"
          (click)="onConfirm()">
          {{ data.confirmText || 'OK' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      min-width: 400px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 24px 0;
      margin-bottom: 8px;
    }

    .dialog-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .type-danger .dialog-icon {
      color: #f44336;
    }

    .type-warning .dialog-icon {
      color: #ff9800;
    }

    .type-info .dialog-icon {
      color: #2196f3;
    }

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }

    mat-dialog-content {
      padding: 0 24px;
    }

    .dialog-message {
      font-size: 14px;
      line-height: 1.5;
      color: rgba(0, 0, 0, 0.87);
      margin: 16px 0;
    }

    .dialog-details {
      background: #f5f5f5;
      border-left: 4px solid #ff9800;
      padding: 12px 16px;
      border-radius: 4px;
      margin: 16px 0;
    }

    .details-header {
      font-weight: 500;
      margin: 0 0 8px 0;
      font-size: 13px;
      color: rgba(0, 0, 0, 0.7);
    }

    .dialog-details ul {
      margin: 0;
      padding-left: 20px;
    }

    .dialog-details li {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.6);
      line-height: 1.6;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
    }

    button {
      min-width: 80px;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    // Set defaults
    this.data.type = this.data.type || 'warning';
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
