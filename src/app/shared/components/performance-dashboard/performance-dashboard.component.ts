import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { Subject, takeUntil, interval } from 'rxjs';
import { PerformanceService, PerformanceMetrics } from '../../../core/services/performance.service';

@Component({
  selector: 'app-performance-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule
  ],
  templateUrl: './performance-dashboard.component.html',
  styleUrls: ['./performance-dashboard.component.scss']
})
export class PerformanceDashboardComponent implements OnInit, OnDestroy {
  metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    errorCount: 0,
    userInteractions: 0
  };

  performanceScore = 0;
  performanceStatus: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
  recommendations: string[] = [];
  isExpanded = false;

  private destroy$ = new Subject<void>();

  constructor(private performanceService: PerformanceService) {}

  ngOnInit(): void {
    // Subscribe to performance metrics
    this.performanceService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => {
        this.metrics = metrics;
        this.updatePerformanceData();
      });

    // Update performance data every 5 seconds
    interval(5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updatePerformanceData();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Update performance data
   */
  private updatePerformanceData(): void {
    this.performanceScore = this.performanceService.getPerformanceScore();
    this.performanceStatus = this.performanceService.getPerformanceStatus();
    this.recommendations = this.performanceService.getPerformanceRecommendations();
  }

  /**
   * Get performance score color
   */
  getScoreColor(): string {
    if (this.performanceScore >= 90) return 'primary';
    if (this.performanceScore >= 80) return 'accent';
    if (this.performanceScore >= 60) return 'warn';
    return 'warn';
  }

  /**
   * Get performance status icon
   */
  getStatusIcon(): string {
    switch (this.performanceStatus) {
      case 'excellent': return 'star';
      case 'good': return 'check_circle';
      case 'fair': return 'warning';
      case 'poor': return 'error';
      default: return 'help';
    }
  }

  /**
   * Get performance status color
   */
  getStatusColor(): string {
    switch (this.performanceStatus) {
      case 'excellent': return 'primary';
      case 'good': return 'accent';
      case 'fair': return 'warn';
      case 'poor': return 'warn';
      default: return 'primary';
    }
  }

  /**
   * Format time in milliseconds
   */
  formatTime(ms: number): string {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    } else {
      return `${(ms / 1000).toFixed(2)}s`;
    }
  }

  /**
   * Format memory usage
   */
  formatMemory(mb: number): string {
    if (mb < 1) {
      return `${Math.round(mb * 1024)}KB`;
    } else {
      return `${mb.toFixed(1)}MB`;
    }
  }

  /**
   * Get load time status
   */
  getLoadTimeStatus(): string {
    if (this.metrics.loadTime < 1000) return 'excellent';
    if (this.metrics.loadTime < 2000) return 'good';
    if (this.metrics.loadTime < 3000) return 'fair';
    return 'poor';
  }

  /**
   * Get memory status
   */
  getMemoryStatus(): string {
    if (this.metrics.memoryUsage < 25) return 'excellent';
    if (this.metrics.memoryUsage < 50) return 'good';
    if (this.metrics.memoryUsage < 100) return 'fair';
    return 'poor';
  }

  /**
   * Get error status
   */
  getErrorStatus(): string {
    if (this.metrics.errorCount === 0) return 'excellent';
    if (this.metrics.errorCount < 3) return 'good';
    if (this.metrics.errorCount < 5) return 'fair';
    return 'poor';
  }

  /**
   * Toggle dashboard expansion
   */
  toggleExpansion(): void {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * Math utility for template
   */
  get Math() {
    return Math;
  }

  /**
   * Reset performance metrics
   */
  resetMetrics(): void {
    this.performanceService.resetMetrics();
  }

  /**
   * Refresh performance data
   */
  refreshMetrics(): void {
    this.performanceService.recordMemoryUsage();
    this.updatePerformanceData();
  }
}
