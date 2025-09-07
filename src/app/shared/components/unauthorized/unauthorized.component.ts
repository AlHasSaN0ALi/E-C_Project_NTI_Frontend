import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <div class="error-icon">
          <mat-icon>block</mat-icon>
        </div>
        <h1 class="error-title">Access Denied</h1>
        <p class="error-message">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>
        <div class="error-actions">
          <button mat-raised-button color="primary" routerLink="/home">
            <mat-icon>home</mat-icon>
            Go Home
          </button>
          <button mat-stroked-button routerLink="/auth/login">
            <mat-icon>login</mat-icon>
            Login
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      padding: 2rem;
    }

    .unauthorized-content {
      text-align: center;
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      max-width: 500px;
      width: 100%;
    }

    .error-icon {
      font-size: 6rem;
      color: #ff6b6b;
      margin-bottom: 1rem;
    }

    .error-icon mat-icon {
      font-size: 6rem;
      width: 6rem;
      height: 6rem;
    }

    .error-title {
      font-size: 2rem;
      color: #333;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .error-message {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .error-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .error-actions button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    @media (max-width: 600px) {
      .unauthorized-container {
        padding: 1rem;
      }

      .unauthorized-content {
        padding: 2rem;
      }

      .error-icon {
        font-size: 4rem;
      }

      .error-icon mat-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
      }

      .error-title {
        font-size: 1.5rem;
      }

      .error-actions {
        flex-direction: column;
        align-items: center;
      }

      .error-actions button {
        width: 100%;
        max-width: 200px;
      }
    }
  `]
})
export class UnauthorizedComponent {}
