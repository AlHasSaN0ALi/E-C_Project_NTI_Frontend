import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ReviewService } from '../../../../core/services/review.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Review, ReviewRequest } from '../../../../core/models';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.scss']
})
export class ReviewFormComponent implements OnInit, OnDestroy {
  @Input() productId!: string;
  @Input() existingReview?: Review;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() reviewSubmitted = new EventEmitter<Review>();
  @Output() reviewCancelled = new EventEmitter<void>();

  reviewForm!: FormGroup;
  loading = false;
  selectedRating = 0;
  hoveredRating = 0;
  selectedImages: File[] = [];
  imagePreviews: string[] = [];
  selectedTags: string[] = [];

  // Predefined tags
  availableTags = [
    'Quality', 'Value', 'Design', 'Performance', 'Durability',
    'Easy to use', 'Fast delivery', 'Good packaging', 'As described',
    'Great customer service', 'Would recommend', 'Excellent'
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadExistingReview();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      title: ['', [Validators.maxLength(100)]],
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      tags: [[]],
      images: [[]]
    });
  }

  private loadExistingReview(): void {
    if (this.existingReview && this.mode === 'edit') {
      this.selectedRating = this.existingReview.rating;
      this.selectedTags = this.existingReview.tags || [];
      this.imagePreviews = this.existingReview.images || [];
      
      this.reviewForm.patchValue({
        rating: this.existingReview.rating,
        title: this.existingReview.title || '',
        comment: this.existingReview.comment,
        tags: this.selectedTags
      });
    }
  }

  onRatingClick(rating: number): void {
    this.selectedRating = rating;
    this.reviewForm.patchValue({ rating });
  }

  onRatingHover(rating: number): void {
    this.hoveredRating = rating;
  }

  onRatingLeave(): void {
    this.hoveredRating = 0;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      
      // Limit to 5 images
      const remainingSlots = 5 - this.selectedImages.length;
      const filesToAdd = files.slice(0, remainingSlots);
      
      this.selectedImages.push(...filesToAdd);
      
      // Create previews
      filesToAdd.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreviews.push(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });

      this.reviewForm.patchValue({ images: this.selectedImages });
    }
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    this.reviewForm.patchValue({ images: this.selectedImages });
  }

  onTagToggle(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      if (this.selectedTags.length < 5) {
        this.selectedTags.push(tag);
      } else {
        this.notificationService.showWarning('Maximum 5 tags allowed');
      }
    }
    this.reviewForm.patchValue({ tags: this.selectedTags });
  }

  addCustomTag(tag: string): void {
    const trimmedTag = tag.trim();
    if (trimmedTag && !this.selectedTags.includes(trimmedTag) && this.selectedTags.length < 5) {
      this.selectedTags.push(trimmedTag);
      this.reviewForm.patchValue({ tags: this.selectedTags });
    }
  }

  onSubmit(): void {
    if (this.reviewForm.valid) {
      this.loading = true;
      
      const formData = new FormData();
      formData.append('productId', this.productId);
      formData.append('rating', this.reviewForm.value.rating.toString());
      formData.append('comment', this.reviewForm.value.comment);
      
      if (this.reviewForm.value.title) {
        formData.append('title', this.reviewForm.value.title);
      }
      
      if (this.selectedTags.length > 0) {
        formData.append('tags', JSON.stringify(this.selectedTags));
      }
      
      this.selectedImages.forEach((file, index) => {
        formData.append('images', file);
      });

      const request = this.mode === 'create' 
        ? this.reviewService.createReview(formData as any)
        : this.reviewService.updateReview(this.existingReview!._id, formData as any);

      request.pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.loading = false;
          this.notificationService.showSuccess(
            this.mode === 'create' ? 'Review submitted successfully' : 'Review updated successfully'
          );
          this.reviewSubmitted.emit(response.data);
          this.resetForm();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error submitting review:', error);
          this.notificationService.showError(
            this.mode === 'create' ? 'Failed to submit review' : 'Failed to update review'
          );
        }
      });
    } else {
      this.markFormGroupTouched();
      this.notificationService.showError('Please fill in all required fields');
    }
  }

  onCancel(): void {
    this.reviewCancelled.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.reviewForm.reset();
    this.selectedRating = 0;
    this.hoveredRating = 0;
    this.selectedImages = [];
    this.imagePreviews = [];
    this.selectedTags = [];
  }

  private markFormGroupTouched(): void {
    Object.keys(this.reviewForm.controls).forEach(key => {
      const control = this.reviewForm.get(key);
      control?.markAsTouched();
    });
  }

  getRatingStars(): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  isStarFilled(star: number): boolean {
    return star <= (this.hoveredRating || this.selectedRating);
  }

  getFieldError(fieldName: string): string {
    const field = this.reviewForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['maxlength']) return `${fieldName} is too long`;
      if (field.errors['min']) return `Rating must be at least 1 star`;
      if (field.errors['max']) return `Rating cannot exceed 5 stars`;
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.reviewForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }
}
