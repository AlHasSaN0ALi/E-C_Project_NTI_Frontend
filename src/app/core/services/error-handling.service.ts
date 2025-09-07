import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';
import { EnvironmentService } from './environment.service';
import { ErrorReportingService } from './error-reporting.service';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: Date;
  additionalData?: any;
}

export interface ErrorReport {
  id: string;
  message: string;
  status?: number;
  url?: string | null;
  method?: string;
  context: ErrorContext;
  stack?: string;
  userAgent?: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  private errorReports: ErrorReport[] = [];
  private readonly MAX_ERROR_REPORTS = 100;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
    private environmentService: EnvironmentService,
    private errorReportingService: ErrorReportingService
  ) {}

  /**
   * Handle HTTP errors with context
   */
  handleHttpError(error: HttpErrorResponse, context?: ErrorContext): void {
    const errorReport = this.createErrorReport(error, context);
    this.logError(errorReport);
    
    // Handle specific error types
    switch (error.status) {
      case 0:
        this.handleNetworkError(errorReport);
        break;
      case 400:
        this.handleBadRequestError(errorReport);
        break;
      case 401:
        this.handleUnauthorizedError(errorReport);
        break;
      case 403:
        this.handleForbiddenError(errorReport);
        break;
      case 404:
        this.handleNotFoundError(errorReport);
        break;
      case 409:
        this.handleConflictError(errorReport);
        break;
      case 422:
        this.handleValidationError(errorReport);
        break;
      case 429:
        this.handleRateLimitError(errorReport);
        break;
      case 500:
      case 502:
      case 503:
        this.handleServerError(errorReport);
        break;
      default:
        this.handleGenericError(errorReport);
    }
  }

  /**
   * Handle application errors (non-HTTP)
   */
  handleApplicationError(error: Error, context?: ErrorContext): void {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: error.message || 'An unexpected error occurred',
      context: context || {},
      stack: error.stack,
      userAgent: navigator.userAgent,
      timestamp: new Date()
    };

    this.logError(errorReport);
    this.notificationService.error(
      'An unexpected error occurred. Please try again.',
      'Application Error'
    );
  }

  /**
   * Handle validation errors
   */
  handleValidationError(errorReport: ErrorReport): void {
    const message = this.extractValidationMessage(errorReport);
    this.notificationService.error(message, 'Validation Error');
  }

  /**
   * Handle network errors
   */
  private handleNetworkError(errorReport: ErrorReport): void {
    this.notificationService.error(
      'Unable to connect to the server. Please check your internet connection and try again.',
      'Connection Error'
    );
  }

  /**
   * Handle bad request errors
   */
  private handleBadRequestError(errorReport: ErrorReport): void {
    const message = this.extractErrorMessage(errorReport) || 'Invalid request. Please check your input.';
    this.notificationService.error(message, 'Invalid Request');
  }

  /**
   * Handle unauthorized errors
   */
  private handleUnauthorizedError(errorReport: ErrorReport): void {
    this.notificationService.error(
      'Your session has expired. Please login again.',
      'Session Expired'
    );
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Handle forbidden errors
   */
  private handleForbiddenError(errorReport: ErrorReport): void {
    this.notificationService.error(
      'You do not have permission to access this resource.',
      'Access Denied'
    );
    
    // Redirect to appropriate page based on context
    if (errorReport.url?.includes('/admin')) {
      this.router.navigate(['/unauthorized']);
    }
  }

  /**
   * Handle not found errors
   */
  private handleNotFoundError(errorReport: ErrorReport): void {
    const message = this.extractErrorMessage(errorReport) || 'The requested resource was not found.';
    this.notificationService.error(message, 'Not Found');
  }

  /**
   * Handle conflict errors
   */
  private handleConflictError(errorReport: ErrorReport): void {
    const message = this.extractErrorMessage(errorReport) || 'A conflict occurred. The resource may already exist.';
    this.notificationService.error(message, 'Conflict');
  }

  /**
   * Handle rate limit errors
   */
  private handleRateLimitError(errorReport: ErrorReport): void {
    this.notificationService.warning(
      'Too many requests. Please wait a moment and try again.',
      'Rate Limit Exceeded'
    );
  }

  /**
   * Handle server errors
   */
  private handleServerError(errorReport: ErrorReport): void {
    this.notificationService.error(
      'Server error occurred. Please try again later.',
      'Server Error'
    );
  }

  /**
   * Handle generic errors
   */
  private handleGenericError(errorReport: ErrorReport): void {
    const message = this.extractErrorMessage(errorReport) || 'An error occurred. Please try again.';
    this.notificationService.error(message, 'Error');
  }

  /**
   * Create error report from HTTP error
   */
  private createErrorReport(error: HttpErrorResponse, context?: ErrorContext): ErrorReport {
    return {
      id: this.generateErrorId(),
      message: this.extractErrorMessage({ message: error.message } as any),
      status: error.status,
      url: error.url,
      method: 'HTTP',
      context: context || {},
      stack: error.error?.stack,
      userAgent: navigator.userAgent,
      timestamp: new Date()
    };
  }

  /**
   * Extract error message from various error formats
   */
  private extractErrorMessage(errorReport: any): string {
    if (errorReport.message) {
      return errorReport.message;
    }

    if (errorReport.error) {
      if (typeof errorReport.error === 'string') {
        return errorReport.error;
      }
      
      if (errorReport.error.message) {
        return errorReport.error.message;
      }

      if (errorReport.error.errors && Array.isArray(errorReport.error.errors)) {
        return errorReport.error.errors.map((err: any) => err.msg || err.message).join(', ');
      }
    }

    return 'An error occurred';
  }

  /**
   * Extract validation error messages
   */
  private extractValidationMessage(errorReport: ErrorReport): string {
    // This would be enhanced based on your backend validation error format
    return this.extractErrorMessage(errorReport);
  }

  /**
   * Log error for debugging and monitoring
   */
  private logError(errorReport: ErrorReport): void {
    // Add to local error reports
    this.errorReports.unshift(errorReport);
    if (this.errorReports.length > this.MAX_ERROR_REPORTS) {
      this.errorReports = this.errorReports.slice(0, this.MAX_ERROR_REPORTS);
    }

    // Log to console in development
    if (!this.environmentService.isProduction()) {
      console.error('Error Report:', errorReport);
    }

    // In production, you might want to send to error tracking service
    if (this.environmentService.isProduction()) {
      this.sendErrorToTrackingService(errorReport);
    }
  }

  /**
   * Send error to external tracking service (e.g., Sentry)
   */
  private sendErrorToTrackingService(errorReport: ErrorReport): void {
    // Implementation would depend on your error tracking service
    // Example: Sentry.captureException(errorReport);
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get error reports for debugging
   */
  getErrorReports(): ErrorReport[] {
    return [...this.errorReports];
  }

  /**
   * Clear error reports
   */
  clearErrorReports(): void {
    this.errorReports = [];
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): any {
    const stats = {
      total: this.errorReports.length,
      byStatus: {} as any,
      byComponent: {} as any,
      recent: this.errorReports.filter(report => 
        Date.now() - report.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
      ).length
    };

    this.errorReports.forEach(report => {
      // Count by status
      if (report.status) {
        stats.byStatus[report.status] = (stats.byStatus[report.status] || 0) + 1;
      }

      // Count by component
      if (report.context.component) {
        stats.byComponent[report.context.component] = (stats.byComponent[report.context.component] || 0) + 1;
      }
    });

    return stats;
  }
}
