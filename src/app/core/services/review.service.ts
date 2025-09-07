import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { Review, ReviewRequest, ReviewResponse, ReviewListResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly apiUrl = `${environment.apiUrl}/reviews`;

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  /**
   * Get reviews for a specific product
   */
  getProductReviews(productId: string, page: number = 1, limit: number = 10, sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc'): Observable<ReviewListResponse> {
    const params = new HttpParams()
      .set('productId', productId)
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    return this.apiService.get<ReviewListResponse>(`${this.apiUrl}/product/${productId}`, { params });
  }

  /**
   * Get all reviews with filtering and pagination
   */
  getReviews(page: number = 1, limit: number = 10, sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc', rating?: number, verified?: boolean): Observable<ReviewListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    if (rating !== undefined) {
      params = params.set('rating', rating.toString());
    }

    if (verified !== undefined) {
      params = params.set('verified', verified.toString());
    }

    return this.apiService.get<ReviewListResponse>(this.apiUrl, { params });
  }

  /**
   * Get a specific review by ID
   */
  getReview(reviewId: string): Observable<ReviewResponse> {
    return this.apiService.get<ReviewResponse>(`${this.apiUrl}/${reviewId}`);
  }

  /**
   * Create a new review
   */
  createReview(reviewData: ReviewRequest): Observable<ReviewResponse> {
    return this.apiService.post<ReviewResponse>(this.apiUrl, reviewData);
  }

  /**
   * Update an existing review
   */
  updateReview(reviewId: string, reviewData: Partial<ReviewRequest>): Observable<ReviewResponse> {
    return this.apiService.put<ReviewResponse>(`${this.apiUrl}/${reviewId}`, reviewData);
  }

  /**
   * Delete a review
   */
  deleteReview(reviewId: string): Observable<{ success: boolean; message: string }> {
    return this.apiService.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${reviewId}`);
  }

  /**
   * Get user's reviews
   */
  getUserReviews(userId: string, page: number = 1, limit: number = 10): Observable<ReviewListResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.apiService.get<ReviewListResponse>(`${this.apiUrl}/user/${userId}`, { params });
  }

  /**
   * Get review statistics for a product
   */
  getProductReviewStats(productId: string): Observable<{
    success: boolean;
    data: {
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
    };
  }> {
    return this.apiService.get<{
      success: boolean;
      data: {
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
      };
    }>(`${this.apiUrl}/product/${productId}/stats`);
  }

  /**
   * Report a review as inappropriate
   */
  reportReview(reviewId: string, reason: string): Observable<{ success: boolean; message: string }> {
    return this.apiService.post<{ success: boolean; message: string }>(`${this.apiUrl}/${reviewId}/report`, { reason });
  }

  /**
   * Like a review
   */
  likeReview(reviewId: string): Observable<{ success: boolean; message: string; likes: number }> {
    return this.apiService.post<{ success: boolean; message: string; likes: number }>(`${this.apiUrl}/${reviewId}/like`, {});
  }

  /**
   * Unlike a review
   */
  unlikeReview(reviewId: string): Observable<{ success: boolean; message: string; likes: number }> {
    return this.apiService.delete<{ success: boolean; message: string; likes: number }>(`${this.apiUrl}/${reviewId}/like`);
  }

  /**
   * Get recent reviews
   */
  getRecentReviews(limit: number = 5): Observable<ReviewListResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.apiService.get<ReviewListResponse>(`${this.apiUrl}/recent`, { params });
  }

  /**
   * Get top-rated reviews
   */
  getTopRatedReviews(limit: number = 5): Observable<ReviewListResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.apiService.get<ReviewListResponse>(`${this.apiUrl}/top-rated`, { params });
  }
}
