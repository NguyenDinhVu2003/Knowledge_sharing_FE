import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../components/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private dialog = inject(MatDialog);

  /**
   * Opens a confirmation dialog
   * @param data Dialog configuration
   * @returns Observable that emits true if confirmed, false if cancelled
   */
  confirm(data: ConfirmDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: data,
      disableClose: false,
      autoFocus: true
    });

    return dialogRef.afterClosed();
  }

  /**
   * Quick helper for delete confirmations
   */
  confirmDelete(itemName: string, details?: string[]): Observable<boolean> {
    return this.confirm({
      title: `Delete ${itemName}?`,
      message: `Are you sure you want to delete this ${itemName}? This action cannot be undone.`,
      details: details,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
  }

  /**
   * Quick helper for role change confirmations
   */
  confirmRoleChange(username: string, newRole: string, description: string): Observable<boolean> {
    return this.confirm({
      title: `Change role to ${newRole}?`,
      message: `Change role of "${username}" to ${newRole}?`,
      details: [description],
      confirmText: 'Change Role',
      cancelText: 'Cancel',
      type: 'warning'
    });
  }
}
