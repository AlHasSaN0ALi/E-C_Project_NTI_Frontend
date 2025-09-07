import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export interface LoadingState {
  isLoading: boolean;
  loadingCount: number;
  activeRequests: string[];
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState>({
    isLoading: false,
    loadingCount: 0,
    activeRequests: []
  });
  
  public loading$ = this.loadingSubject.asObservable();
  public isLoading$ = this.loadingSubject.pipe(
    map(state => state.isLoading),
    distinctUntilChanged()
  );

  private loadingCount = 0;
  private activeRequests = new Set<string>();

  constructor() {}

  // Show loading
  show(requestId?: string): void {
    this.loadingCount++;
    
    if (requestId) {
      this.activeRequests.add(requestId);
    }
    
    this.updateLoadingState();
  }

  // Hide loading
  hide(requestId?: string): void {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    
    if (requestId) {
      this.activeRequests.delete(requestId);
    }
    
    this.updateLoadingState();
  }

  // Force hide loading (useful for error cases)
  forceHide(): void {
    this.loadingCount = 0;
    this.activeRequests.clear();
    this.updateLoadingState();
  }

  // Show loading for specific request
  showForRequest(requestId: string): void {
    this.show(requestId);
  }

  // Hide loading for specific request
  hideForRequest(requestId: string): void {
    this.hide(requestId);
  }

  // Check if loading
  get isLoading(): boolean {
    return this.loadingSubject.value.isLoading;
  }

  // Get current loading state
  get currentState(): LoadingState {
    return this.loadingSubject.value;
  }

  // Get active requests
  get activeRequestsList(): string[] {
    return Array.from(this.activeRequests);
  }

  // Check if specific request is loading
  isRequestLoading(requestId: string): boolean {
    return this.activeRequests.has(requestId);
  }

  // Update loading state
  private updateLoadingState(): void {
    const isLoading = this.loadingCount > 0;
    this.loadingSubject.next({
      isLoading,
      loadingCount: this.loadingCount,
      activeRequests: Array.from(this.activeRequests)
    });
  }

  // Generate unique request ID
  generateRequestId(prefix: string = 'req'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Show loading with timeout (auto-hide after specified time)
  showWithTimeout(timeoutMs: number = 30000, requestId?: string): void {
    this.show(requestId);
    
    setTimeout(() => {
      this.hide(requestId);
    }, timeoutMs);
  }
}
