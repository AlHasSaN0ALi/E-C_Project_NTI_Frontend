import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-category-details',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="category-details-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Category Details</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Category details functionality will be implemented in Phase 4.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .category-details-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class CategoryDetailsComponent {}
