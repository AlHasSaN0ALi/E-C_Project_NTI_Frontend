import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-analytics',
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
          <h2>Analytics Dashboard</h2>
          <p>This component will display comprehensive analytics including sales reports, user analytics, product performance, and business insights.</p>
          <button mat-raised-button color="primary">
            <mat-icon>analytics</mat-icon>
            View Analytics
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
export class AnalyticsComponent {}
