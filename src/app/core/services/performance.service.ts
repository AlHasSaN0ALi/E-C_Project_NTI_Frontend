import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
  errorCount: number;
  userInteractions: number;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private metricsSubject = new BehaviorSubject<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    errorCount: 0,
    userInteractions: 0
  });

  private startTime = performance.now();
  private networkRequestCount = 0;
  private errorCount = 0;
  private userInteractionCount = 0;

  constructor() {
    this.initializePerformanceMonitoring();
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): Observable<PerformanceMetrics> {
    return this.metricsSubject.asObservable();
  }

  /**
   * Get current metrics value
   */
  getCurrentMetrics(): PerformanceMetrics {
    return this.metricsSubject.value;
  }

  /**
   * Record page load time
   */
  recordLoadTime(): void {
    const loadTime = performance.now() - this.startTime;
    this.updateMetrics({ loadTime });
  }

  /**
   * Record render time
   */
  recordRenderTime(componentName: string): void {
    const renderTime = performance.now() - this.startTime;
    console.log(`${componentName} rendered in ${renderTime.toFixed(2)}ms`);
    this.updateMetrics({ renderTime });
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      this.updateMetrics({ memoryUsage });
    }
  }

  /**
   * Record network request
   */
  recordNetworkRequest(): void {
    this.networkRequestCount++;
    this.updateMetrics({ networkRequests: this.networkRequestCount });
  }

  /**
   * Record error
   */
  recordError(): void {
    this.errorCount++;
    this.updateMetrics({ errorCount: this.errorCount });
  }

  /**
   * Record user interaction
   */
  recordUserInteraction(): void {
    this.userInteractionCount++;
    this.updateMetrics({ userInteractions: this.userInteractionCount });
  }

  /**
   * Get performance score (0-100)
   */
  getPerformanceScore(): number {
    const metrics = this.getCurrentMetrics();
    let score = 100;

    // Deduct points for slow load time
    if (metrics.loadTime > 3000) score -= 20;
    else if (metrics.loadTime > 2000) score -= 10;
    else if (metrics.loadTime > 1000) score -= 5;

    // Deduct points for high memory usage
    if (metrics.memoryUsage > 100) score -= 20;
    else if (metrics.memoryUsage > 50) score -= 10;

    // Deduct points for errors
    score -= metrics.errorCount * 5;

    // Deduct points for too many network requests
    if (metrics.networkRequests > 50) score -= 10;
    else if (metrics.networkRequests > 20) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(): string[] {
    const metrics = this.getCurrentMetrics();
    const recommendations: string[] = [];

    if (metrics.loadTime > 2000) {
      recommendations.push('Consider implementing lazy loading for better initial load time');
    }

    if (metrics.memoryUsage > 50) {
      recommendations.push('Memory usage is high. Consider optimizing component lifecycle and memory leaks');
    }

    if (metrics.errorCount > 5) {
      recommendations.push('High error count detected. Review error handling and user experience');
    }

    if (metrics.networkRequests > 30) {
      recommendations.push('Consider implementing request caching to reduce network calls');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance looks good! Keep up the great work.');
    }

    return recommendations;
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.startTime = performance.now();
    this.networkRequestCount = 0;
    this.errorCount = 0;
    this.userInteractionCount = 0;
    
    this.metricsSubject.next({
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      networkRequests: 0,
      errorCount: 0,
      userInteractions: 0
    });
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    // Monitor memory usage every 30 seconds
    setInterval(() => {
      this.recordMemoryUsage();
    }, 30000);

    // Record initial load time when DOM is ready
    if (document.readyState === 'complete') {
      this.recordLoadTime();
    } else {
      window.addEventListener('load', () => {
        this.recordLoadTime();
      });
    }

    // Monitor user interactions
    document.addEventListener('click', () => {
      this.recordUserInteraction();
    });

    document.addEventListener('keydown', () => {
      this.recordUserInteraction();
    });
  }

  /**
   * Update metrics
   */
  private updateMetrics(updates: Partial<PerformanceMetrics>): void {
    const currentMetrics = this.getCurrentMetrics();
    const newMetrics = { ...currentMetrics, ...updates };
    this.metricsSubject.next(newMetrics);
  }

  /**
   * Check if performance is good
   */
  isPerformanceGood(): boolean {
    return this.getPerformanceScore() >= 80;
  }

  /**
   * Get performance status
   */
  getPerformanceStatus(): 'excellent' | 'good' | 'fair' | 'poor' {
    const score = this.getPerformanceScore();
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }
}
