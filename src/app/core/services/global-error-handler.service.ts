import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { ErrorHandlingService } from './error-handling.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private errorHandlingService: ErrorHandlingService,
    private ngZone: NgZone
  ) {}

  handleError(error: any): void {
    // Run outside Angular zone to avoid infinite loops
    this.ngZone.run(() => {
      // Handle different types of errors
      if (error instanceof Error) {
        this.errorHandlingService.handleApplicationError(error, {
          component: 'Global',
          action: 'Unhandled Error',
          timestamp: new Date()
        });
      } else if (error.rejection) {
        // Handle promise rejections
        this.errorHandlingService.handleApplicationError(
          new Error(error.rejection),
          {
            component: 'Global',
            action: 'Promise Rejection',
            timestamp: new Date()
          }
        );
      } else {
        // Handle other types of errors
        this.errorHandlingService.handleApplicationError(
          new Error(error.toString()),
          {
            component: 'Global',
            action: 'Unknown Error',
            timestamp: new Date()
          }
        );
      }
    });
  }
}
