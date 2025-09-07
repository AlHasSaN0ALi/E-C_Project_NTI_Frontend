import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingHelperService } from '../../../../core/services/loading-helper.service';
import { ErrorHandlingService } from '../../../../core/services/error-handling.service';
import { LoginRequest } from '../../../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header class="login-header">
          <mat-card-title class="login-title">
            <mat-icon>login</mat-icon>
            Welcome Back
          </mat-card-title>
          <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="login-content">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <!-- Email Field -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <input 
                matInput 
                type="email" 
                formControlName="email"
                placeholder="Enter your email"
                autocomplete="email"
              >
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <!-- Password Field -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input 
                matInput 
                [type]="hidePassword ? 'password' : 'text'"
                formControlName="password"
                placeholder="Enter your password"
                autocomplete="current-password"
              >
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="hidePassword = !hidePassword"
                [attr.aria-label]="'Hide password'"
                [attr.aria-pressed]="hidePassword"
              >
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>

            <!-- Remember Me & Forgot Password -->
            <div class="login-options">
              <mat-checkbox formControlName="rememberMe" class="remember-me">
                Remember me
              </mat-checkbox>
              <a routerLink="/auth/forgot-password" class="forgot-password">
                Forgot password?
              </a>
            </div>

            <!-- Submit Button -->
            <button 
              mat-raised-button 
              color="primary" 
              type="submit"
              class="login-button"
              [disabled]="loginForm.invalid"
            >
              <mat-icon>login</mat-icon>
              Sign In
            </button>
          </form>

          <mat-divider class="divider"></mat-divider>

          <!-- Register Link -->
          <div class="register-link">
            <p>Don't have an account?</p>
            <button mat-button color="primary" routerLink="/auth/register">
              <mat-icon>person_add</mat-icon>
              Create Account
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .login-card {
      width: 100%;
      max-width: 450px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      border-radius: 16px;
    }

    .login-header {
      text-align: center;
      padding: 2rem 2rem 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 16px 16px 0 0;
    }

    .login-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .login-title mat-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .login-content {
      padding: 2rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .full-width {
      width: 100%;
    }

    .login-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: -0.5rem 0;
    }

    .remember-me {
      font-size: 0.9rem;
    }

    .forgot-password {
      color: #667eea;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s ease;
    }

    .forgot-password:hover {
      color: #764ba2;
      text-decoration: underline;
    }

    .login-button {
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      margin-top: 1rem;
    }

    .login-button mat-icon {
      margin-right: 0.5rem;
    }

    .divider {
      margin: 2rem 0 1rem;
    }

    .register-link {
      text-align: center;
    }

    .register-link p {
      margin: 0 0 1rem 0;
      color: #666;
    }

    .register-link button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 auto;
    }

    @media (max-width: 600px) {
      .login-container {
        padding: 1rem;
      }

      .login-content {
        padding: 1.5rem;
      }

      .login-options {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  hidePassword = true;
  private destroy$ = new Subject<void>();
  private returnUrl: string = '/home';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private loadingHelper: LoadingHelperService,
    private errorHandling: ErrorHandlingService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/home']);
      return;
    }

    // Get return URL from route parameters or default to home
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const loginData: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      // Use loading helper for better UX
      this.loadingHelper.withFormLoading(
        this.authService.login(loginData),
        'login',
        'Signing you in...'
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.notificationService.success(`Welcome back, ${response.data.user.firstName}!`);
            
            // Handle remember me functionality
            if (this.loginForm.value.rememberMe) {
              // Token will be stored with longer expiration by the backend
              this.notificationService.info('You will stay logged in for 30 days');
            }
            
            // Redirect to intended page or home
            this.router.navigate([this.returnUrl]);
          },
          error: (error) => {
            this.errorHandling.handleHttpError(error, {
              component: 'LoginComponent',
              action: 'User Login',
              additionalData: { formData: { email: loginData.email } }
            });
          }
        });
    } else {
      this.markFormGroupTouched();
      this.notificationService.warning('Please fill in all required fields correctly.');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
