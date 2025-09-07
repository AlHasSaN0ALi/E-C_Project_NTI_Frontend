import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EnvironmentService } from './environment.service';
import { ErrorReport } from './error-handling.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorReportingService {
  private readonly REPORTING_ENDPOINT = '/api/errors/report';
  private readonly BATCH_SIZE = 10;
  private errorQueue: ErrorReport[] = [];
  private isReporting = false;

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService
  ) {}

  /**
   * Report error to backend
   */
  reportError(errorReport: ErrorReport): Observable<boolean> {
    if (!this.environmentService.isProduction()) {
      // In development, just log the error
      console.log('Error Report (Development):', errorReport);
      return of(true);
    }

    // In production, send to backend
    return this.http.post(this.environmentService.getApiUrl(this.REPORTING_ENDPOINT), {
      ...errorReport,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }).pipe(
      map(() => true),
      catchError(() => {
        // If reporting fails, add to queue for later
        this.addToQueue(errorReport);
        return of(false);
      })
    );
  }

  /**
   * Report multiple errors in batch
   */
  reportErrorsBatch(errorReports: ErrorReport[]): Observable<boolean> {
    if (!this.environmentService.isProduction()) {
      console.log('Error Reports Batch (Development):', errorReports);
      return of(true);
    }

    return this.http.post(this.environmentService.getApiUrl('/api/errors/report-batch'), {
      errors: errorReports.map(report => ({
        ...report,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }))
    }).pipe(
      map(() => true),
      catchError(() => {
        // If batch reporting fails, add to queue
        errorReports.forEach(report => this.addToQueue(report));
        return of(false);
      })
    );
  }

  /**
   * Get error statistics from backend
   */
  getErrorStatistics(): Observable<any> {
    if (!this.environmentService.isProduction()) {
      return of({
        total: 0,
        byStatus: {},
        byComponent: {},
        recent: 0
      });
    }

    return this.http.get(this.environmentService.getApiUrl('/api/errors/statistics')).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Add error to reporting queue
   */
  private addToQueue(errorReport: ErrorReport): void {
    this.errorQueue.push(errorReport);
    
    // If queue is full, try to report
    if (this.errorQueue.length >= this.BATCH_SIZE) {
      this.processQueue();
    }
  }

  /**
   * Process error reporting queue
   */
  private processQueue(): void {
    if (this.isReporting || this.errorQueue.length === 0) {
      return;
    }

    this.isReporting = true;
    const errorsToReport = this.errorQueue.splice(0, this.BATCH_SIZE);

    this.reportErrorsBatch(errorsToReport).subscribe({
      next: (success) => {
        if (!success) {
          // If reporting failed, put errors back in queue
          this.errorQueue.unshift(...errorsToReport);
        }
        this.isReporting = false;
        
        // Continue processing if there are more errors
        if (this.errorQueue.length > 0) {
          setTimeout(() => this.processQueue(), 5000); // Retry after 5 seconds
        }
      },
      error: () => {
        // If reporting failed, put errors back in queue
        this.errorQueue.unshift(...errorsToReport);
        this.isReporting = false;
        
        // Retry after delay
        setTimeout(() => this.processQueue(), 10000); // Retry after 10 seconds
      }
    });
  }

  /**
   * Force process queue (for manual retry)
   */
  forceProcessQueue(): void {
    this.processQueue();
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { count: number; isReporting: boolean } {
    return {
      count: this.errorQueue.length,
      isReporting: this.isReporting
    };
  }

  /**
   * Clear error queue
   */
  clearQueue(): void {
    this.errorQueue = [];
  }

  /**
   * Send error to external service (e.g., Sentry, LogRocket)
   */
  sendToExternalService(errorReport: ErrorReport): void {
    // Example implementation for Sentry
    if (typeof (window as any).Sentry !== 'undefined') {
      (window as any).Sentry.captureException(new Error(errorReport.message), {
        tags: {
          component: errorReport.context?.component,
          action: errorReport.context?.action,
          status: errorReport.status
        },
        extra: {
          url: errorReport.url,
          method: errorReport.method,
          timestamp: errorReport.timestamp,
          userAgent: errorReport.userAgent
        }
      });
    }

    // Example implementation for LogRocket
    if (typeof (window as any).LogRocket !== 'undefined') {
      (window as any).LogRocket.captureException(new Error(errorReport.message));
    }
  }

  /**
   * Initialize error reporting (call this in app initialization)
   */
  initialize(): void {
    // Set up periodic queue processing
    setInterval(() => {
      if (this.errorQueue.length > 0 && !this.isReporting) {
        this.processQueue();
      }
    }, 30000); // Check every 30 seconds

    // Process queue on page unload
    window.addEventListener('beforeunload', () => {
      if (this.errorQueue.length > 0) {
        // Send remaining errors synchronously
        navigator.sendBeacon(
          this.environmentService.getApiUrl('/api/errors/report-batch'),
          JSON.stringify({
            errors: this.errorQueue.map(report => ({
              ...report,
              userAgent: navigator.userAgent,
              url: window.location.href,
              timestamp: new Date().toISOString()
            }))
          })
        );
      }
    });
  }
}
