import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="placeholder">
      <mat-card>
        <mat-card-content>
          <h2>Category Management</h2>
          <p>This component will handle category CRUD operations, category hierarchy, and category analytics.</p>
          <button mat-raised-button color="primary">
            <mat-icon>add</mat-icon>
            Add Category
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .placeholder {
      padding: 24px;
      text-align: center;
    }
  `]
})
export class CategoryManagementComponent {}
