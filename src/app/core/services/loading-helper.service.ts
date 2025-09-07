import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { LoadingStateService, LoadingType } from './loading-state.service';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class LoadingHelperService {
  constructor(
    private loadingStateService: LoadingStateService,
    private loadingService: LoadingService
  ) {}

  /**
   * Wrap an observable with loading state management
   */
  withLoading<T>(
    observable: Observable<T>,
    loadingId?: string,
    type: LoadingType = LoadingType.COMPONENT,
    message?: string
  ): Observable<T> {
    const id = loadingId || this.loadingStateService.generateLoadingId();
    
    // Start loading
    this.loadingStateService.startLoading(id, type, message);
    
    return observable.pipe(
      finalize(() => {
        // Stop loading when observable completes or errors
        this.loadingStateService.stopLoading(id);
      })
    );
  }

  /**
   * Wrap an observable with global loading
   */
  withGlobalLoading<T>(
    observable: Observable<T>,
    message?: string
  ): Observable<T> {
    return this.withLoading(observable, undefined, LoadingType.GLOBAL, message);
  }

  /**
   * Wrap an observable with form loading
   */
  withFormLoading<T>(
    observable: Observable<T>,
    loadingId?: string,
    message?: string
  ): Observable<T> {
    return this.withLoading(observable, loadingId, LoadingType.FORM, message);
  }

  /**
   * Wrap an observable with button loading
   */
  withButtonLoading<T>(
    observable: Observable<T>,
    loadingId?: string,
    message?: string
  ): Observable<T> {
    return this.withLoading(observable, loadingId, LoadingType.BUTTON, message);
  }

  /**
   * Wrap an observable with upload loading
   */
  withUploadLoading<T>(
    observable: Observable<T>,
    loadingId?: string,
    message?: string
  ): Observable<T> {
    return this.withLoading(observable, loadingId, LoadingType.UPLOAD, message);
  }

  /**
   * Wrap an observable with search loading
   */
  withSearchLoading<T>(
    observable: Observable<T>,
    loadingId?: string,
    message?: string
  ): Observable<T> {
    return this.withLoading(observable, loadingId, LoadingType.SEARCH, message);
  }

  /**
   * Wrap an observable with navigation loading
   */
  withNavigationLoading<T>(
    observable: Observable<T>,
    loadingId?: string,
    message?: string
  ): Observable<T> {
    return this.withLoading(observable, loadingId, LoadingType.NAVIGATION, message);
  }

  /**
   * Create a loading state for manual control
   */
  createLoadingState(
    loadingId: string,
    type: LoadingType = LoadingType.COMPONENT,
    message?: string
  ): LoadingStateController {
    return new LoadingStateController(
      loadingId,
      type,
      message,
      this.loadingStateService
    );
  }

  /**
   * Show loading for a specific duration
   */
  showLoadingForDuration(
    duration: number,
    type: LoadingType = LoadingType.COMPONENT,
    message?: string
  ): string {
    const id = this.loadingStateService.generateLoadingId();
    this.loadingStateService.startLoading(id, type, message, duration);
    return id;
  }

  /**
   * Check if any loading is active
   */
  isAnyLoading(): boolean {
    return this.loadingStateService.getLoadingCount() > 0;
  }

  /**
   * Check if specific type is loading
   */
  isTypeLoading(type: LoadingType): boolean {
    return this.loadingStateService.isTypeLoading(type);
  }

  /**
   * Get loading count by type
   */
  getLoadingCountByType(type: LoadingType): number {
    return this.loadingStateService.getLoadingCountByType(type);
  }

  /**
   * Stop all loading states
   */
  stopAllLoading(): void {
    this.loadingStateService.stopAllLoading();
  }

  /**
   * Stop loading by type
   */
  stopLoadingByType(type: LoadingType): void {
    this.loadingStateService.stopLoadingByType(type);
  }

  /**
   * Get loading statistics
   */
  getLoadingStatistics(): any {
    return this.loadingStateService.getLoadingStatistics();
  }
}

/**
 * Controller class for manual loading state management
 */
export class LoadingStateController {
  constructor(
    private id: string,
    private type: LoadingType,
    private message: string | undefined,
    private loadingStateService: LoadingStateService
  ) {
    this.start();
  }

  /**
   * Start the loading state
   */
  start(): void {
    this.loadingStateService.startLoading(this.id, this.type, this.message);
  }

  /**
   * Stop the loading state
   */
  stop(): void {
    this.loadingStateService.stopLoading(this.id);
  }

  /**
   * Update the loading message
   */
  updateMessage(message: string): void {
    this.loadingStateService.updateMessage(this.id, message);
  }

  /**
   * Update the loading progress (for uploads)
   */
  updateProgress(progress: number): void {
    this.loadingStateService.updateProgress(this.id, progress);
  }

  /**
   * Check if this loading state is active
   */
  isActive(): boolean {
    return this.loadingStateService.isLoading(this.id);
  }

  /**
   * Get the loading state
   */
  getState(): any {
    return this.loadingStateService.getLoadingState(this.id);
  }
}
