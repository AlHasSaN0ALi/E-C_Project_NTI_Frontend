import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingHelperService } from '../../../../core/services/loading-helper.service';
import { ErrorHandlingService } from '../../../../core/services/error-handling.service';
import { User } from '../../../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h1 class="profile-title">
          <mat-icon>person</mat-icon>
          My Profile
        </h1>
        <p class="profile-subtitle">Manage your account information and preferences</p>
      </div>

      <mat-tab-group class="profile-tabs" animationDuration="300ms">
        <!-- Personal Information Tab -->
        <mat-tab label="Personal Information">
          <div class="tab-content">
            <mat-card class="profile-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>person</mat-icon>
                  Personal Details
                </mat-card-title>
                <mat-card-subtitle>Update your personal information</mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="profile-form">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>First Name</mat-label>
                      <input 
                        matInput 
                        type="text" 
                        formControlName="firstName"
                        placeholder="Enter first name"
                      >
                      <mat-icon matSuffix>person</mat-icon>
                      <mat-error *ngIf="profileForm.get('firstName')?.hasError('required')">
                        First name is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Last Name</mat-label>
                      <input 
                        matInput 
                        type="text" 
                        formControlName="lastName"
                        placeholder="Enter last name"
                      >
                      <mat-icon matSuffix>person</mat-icon>
                      <mat-error *ngIf="profileForm.get('lastName')?.hasError('required')">
                        Last name is required
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Email Address</mat-label>
                    <input 
                      matInput 
                      type="email" 
                      formControlName="email"
                      placeholder="Enter email address"
                      readonly
                    >
                    <mat-icon matSuffix>email</mat-icon>
                    <mat-hint>Email cannot be changed</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Phone Number</mat-label>
                    <input 
                      matInput 
                      type="tel" 
                      formControlName="phone"
                      placeholder="Enter phone number"
                    >
                    <mat-icon matSuffix>phone</mat-icon>
                    <mat-error *ngIf="profileForm.get('phone')?.hasError('pattern')">
                      Please enter a valid phone number
                    </mat-error>
                  </mat-form-field>

                  <div class="form-actions">
                    <button 
                      mat-raised-button 
                      color="primary" 
                      type="submit"
                      [disabled]="profileForm.invalid"
                    >
                      <mat-icon>save</mat-icon>
                      Update Profile
                    </button>
                    <button 
                      mat-button 
                      type="button"
                      (click)="resetProfileForm()"
                      [disabled]="false"
                    >
                      <mat-icon>refresh</mat-icon>
                      Reset
                    </button>
                  </div>

                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Change Password Tab -->
        <mat-tab label="Change Password">
          <div class="tab-content">
            <mat-card class="profile-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>lock</mat-icon>
                  Change Password
                </mat-card-title>
                <mat-card-subtitle>Update your password for security</mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="password-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Current Password</mat-label>
                    <input 
                      matInput 
                      [type]="hideCurrentPassword ? 'password' : 'text'"
                      formControlName="currentPassword"
                      placeholder="Enter current password"
                    >
                    <button 
                      mat-icon-button 
                      matSuffix 
                      type="button"
                      (click)="hideCurrentPassword = !hideCurrentPassword"
                    >
                      <mat-icon>{{hideCurrentPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                    </button>
                    <mat-error *ngIf="passwordForm.get('currentPassword')?.hasError('required')">
                      Current password is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>New Password</mat-label>
                    <input 
                      matInput 
                      [type]="hideNewPassword ? 'password' : 'text'"
                      formControlName="newPassword"
                      placeholder="Enter new password"
                    >
                    <button 
                      mat-icon-button 
                      matSuffix 
                      type="button"
                      (click)="hideNewPassword = !hideNewPassword"
                    >
                      <mat-icon>{{hideNewPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                    </button>
                    <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">
                      New password is required
                    </mat-error>
                    <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">
                      Password must be at least 6 characters
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Confirm New Password</mat-label>
                    <input 
                      matInput 
                      [type]="hideConfirmPassword ? 'password' : 'text'"
                      formControlName="confirmPassword"
                      placeholder="Confirm new password"
                    >
                    <button 
                      mat-icon-button 
                      matSuffix 
                      type="button"
                      (click)="hideConfirmPassword = !hideConfirmPassword"
                    >
                      <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                    </button>
                    <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
                      Please confirm your password
                    </mat-error>
                    <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('passwordMismatch')">
                      Passwords do not match
                    </mat-error>
                  </mat-form-field>

                  <div class="form-actions">
                    <button 
                      mat-raised-button 
                      color="primary" 
                      type="submit"
                      [disabled]="passwordForm.invalid"
                    >
                      <mat-icon>lock</mat-icon>
                      Change Password
                    </button>
                    <button 
                      mat-button 
                      type="button"
                      (click)="resetPasswordForm()"
                      [disabled]="false"
                    >
                      <mat-icon>refresh</mat-icon>
                      Reset
                    </button>
                  </div>

                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Account Information Tab -->
        <mat-tab label="Account Information">
          <div class="tab-content">
            <mat-card class="profile-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>info</mat-icon>
                  Account Details
                </mat-card-title>
                <mat-card-subtitle>View your account information</mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <div class="account-info">
                  <div class="info-item">
                    <mat-icon>person</mat-icon>
                    <div class="info-content">
                      <h4>Full Name</h4>
                      <p>{{ currentUser?.firstName }} {{ currentUser?.lastName }}</p>
                    </div>
                  </div>

                  <div class="info-item">
                    <mat-icon>email</mat-icon>
                    <div class="info-content">
                      <h4>Email Address</h4>
                      <p>{{ currentUser?.email }}</p>
                    </div>
                  </div>

                  <div class="info-item">
                    <mat-icon>phone</mat-icon>
                    <div class="info-content">
                      <h4>Phone Number</h4>
                      <p>{{ currentUser?.phone || 'Not provided' }}</p>
                    </div>
                  </div>

                  <div class="info-item">
                    <mat-icon>admin_panel_settings</mat-icon>
                    <div class="info-content">
                      <h4>Account Type</h4>
                      <p>{{ currentUser?.role === 'admin' ? 'Administrator' : 'User' }}</p>
                    </div>
                  </div>

                  <div class="info-item">
                    <mat-icon>calendar_today</mat-icon>
                    <div class="info-content">
                      <h4>Member Since</h4>
                      <p>{{ currentUser?.createdAt | date:'mediumDate' }}</p>
                    </div>
                  </div>
                </div>

                <mat-divider class="divider"></mat-divider>

                <div class="account-actions">
                  <button mat-button color="warn" (click)="logout()">
                    <mat-icon>logout</mat-icon>
                    Sign Out
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .profile-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .profile-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 2rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .profile-title mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .profile-subtitle {
      color: #666;
      font-size: 1.1rem;
    }

    .profile-tabs {
      margin-top: 2rem;
    }

    .tab-content {
      padding: 2rem 0;
    }

    .profile-card {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
    }

    .profile-card mat-card-header {
      background: #f8f9fa;
      border-radius: 12px 12px 0 0;
      margin: -24px -24px 24px -24px;
      padding: 1.5rem 2rem;
    }

    .profile-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #333;
    }

    .profile-form, .password-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .half-width {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .form-actions button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .account-info {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .info-item mat-icon {
      color: #667eea;
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .info-content h4 {
      margin: 0 0 0.25rem 0;
      color: #333;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-content p {
      margin: 0;
      color: #666;
      font-size: 1rem;
    }

    .divider {
      margin: 2rem 0;
    }

    .account-actions {
      text-align: center;
    }

    .account-actions button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 auto;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 1rem;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .half-width {
        width: 100%;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  hideCurrentPassword = true;
  hideNewPassword = true;
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
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get currentUser(): User | null {
    return this.authService.currentUser;
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  private loadUserProfile(): void {
    // Load profile from backend to get latest data
    this.loadingHelper.withFormLoading(
      this.authService.getProfile(),
      'load-profile',
      'Loading profile...'
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.profileForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || ''
          });
        },
        error: (error) => {
          this.errorHandling.handleHttpError(error, {
            component: 'ProfileComponent',
            action: 'Load User Profile',
            additionalData: { userId: this.currentUser?._id }
          });
        }
      });
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      const profileData = this.profileForm.value;

      this.loadingHelper.withFormLoading(
        this.authService.updateProfile(profileData),
        'update-profile',
        'Updating profile...'
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (user) => {
            this.notificationService.success('Profile updated successfully!');
            this.loadUserProfile(); // Reload to get latest data
          },
          error: (error) => {
            this.errorHandling.handleHttpError(error, {
              component: 'ProfileComponent',
              action: 'Update User Profile',
              additionalData: { profileData: { email: profileData.email } }
            });
          }
        });
    } else {
      this.markFormGroupTouched(this.profileForm);
      this.notificationService.warning('Please fill in all required fields correctly.');
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      const passwordData = {
        currentPassword: this.passwordForm.value.currentPassword,
        newPassword: this.passwordForm.value.newPassword
      };

      this.loadingHelper.withFormLoading(
        this.authService.changePassword(passwordData),
        'change-password',
        'Changing password...'
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Password changed successfully!');
            this.resetPasswordForm();
          },
          error: (error) => {
            this.errorHandling.handleHttpError(error, {
              component: 'ProfileComponent',
              action: 'Change Password',
              additionalData: { userId: this.currentUser?._id }
            });
          }
        });
    } else {
      this.markFormGroupTouched(this.passwordForm);
      this.notificationService.warning('Please fill in all required fields correctly.');
    }
  }

  resetProfileForm(): void {
    this.loadUserProfile();
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.notificationService.success('Logged out successfully!');
        this.router.navigate(['/home']);
      },
      error: (error) => {
        // Even if logout fails, user is logged out locally
        console.warn('Logout error:', error);
        this.notificationService.info('Logged out successfully!');
        this.router.navigate(['/home']);
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}