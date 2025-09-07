import { ApplicationConfig, importProvidersFrom, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { GlobalErrorHandler } from './core/services/global-error-handler.service';

import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';
import { LoadingStateInterceptor } from './core/interceptors/loading-state.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { ApiInterceptor } from './core/interceptors/api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      ApiInterceptor,
      AuthInterceptor,
      LoadingInterceptor,
      LoadingStateInterceptor,
      ErrorInterceptor
    ])),
    provideAnimations(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    importProvidersFrom(
      BrowserAnimationsModule,
      ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
        progressBar: true,
        closeButton: true,
        enableHtml: true
      })
    )
  ]
};
