import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { ReviewService } from '../../../../core/services/review.service';
import { NotificationService } from '../../../../core/services/notification.service';

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedReviews: number;
}

@Component({
  selector: 'app-review-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './review-stats.component.html',
  styleUrls: ['./review-stats.component.scss']
})
export class ReviewStatsComponent implements OnInit, OnDestroy {
  @Input() productId!: string;
  @Input() showWriteReview: boolean = true;
  @Output() writeReviewClicked = new EventEmitter<void>();

  stats: ReviewStats | null = null;
  loading = false;
  selectedRating: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private reviewService: ReviewService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadReviewStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReviewStats(): void {
    this.loading = true;
    
    this.reviewService.getProductReviewStats(this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.stats = response.data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading review stats:', error);
          this.notificationService.error('Failed to load review statistics');
          this.loading = false;
        }
      });
  }

  onRatingFilter(rating: number): void {
    this.selectedRating = this.selectedRating === rating ? null : rating;
    // Emit event to parent component to filter reviews
  }

  onWriteReview(): void {
    this.writeReviewClicked.emit();
  }

  getRatingStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i < rating ? 1 : 0);
  }

  getEmptyStars(rating: number): number[] {
    return Array.from({ length: 5 - rating }, (_, i) => i);
  }

  getRatingPercentage(rating: number): number {
    if (!this.stats || this.stats.totalReviews === 0) return 0;
    const count = this.stats.ratingDistribution[rating as keyof typeof this.stats.ratingDistribution];
    return (count / this.stats.totalReviews) * 100;
  }

  getRatingCount(rating: number): number {
    if (!this.stats) return 0;
    return this.stats.ratingDistribution[rating as keyof typeof this.stats.ratingDistribution];
  }

  getAverageRatingText(): string {
    if (!this.stats) return 'No rating';
    const rating = this.stats.averageRating;
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Good';
    if (rating >= 2.5) return 'Average';
    if (rating >= 1.5) return 'Poor';
    return 'Very Poor';
  }

  getAverageRatingColor(): string {
    if (!this.stats) return '#e0e0e0';
    const rating = this.stats.averageRating;
    if (rating >= 4) return '#4caf50';
    if (rating >= 3) return '#ff9800';
    if (rating >= 2) return '#ff5722';
    return '#f44336';
  }

  getVerificationPercentage(): number {
    if (!this.stats || this.stats.totalReviews === 0) return 0;
    return (this.stats.verifiedReviews / this.stats.totalReviews) * 100;
  }

  getFloorRating(rating: number): number {
    return Math.floor(rating);
  }
}
