import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export interface LoadingStateItem {
  id: string;
  type: LoadingType;
  message?: string;
  progress?: number;
  startTime: Date;
  timeout?: number;
}

export enum LoadingType {
  GLOBAL = 'global',
  COMPONENT = 'component',
  BUTTON = 'button',
  FORM = 'form',
  UPLOAD = 'upload',
  SEARCH = 'search',
  NAVIGATION = 'navigation'
}

@Injectable({
  providedIn: 'root'
})
export class LoadingStateService {
  private loadingStates = new Map<string, LoadingStateItem>();
  private loadingSubject = new BehaviorSubject<LoadingStateItem[]>([]);
  
  public loadingStates$ = this.loadingSubject.asObservable();
  public isLoading$ = this.loadingStates$.pipe(
    map(states => states.length > 0),
    distinctUntilChanged()
  );

  // Type-specific loading observables
  public globalLoading$ = this.getLoadingByType$(LoadingType.GLOBAL);
  public componentLoading$ = this.getLoadingByType$(LoadingType.COMPONENT);
  public buttonLoading$ = this.getLoadingByType$(LoadingType.BUTTON);
  public formLoading$ = this.getLoadingByType$(LoadingType.FORM);
  public uploadLoading$ = this.getLoadingByType$(LoadingType.UPLOAD);
  public searchLoading$ = this.getLoadingByType$(LoadingType.SEARCH);
  public navigationLoading$ = this.getLoadingByType$(LoadingType.NAVIGATION);

  constructor() {
    // Clean up expired loading states every 30 seconds
    setInterval(() => {
      this.cleanupExpiredStates();
    }, 30000);
  }

  /**
   * Start loading with specific type and optional message
   */
  startLoading(
    id: string, 
    type: LoadingType = LoadingType.COMPONENT, 
    message?: string,
    timeout?: number
  ): void {
    const loadingState: LoadingStateItem = {
      id,
      type,
      message,
      startTime: new Date(),
      timeout
    };

    this.loadingStates.set(id, loadingState);
    this.updateSubject();

    // Set timeout if specified
    if (timeout) {
      setTimeout(() => {
        this.stopLoading(id);
      }, timeout);
    }
  }

  /**
   * Stop loading by ID
   */
  stopLoading(id: string): void {
    if (this.loadingStates.has(id)) {
      this.loadingStates.delete(id);
      this.updateSubject();
    }
  }

  /**
   * Update loading progress (useful for uploads)
   */
  updateProgress(id: string, progress: number): void {
    const state = this.loadingStates.get(id);
    if (state) {
      state.progress = Math.min(100, Math.max(0, progress));
      this.updateSubject();
    }
  }

  /**
   * Update loading message
   */
  updateMessage(id: string, message: string): void {
    const state = this.loadingStates.get(id);
    if (state) {
      state.message = message;
      this.updateSubject();
    }
  }

  /**
   * Check if specific loading state is active
   */
  isLoading(id: string): boolean {
    return this.loadingStates.has(id);
  }

  /**
   * Check if any loading state of specific type is active
   */
  isTypeLoading(type: LoadingType): boolean {
    return Array.from(this.loadingStates.values()).some(state => state.type === type);
  }

  /**
   * Get loading state by ID
   */
  getLoadingState(id: string): LoadingStateItem | undefined {
    return this.loadingStates.get(id);
  }

  /**
   * Get all loading states of specific type
   */
  getLoadingStatesByType(type: LoadingType): LoadingStateItem[] {
    return Array.from(this.loadingStates.values()).filter(state => state.type === type);
  }

  /**
   * Get loading observable for specific type
   */
  getLoadingByType$(type: LoadingType): Observable<boolean> {
    return this.loadingStates$.pipe(
      map(states => states.some(state => state.type === type)),
      distinctUntilChanged()
    );
  }

  /**
   * Get loading states for specific type
   */
  getLoadingStatesByType$(type: LoadingType): Observable<LoadingStateItem[]> {
    return this.loadingStates$.pipe(
      map(states => states.filter(state => state.type === type)),
      distinctUntilChanged()
    );
  }

  /**
   * Stop all loading states
   */
  stopAllLoading(): void {
    this.loadingStates.clear();
    this.updateSubject();
  }

  /**
   * Stop all loading states of specific type
   */
  stopLoadingByType(type: LoadingType): void {
    const statesToRemove = Array.from(this.loadingStates.entries())
      .filter(([_, state]) => state.type === type)
      .map(([id, _]) => id);

    statesToRemove.forEach(id => this.stopLoading(id));
  }

  /**
   * Get current loading count
   */
  getLoadingCount(): number {
    return this.loadingStates.size;
  }

  /**
   * Get loading count by type
   */
  getLoadingCountByType(type: LoadingType): number {
    return this.getLoadingStatesByType(type).length;
  }

  /**
   * Generate unique loading ID
   */
  generateLoadingId(prefix: string = 'loading'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update subject with current states
   */
  private updateSubject(): void {
    this.loadingSubject.next(Array.from(this.loadingStates.values()));
  }

  /**
   * Clean up expired loading states
   */
  private cleanupExpiredStates(): void {
    const now = new Date();
    const expiredStates: string[] = [];

    this.loadingStates.forEach((state, id) => {
      // Remove states that have been running for more than 5 minutes
      const timeDiff = now.getTime() - state.startTime.getTime();
      if (timeDiff > 300000) { // 5 minutes
        expiredStates.push(id);
      }
    });

    expiredStates.forEach(id => {
      console.warn(`Loading state ${id} expired and was automatically cleaned up`);
      this.stopLoading(id);
    });
  }

  /**
   * Get loading statistics
   */
  getLoadingStatistics(): any {
    const states = Array.from(this.loadingStates.values());
    const stats = {
      total: states.length,
      byType: {} as any,
      averageDuration: 0,
      longestRunning: null as LoadingStateItem | null
    };

    // Count by type
    Object.values(LoadingType).forEach(type => {
      stats.byType[type] = states.filter(state => state.type === type).length;
    });

    // Calculate average duration
    if (states.length > 0) {
      const now = new Date();
      const totalDuration = states.reduce((sum, state) => {
        return sum + (now.getTime() - state.startTime.getTime());
      }, 0);
      stats.averageDuration = totalDuration / states.length;
    }

    // Find longest running state
    if (states.length > 0) {
      const now = new Date();
      stats.longestRunning = states.reduce((longest, current) => {
        const currentDuration = now.getTime() - current.startTime.getTime();
        const longestDuration = now.getTime() - longest.startTime.getTime();
        return currentDuration > longestDuration ? current : longest;
      });
    }

    return stats;
  }
}
