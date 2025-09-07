import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="admin-categories-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Admin Categories</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Admin categories functionality will be implemented in Phase 8.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-categories-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class CategoriesComponent {}
