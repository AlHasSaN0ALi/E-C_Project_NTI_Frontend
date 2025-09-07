import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="spinner-container" [class.inline]="inline">
      <mat-spinner [diameter]="diameter" [color]="color"></mat-spinner>
      <p class="spinner-text" *ngIf="message">{{ message }}</p>
    </div>
  `,
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent {
  @Input() diameter: number = 40;
  @Input() color: string = 'primary';
  @Input() message: string = '';
  @Input() inline: boolean = false;
}
