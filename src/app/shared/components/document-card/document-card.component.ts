import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Document } from '../../../core/models';

@Component({
  selector: 'app-document-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './document-card.component.html',
  styleUrl: './document-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentCardComponent {
  @Input({ required: true }) document!: Document;
  @Input() showActions: boolean = false;
  @Input() currentUserId: number | null = null;

  @Output() cardClicked = new EventEmitter<number>();
  @Output() actionClicked = new EventEmitter<{ action: string; documentId: number }>();

  /**
   * Check if current user is the owner of the document
   */
  isOwner(): boolean {
    return this.currentUserId !== null && this.document.ownerId === this.currentUserId;
  }

  /**
   * Get truncated summary (max 150 characters)
   */
  getTruncatedSummary(): string {
    if (!this.document.summary) return '';
    
    if (this.document.summary.length <= 150) {
      return this.document.summary;
    }
    
    return this.document.summary.substring(0, 147) + '...';
  }

  /**
   * Get sharing level icon and label
   */
  getSharingLevelInfo(): { icon: string; label: string; color: string } {
    const level = this.document.sharingLevel?.toLowerCase() || 'public';
    switch (level) {
      case 'private':
        return { icon: '🔒', label: 'Private', color: '#f44336' };
      case 'group':
        return { icon: '👥', label: 'Group', color: '#ff9800' };
      case 'public':
        return { icon: '🌐', label: 'Public', color: '#4caf50' };
      default:
        return { icon: '📄', label: 'Unknown', color: '#9e9e9e' };
    }
  }

  /**
   * Format date to readable string
   */
  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Handle card click
   */
  onCardClick(): void {
    this.cardClicked.emit(this.document.id);
  }

  /**
   * Handle action button click
   */
  onActionClick(action: string, event: Event): void {
    event.stopPropagation(); // Prevent card click
    this.actionClicked.emit({
      action,
      documentId: this.document.id
    });
  }

  /**
   * Generate array for star rating display
   */
  getStarArray(): number[] {
    return Array(5).fill(0);
  }

  /**
   * Check if star should be filled (for rating display)
   */
  isStarFilled(index: number): boolean {
    const rating = this.document.averageRating || 0;
    return index < Math.round(rating);
  }
}
