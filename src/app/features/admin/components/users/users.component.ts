import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="admin-users-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Admin Users</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Admin users functionality will be implemented in Phase 8.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-users-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class UsersComponent {}
