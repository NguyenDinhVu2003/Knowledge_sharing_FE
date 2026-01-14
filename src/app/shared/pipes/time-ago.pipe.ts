import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy, NgZone } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true,
  pure: false // Make it impure to update regularly
})
export class TimeAgoPipe implements PipeTransform, OnDestroy {
  private timer: any;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  transform(value: Date | string | null | undefined): string {
    if (!value) return '';

    // Clear existing timer
    this.removeTimer();

    // Create timer to update every minute
    this.ngZone.runOutsideAngular(() => {
      this.timer = setInterval(() => {
        this.ngZone.run(() => this.changeDetectorRef.markForCheck());
      }, 60000); // Update every minute
    });

    const date = value instanceof Date ? value : new Date(value);
    
    // Validate date
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', value);
      return 'Invalid date';
    }

    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Handle future dates
    if (seconds < 0) {
      return 'Just now';
    }

    // Less than a minute
    if (seconds < 60) {
      return 'Just now';
    }

    const intervals: { [key: string]: number } = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [key, intervalSeconds] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / intervalSeconds);
      if (interval >= 1) {
        return interval === 1 
          ? `1 ${key} ago` 
          : `${interval} ${key}s ago`;
      }
    }

    return 'Just now';
  }

  ngOnDestroy(): void {
    this.removeTimer();
  }

  private removeTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
