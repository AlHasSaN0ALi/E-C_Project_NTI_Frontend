import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-overlay" *ngIf="isLoading">
      <div class="loading-content">
        <mat-spinner [diameter]="diameter" [color]="color"></mat-spinner>
        <p class="loading-text" *ngIf="message">{{ message }}</p>
      </div>
    </div>
  `,
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
  @Input() diameter: number = 50;
  @Input() color: string = 'primary';
  @Input() message: string = '';

  constructor(public loadingService: LoadingService) {}

  get isLoading(): boolean {
    return this.loadingService.isLoading;
  }
}
