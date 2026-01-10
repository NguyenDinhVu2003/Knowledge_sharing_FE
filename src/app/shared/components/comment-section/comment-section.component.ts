import { Component, Input, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { CommentService } from '../../../core/services/comment.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { Comment, CreateCommentRequest, UpdateCommentRequest } from '../../../core/models/comment.model';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentSectionComponent implements OnInit {
  @Input() documentId!: number;

  private commentService = inject(CommentService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private confirmDialog = inject(ConfirmDialogService);

  comments: Comment[] = [];
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  loading = false;
  first = true;
  last = false;

  // New comment
  newCommentContent = '';
  postingComment = false;

  // Edit mode
  editingCommentId: number | null = null;
  editContent = '';

  // Reply mode
  replyToCommentId: number | null = null;
  replyToUsername: string = ''; // For mentioning user
  replyContent = '';
  postingReply = false;

  // Loading states for replies
  loadingReplies = new Set<number>();
  
  // Character limits
  readonly MAX_CHARS = 2000;

  ngOnInit(): void {
    if (!this.documentId) {
      console.error('Document ID is required for comment section');
      return;
    }
    this.loadComments();
  }

  /**
   * Load comments with pagination
   */
  loadComments(): void {
    this.loading = true;
    this.commentService.getComments(this.documentId, this.page, this.size)
      .subscribe({
        next: (response) => {
          this.comments = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.first = response.first;
          this.last = response.last;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading comments:', error);
          this.snackBar.open('Failed to load comments', 'Close', { duration: 3000 });
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Post new comment
   */
  postComment(): void {
    if (!this.newCommentContent.trim()) {
      this.snackBar.open('Comment content cannot be empty', 'Close', { duration: 2000 });
      return;
    }

    if (this.newCommentContent.length > this.MAX_CHARS) {
      this.snackBar.open(`Comment cannot exceed ${this.MAX_CHARS} characters`, 'Close', { duration: 3000 });
      return;
    }

    this.postingComment = true;
    const request: CreateCommentRequest = {
      content: this.newCommentContent,
      parentCommentId: null
    };

    this.commentService.createComment(this.documentId, request)
      .subscribe({
        next: (comment) => {
          this.comments.unshift(comment); // Add to top
          this.totalElements++;
          this.newCommentContent = '';
          this.postingComment = false;
          this.snackBar.open('Comment posted successfully', 'Close', { duration: 2000 });
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error posting comment:', error);
          const errorMsg = error.error?.message || 'Failed to post comment';
          this.snackBar.open(errorMsg, 'Close', { duration: 3000 });
          this.postingComment = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Post reply to a comment
   */
  postReply(parentCommentId: number): void {
    if (!this.replyContent.trim()) {
      this.snackBar.open('Reply content cannot be empty', 'Close', { duration: 2000 });
      return;
    }

    if (this.replyContent.length > this.MAX_CHARS) {
      this.snackBar.open(`Reply cannot exceed ${this.MAX_CHARS} characters`, 'Close', { duration: 3000 });
      return;
    }

    this.postingReply = true;
    const request: CreateCommentRequest = {
      content: this.replyContent,
      parentCommentId: parentCommentId
    };

    this.commentService.createComment(this.documentId, request)
      .subscribe({
        next: (reply) => {
          const parent = this.comments.find(c => c.id === parentCommentId);
          if (parent) {
            parent.replyCount++;
            // If replies are already loaded, add the new reply
            if (parent.replies) {
              parent.replies.push(reply);
            } else {
              // Auto-load replies after posting
              this.loadReplies(parentCommentId);
            }
          }
          this.replyContent = '';
          this.replyToCommentId = null;
          this.replyToUsername = '';
          this.postingReply = false;
          this.snackBar.open('Reply posted successfully', 'Close', { duration: 2000 });
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error posting reply:', error);
          const errorMsg = error.error?.message || 'Failed to post reply';
          this.snackBar.open(errorMsg, 'Close', { duration: 3000 });
          this.postingReply = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Load replies for a comment
   */
  loadReplies(commentId: number): void {
    this.loadingReplies.add(commentId);
    this.cdr.detectChanges();

    this.commentService.getReplies(this.documentId, commentId)
      .subscribe({
        next: (replies) => {
          const comment = this.comments.find(c => c.id === commentId);
          if (comment) {
            comment.replies = replies;
          }
          this.loadingReplies.delete(commentId);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading replies:', error);
          this.snackBar.open('Failed to load replies', 'Close', { duration: 3000 });
          this.loadingReplies.delete(commentId);
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Hide replies for a comment
   */
  hideReplies(comment: Comment): void {
    comment.replies = undefined;
    this.cdr.detectChanges();
  }

  /**
   * Start editing a comment
   */
  startEdit(comment: Comment): void {
    this.editingCommentId = comment.id;
    this.editContent = comment.content;
    this.cdr.detectChanges();
  }

  /**
   * Cancel editing
   */
  cancelEdit(): void {
    this.editingCommentId = null;
    this.editContent = '';
    this.cdr.detectChanges();
  }

  /**
   * Save edited comment
   */
  saveEdit(commentId: number): void {
    if (!this.editContent.trim()) {
      this.snackBar.open('Comment content cannot be empty', 'Close', { duration: 2000 });
      return;
    }

    if (this.editContent.length > this.MAX_CHARS) {
      this.snackBar.open(`Comment cannot exceed ${this.MAX_CHARS} characters`, 'Close', { duration: 3000 });
      return;
    }

    const request: UpdateCommentRequest = {
      content: this.editContent
    };

    this.commentService.updateComment(this.documentId, commentId, request)
      .subscribe({
        next: (updated) => {
          // Find and update comment in main list
          const comment = this.comments.find(c => c.id === commentId);
          if (comment) {
            comment.content = updated.content;
            comment.isEdited = true;
            comment.updatedAt = updated.updatedAt;
          } else {
            // Check if it's a reply
            for (const c of this.comments) {
              if (c.replies) {
                const reply = c.replies.find(r => r.id === commentId);
                if (reply) {
                  reply.content = updated.content;
                  reply.isEdited = true;
                  reply.updatedAt = updated.updatedAt;
                  break;
                }
              }
            }
          }
          this.editingCommentId = null;
          this.snackBar.open('Comment updated successfully', 'Close', { duration: 2000 });
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error updating comment:', error);
          const errorMsg = error.error?.message || 'Failed to update comment';
          this.snackBar.open(errorMsg, 'Close', { duration: 3000 });
        }
      });
  }

  /**
   * Delete comment with confirmation
   */
  deleteComment(comment: Comment): void {
    const details = comment.replyCount > 0 
      ? [`${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'} will also be deleted`]
      : undefined;

    this.confirmDialog.confirm({
      title: 'Delete comment?',
      message: 'Are you sure you want to delete this comment? This action cannot be undone.',
      details: details,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.commentService.deleteComment(this.documentId, comment.id)
        .subscribe({
          next: () => {
            // Remove from main list
            this.comments = this.comments.filter(c => c.id !== comment.id);
            this.totalElements--;
            
            // If it was a reply, update parent
            if (comment.parentCommentId) {
              const parent = this.comments.find(c => c.id === comment.parentCommentId);
              if (parent) {
                parent.replyCount--;
                if (parent.replies) {
                  parent.replies = parent.replies.filter(r => r.id !== comment.id);
                }
              }
            }
            
            this.snackBar.open('Comment deleted successfully', 'Close', { duration: 2000 });
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error deleting comment:', error);
            const errorMsg = error.error?.message || 'Failed to delete comment';
            this.snackBar.open(errorMsg, 'Close', { duration: 3000 });
          }
        });
    });
  }

  /**
   * Toggle like on comment
   */
  toggleLike(comment: Comment): void {
    // Optimistic update
    const previousLiked = comment.isLikedByCurrentUser;
    const previousCount = comment.likeCount;
    
    comment.isLikedByCurrentUser = !previousLiked;
    comment.likeCount += previousLiked ? -1 : 1;
    this.cdr.detectChanges();

    this.commentService.toggleLike(this.documentId, comment.id)
      .subscribe({
        next: (response) => {
          // Update with server response
          comment.isLikedByCurrentUser = response.isLiked;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error toggling like:', error);
          // Rollback on error
          comment.isLikedByCurrentUser = previousLiked;
          comment.likeCount = previousCount;
          this.snackBar.open('Failed to update like', 'Close', { duration: 2000 });
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Show reply input for a comment
   */
  showReplyInput(commentId: number, username?: string): void {
    this.replyToCommentId = commentId;
    this.replyToUsername = username || '';
    this.replyContent = username ? `@${username} ` : '';
    this.cdr.detectChanges();
  }

  /**
   * Cancel reply
   */
  cancelReply(): void {
    this.replyToUsername = '';
    this.replyToCommentId = null;
    this.replyContent = '';
    this.cdr.detectChanges();
  }

  /**
   * Navigation methods
   */
  nextPage(): void {
    if (!this.last) {
      this.page++;
      this.loadComments();
    }
  }

  prevPage(): void {
    if (!this.first) {
      this.page--;
      this.loadComments();
    }
  }

  /**
   * Get remaining characters for textarea
   */
  getRemainingChars(content: string): number {
    return this.MAX_CHARS - content.length;
  }

  /**
   * Check if content is valid
   */
  isContentValid(content: string): boolean {
    return content.trim().length > 0 && content.length <= this.MAX_CHARS;
  }
}
