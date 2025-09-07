import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';
import { EnvironmentService } from '../services/environment.service';
import { ErrorHandlingService } from '../services/error-handling.service';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);
  const loadingService = inject(LoadingService);
  const environmentService = inject(EnvironmentService);
  const errorHandlingService = inject(ErrorHandlingService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Hide loading spinner on error
      loadingService.hide();
      
      // Use the centralized error handling service
      errorHandlingService.handleHttpError(error, {
        component: 'HTTP Interceptor',
        action: `${req.method} ${req.url}`,
        timestamp: new Date()
      });

      return throwError(() => error);
    })
  );
};
