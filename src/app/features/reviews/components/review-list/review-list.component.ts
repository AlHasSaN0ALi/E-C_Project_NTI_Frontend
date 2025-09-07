import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ReviewService } from '../../../../core/services/review.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Review, ReviewListResponse } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss']
})
export class ReviewListComponent implements OnInit, OnDestroy {
  @Input() productId?: string;
  @Input() showFilters: boolean = true;
  @Input() showPagination: boolean = true;
  @Input() pageSize: number = 10;
  @Output() reviewSelected = new EventEmitter<Review>();
  @Output() reviewDeleted = new EventEmitter<string>();

  reviews: Review[] = [];
  loading = false;
  totalReviews = 0;
  currentPage = 1;
  pageSizeOptions = [5, 10, 25, 50];

  // Filters
  searchQuery = '';
  ratingFilter = '';
  verifiedFilter = '';
  sortBy = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Filter options
  ratingOptions = [
    { value: '', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
  ];

  verifiedOptions = [
    { value: '', label: 'All Reviews' },
    { value: 'true', label: 'Verified Only' },
    { value: 'false', label: 'Unverified Only' }
  ];

  sortOptions = [
    { value: 'createdAt', label: 'Date' },
    { value: 'rating', label: 'Rating' },
    { value: 'helpful', label: 'Most Helpful' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private reviewService: ReviewService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadReviews();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    // Debounce search input
    // This would be implemented with a search subject and debounceTime
  }

  loadReviews(): void {
    this.loading = true;
    
    const params = {
      page: this.currentPage,
      limit: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      rating: this.ratingFilter ? +this.ratingFilter : undefined,
      verified: this.verifiedFilter ? this.verifiedFilter === 'true' : undefined
    };

    const request = this.productId 
      ? this.reviewService.getProductReviews(this.productId, params.page, params.limit, params.sortBy, params.sortOrder)
      : this.reviewService.getReviews(params.page, params.limit, params.sortBy, params.sortOrder, params.rating, params.verified);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.reviews = response.data || [];
        this.totalReviews = response.total || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.notificationService.error('Failed to load reviews');
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadReviews();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active;
    this.sortOrder = sort.direction === 'asc' ? 'asc' : 'desc';
    this.loadReviews();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadReviews();
  }

  onSearchChange(): void {
    // Implement search functionality
    this.currentPage = 1;
    this.loadReviews();
  }

  onReviewClick(review: Review): void {
    this.reviewSelected.emit(review);
  }

  onLikeReview(review: Review): void {
    if (review.isLiked) {
      this.reviewService.unlikeReview(review._id).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          review.isLiked = false;
          review.likes = response.likes;
          this.notificationService.success('Review unliked');
        },
        error: (error) => {
          console.error('Error unliking review:', error);
          this.notificationService.error('Failed to unlike review');
        }
      });
    } else {
      this.reviewService.likeReview(review._id).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          review.isLiked = true;
          review.likes = response.likes;
          this.notificationService.success('Review liked');
        },
        error: (error) => {
          console.error('Error liking review:', error);
          this.notificationService.error('Failed to like review');
        }
      });
    }
  }

  onReportReview(review: Review): void {
    const reason = prompt('Please provide a reason for reporting this review:');
    if (reason && reason.trim()) {
      this.reviewService.reportReview(review._id, reason.trim()).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.notificationService.success('Review reported successfully');
        },
        error: (error) => {
          console.error('Error reporting review:', error);
          this.notificationService.error('Failed to report review');
        }
      });
    }
  }

  onDeleteReview(review: Review): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.reviewService.deleteReview(review._id).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.notificationService.success('Review deleted successfully');
          this.reviewDeleted.emit(review._id);
          this.loadReviews();
        },
        error: (error) => {
          console.error('Error deleting review:', error);
          this.notificationService.error('Failed to delete review');
        }
      });
    }
  }

  getRatingStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i < rating ? 1 : 0);
  }

  getEmptyStars(rating: number): number[] {
    return Array.from({ length: 5 - rating }, (_, i) => i);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getTimeAgo(date: string | Date): string {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - reviewDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  }
}
