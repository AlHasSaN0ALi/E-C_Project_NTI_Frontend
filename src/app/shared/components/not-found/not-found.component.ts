import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1 class="error-title">Page Not Found</h1>
        <p class="error-message">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <div class="error-actions">
          <button mat-raised-button color="primary" routerLink="/home">
            <mat-icon>home</mat-icon>
            Go Home
          </button>
          <button mat-stroked-button routerLink="/products">
            <mat-icon>shopping_bag</mat-icon>
            Browse Products
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {}
