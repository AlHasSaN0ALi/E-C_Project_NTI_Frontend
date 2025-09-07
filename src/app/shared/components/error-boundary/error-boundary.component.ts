import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <div class="error-boundary" *ngIf="hasError">
      <mat-card class="error-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon color="warn">error_outline</mat-icon>
            {{ errorTitle }}
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p class="error-message">{{ errorMessage }}</p>
          <div class="error-details" *ngIf="showDetails">
            <h4>Error Details:</h4>
            <pre>{{ errorDetails }}</pre>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="retry()">
            <mat-icon>refresh</mat-icon>
            Try Again
          </button>
          <button mat-button (click)="toggleDetails()">
            <mat-icon>{{ showDetails ? 'expand_less' : 'expand_more' }}</mat-icon>
            {{ showDetails ? 'Hide' : 'Show' }} Details
          </button>
          <button mat-button (click)="goHome()">
            <mat-icon>home</mat-icon>
            Go Home
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
    <ng-content *ngIf="!hasError"></ng-content>
  `,
  styleUrls: ['./error-boundary.component.scss']
})
export class ErrorBoundaryComponent implements OnInit, OnDestroy {
  @Input() fallbackMessage = 'Something went wrong. Please try again.';
  @Input() showRetryButton = true;
  @Input() showDetailsButton = true;
  @Input() showHomeButton = true;

  hasError = false;
  errorTitle = 'Error';
  errorMessage = '';
  errorDetails = '';
  showDetails = false;
  retryCount = 0;
  maxRetries = 3;

  constructor(private errorHandlingService: ErrorHandlingService) {}

  ngOnInit(): void {
    // Listen for global errors
    this.errorHandlingService.getErrorReports().forEach(report => {
      if (this.shouldShowError(report)) {
        this.displayError(report);
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  /**
   * Display error in the boundary
   */
  displayError(errorReport: any): void {
    this.hasError = true;
    this.errorTitle = this.getErrorTitle(errorReport);
    this.errorMessage = errorReport.message || this.fallbackMessage;
    this.errorDetails = this.formatErrorDetails(errorReport);
  }

  /**
   * Clear error and retry
   */
  retry(): void {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.hasError = false;
      this.showDetails = false;
      
      // Emit retry event or trigger component reload
      setTimeout(() => {
        // This would typically reload the component or retry the operation
        window.location.reload();
      }, 100);
    } else {
      this.errorMessage = 'Maximum retry attempts reached. Please refresh the page.';
    }
  }

  /**
   * Toggle error details visibility
   */
  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  /**
   * Navigate to home page
   */
  goHome(): void {
    window.location.href = '/';
  }

  /**
   * Determine if error should be shown in this boundary
   */
  private shouldShowError(errorReport: any): boolean {
    // Custom logic to determine if this boundary should handle the error
    return errorReport.context?.component !== 'HTTP Interceptor';
  }

  /**
   * Get appropriate error title based on error type
   */
  private getErrorTitle(errorReport: any): string {
    if (errorReport.status) {
      switch (errorReport.status) {
        case 404:
          return 'Page Not Found';
        case 403:
          return 'Access Denied';
        case 500:
          return 'Server Error';
        default:
          return 'Error';
      }
    }
    return 'Error';
  }

  /**
   * Format error details for display
   */
  private formatErrorDetails(errorReport: any): string {
    const details = {
      Status: errorReport.status || 'N/A',
      URL: errorReport.url || 'N/A',
      Method: errorReport.method || 'N/A',
      Component: errorReport.context?.component || 'N/A',
      Action: errorReport.context?.action || 'N/A',
      Timestamp: errorReport.timestamp || new Date().toISOString(),
      Stack: errorReport.stack || 'No stack trace available'
    };

    return JSON.stringify(details, null, 2);
  }
}