import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
import { RegisterRequest } from '../../../../core/models';

@Component({
  selector: 'app-register',
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
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header class="register-header">
          <mat-card-title class="register-title">
            <mat-icon>person_add</mat-icon>
            Create Account
          </mat-card-title>
          <mat-card-subtitle>Join us today and start shopping</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="register-content">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
            <!-- Name Fields -->
            <div class="name-fields">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>First Name</mat-label>
                <input 
                  matInput 
                  type="text" 
                  formControlName="firstName"
                  placeholder="Enter first name"
                  autocomplete="given-name"
                >
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">
                  First name is required
                </mat-error>
                <mat-error *ngIf="registerForm.get('firstName')?.hasError('minlength')">
                  First name must be at least 2 characters
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Last Name</mat-label>
                <input 
                  matInput 
                  type="text" 
                  formControlName="lastName"
                  placeholder="Enter last name"
                  autocomplete="family-name"
                >
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">
                  Last name is required
                </mat-error>
                <mat-error *ngIf="registerForm.get('lastName')?.hasError('minlength')">
                  Last name must be at least 2 characters
                </mat-error>
              </mat-form-field>
            </div>

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
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <!-- Phone Field -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Phone Number (Optional)</mat-label>
              <input 
                matInput 
                type="tel" 
                formControlName="phone"
                placeholder="Enter your phone number"
                autocomplete="tel"
              >
              <mat-icon matSuffix>phone</mat-icon>
              <mat-error *ngIf="registerForm.get('phone')?.hasError('pattern')">
                Please enter a valid phone number
              </mat-error>
            </mat-form-field>

            <!-- Password Field -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input 
                matInput 
                [type]="hidePassword ? 'password' : 'text'"
                formControlName="password"
                placeholder="Create a password"
                autocomplete="new-password"
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
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>

            <!-- Confirm Password Field -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirm Password</mat-label>
              <input 
                matInput 
                [type]="hideConfirmPassword ? 'password' : 'text'"
                formControlName="confirmPassword"
                placeholder="Confirm your password"
                autocomplete="new-password"
              >
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="hideConfirmPassword = !hideConfirmPassword"
                [attr.aria-label]="'Hide confirm password'"
                [attr.aria-pressed]="hideConfirmPassword"
              >
                <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                Please confirm your password
              </mat-error>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">
                Passwords do not match
              </mat-error>
            </mat-form-field>

            <!-- Terms and Conditions -->
            <div class="terms-section">
              <mat-checkbox formControlName="acceptTerms" class="terms-checkbox">
                I agree to the 
                <a href="#" class="terms-link">Terms of Service</a> 
                and 
                <a href="#" class="terms-link">Privacy Policy</a>
              </mat-checkbox>
              <mat-error *ngIf="registerForm.get('acceptTerms')?.hasError('required') && registerForm.get('acceptTerms')?.touched">
                You must accept the terms and conditions
              </mat-error>
            </div>

            <!-- Submit Button -->
            <button 
              mat-raised-button 
              color="primary" 
              type="submit"
              class="register-button"
              [disabled]="registerForm.invalid"
            >
              <mat-icon>person_add</mat-icon>
              Create Account
            </button>
          </form>

          <mat-divider class="divider"></mat-divider>

          <!-- Login Link -->
          <div class="login-link">
            <p>Already have an account?</p>
            <button mat-button color="primary" routerLink="/auth/login">
              <mat-icon>login</mat-icon>
              Sign In
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .register-card {
      width: 100%;
      max-width: 500px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      border-radius: 16px;
    }

    .register-header {
      text-align: center;
      padding: 2rem 2rem 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 16px 16px 0 0;
    }

    .register-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .register-title mat-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .register-content {
      padding: 2rem;
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .name-fields {
      display: flex;
      gap: 1rem;
    }

    .half-width {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .terms-section {
      margin: 0.5rem 0;
    }

    .terms-checkbox {
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .terms-link {
      color: #667eea;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .terms-link:hover {
      color: #764ba2;
      text-decoration: underline;
    }

    .register-button {
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      margin-top: 1rem;
    }

    .register-button mat-icon {
      margin-right: 0.5rem;
    }

    .divider {
      margin: 2rem 0 1rem;
    }

    .login-link {
      text-align: center;
    }

    .login-link p {
      margin: 0 0 1rem 0;
      color: #666;
    }

    .login-link button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 auto;
    }

    @media (max-width: 600px) {
      .register-container {
        padding: 1rem;
      }

      .register-content {
        padding: 1.5rem;
      }

      .name-fields {
        flex-direction: column;
        gap: 0;
      }

      .half-width {
        width: 100%;
      }
    }
  `]
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private loadingHelper: LoadingHelperService,
    private errorHandling: ErrorHandlingService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const registerData: RegisterRequest = {
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        phone: this.registerForm.value.phone || undefined
      };

      // Use loading helper for better UX
      this.loadingHelper.withFormLoading(
        this.authService.register(registerData),
        'register',
        'Creating your account...'
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.notificationService.success('Account created successfully! Welcome to Laptop Shop!');
            this.router.navigate(['/home']);
          },
          error: (error) => {
            this.errorHandling.handleHttpError(error, {
              component: 'RegisterComponent',
              action: 'User Registration',
              additionalData: { formData: { email: registerData.email } }
            });
          }
        });
    } else {
      this.markFormGroupTouched();
      this.notificationService.warning('Please fill in all required fields correctly.');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}
