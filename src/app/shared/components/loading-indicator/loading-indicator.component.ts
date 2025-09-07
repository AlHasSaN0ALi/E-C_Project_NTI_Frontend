import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoadingStateService, LoadingType, LoadingStateItem } from '../../../core/services/loading-state.service';
import { LoadingService } from '../../../core/services/loading.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="loading-indicator" *ngIf="shouldShowLoading">
      <!-- Global Loading Overlay -->
      <div class="global-loading-overlay" *ngIf="showGlobalLoading">
        <div class="loading-content">
          <mat-spinner [diameter]="50"></mat-spinner>
          <p class="loading-message">{{ globalLoadingMessage }}</p>
        </div>
      </div>

      <!-- Component Loading -->
      <div class="component-loading" *ngIf="showComponentLoading">
        <div class="loading-content">
          <mat-spinner [diameter]="30"></mat-spinner>
          <span class="loading-text">{{ componentLoadingMessage }}</span>
        </div>
      </div>

      <!-- Button Loading -->
      <div class="button-loading" *ngIf="showButtonLoading">
        <mat-spinner [diameter]="20"></mat-spinner>
        <span class="button-text">{{ buttonLoadingMessage }}</span>
      </div>

      <!-- Form Loading -->
      <div class="form-loading" *ngIf="showFormLoading">
        <div class="loading-content">
          <mat-spinner [diameter]="25"></mat-spinner>
          <p class="form-message">{{ formLoadingMessage }}</p>
        </div>
      </div>

      <!-- Upload Loading with Progress -->
      <div class="upload-loading" *ngIf="showUploadLoading">
        <div class="upload-content">
          <mat-icon class="upload-icon">cloud_upload</mat-icon>
          <p class="upload-message">{{ uploadLoadingMessage }}</p>
          <mat-progress-bar 
            *ngIf="uploadProgress !== undefined" 
            [value]="uploadProgress"
            mode="determinate">
          </mat-progress-bar>
          <p class="upload-progress-text" *ngIf="uploadProgress !== undefined">
            {{ uploadProgress }}% complete
          </p>
        </div>
      </div>

      <!-- Search Loading -->
      <div class="search-loading" *ngIf="showSearchLoading">
        <div class="search-content">
          <mat-spinner [diameter]="20"></mat-spinner>
          <span class="search-text">{{ searchLoadingMessage }}</span>
        </div>
      </div>

      <!-- Navigation Loading -->
      <div class="navigation-loading" *ngIf="showNavigationLoading">
        <div class="navigation-content">
          <mat-spinner [diameter]="25"></mat-spinner>
          <p class="navigation-message">{{ navigationLoadingMessage }}</p>
        </div>
      </div>

      <!-- Loading Statistics (Development Only) -->
      <div class="loading-stats" *ngIf="showStats">
        <div class="stats-content">
          <h4>Loading Statistics</h4>
          <p>Total Active: {{ loadingCount }}</p>
          <p>Global: {{ globalCount }}</p>
          <p>Component: {{ componentCount }}</p>
          <p>Button: {{ buttonCount }}</p>
          <p>Form: {{ formCount }}</p>
          <p>Upload: {{ uploadCount }}</p>
          <p>Search: {{ searchCount }}</p>
          <p>Navigation: {{ navigationCount }}</p>
          <button mat-button (click)="toggleStats()">Hide Stats</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./loading-indicator.component.scss']
})
export class LoadingIndicatorComponent implements OnInit, OnDestroy {
  @Input() showGlobal = true;
  @Input() showComponent = true;
  @Input() showButton = true;
  @Input() showForm = true;
  @Input() showUpload = true;
  @Input() showSearch = true;
  @Input() showNavigation = true;
  @Input() showStats = false; // For development

  private destroy$ = new Subject<void>();

  // Loading states
  shouldShowLoading = false;
  showGlobalLoading = false;
  showComponentLoading = false;
  showButtonLoading = false;
  showFormLoading = false;
  showUploadLoading = false;
  showSearchLoading = false;
  showNavigationLoading = false;

  // Loading messages
  globalLoadingMessage = 'Loading...';
  componentLoadingMessage = 'Loading...';
  buttonLoadingMessage = 'Loading...';
  formLoadingMessage = 'Processing...';
  uploadLoadingMessage = 'Uploading...';
  searchLoadingMessage = 'Searching...';
  navigationLoadingMessage = 'Navigating...';

  // Progress
  uploadProgress: number | undefined;

  // Statistics
  loadingCount = 0;
  globalCount = 0;
  componentCount = 0;
  buttonCount = 0;
  formCount = 0;
  uploadCount = 0;
  searchCount = 0;
  navigationCount = 0;

  constructor(
    private loadingStateService: LoadingStateService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    // Subscribe to loading states
    this.loadingStateService.loadingStates$
      .pipe(takeUntil(this.destroy$))
      .subscribe(states => {
        this.updateLoadingStates(states);
      });

    // Subscribe to global loading
    this.loadingService.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoading => {
        this.shouldShowLoading = isLoading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Update loading states based on current loading items
   */
  private updateLoadingStates(states: LoadingStateItem[]): void {
    this.loadingCount = states.length;

    // Update type-specific counts
    this.globalCount = states.filter(s => s.type === LoadingType.GLOBAL).length;
    this.componentCount = states.filter(s => s.type === LoadingType.COMPONENT).length;
    this.buttonCount = states.filter(s => s.type === LoadingType.BUTTON).length;
    this.formCount = states.filter(s => s.type === LoadingType.FORM).length;
    this.uploadCount = states.filter(s => s.type === LoadingType.UPLOAD).length;
    this.searchCount = states.filter(s => s.type === LoadingType.SEARCH).length;
    this.navigationCount = states.filter(s => s.type === LoadingType.NAVIGATION).length;

    // Update visibility flags
    this.showGlobalLoading = this.showGlobal && this.globalCount > 0;
    this.showComponentLoading = this.showComponent && this.componentCount > 0;
    this.showButtonLoading = this.showButton && this.buttonCount > 0;
    this.showFormLoading = this.showForm && this.formCount > 0;
    this.showUploadLoading = this.showUpload && this.uploadCount > 0;
    this.showSearchLoading = this.showSearch && this.searchCount > 0;
    this.showNavigationLoading = this.showNavigation && this.navigationCount > 0;

    // Update messages (use the most recent message for each type)
    this.updateLoadingMessages(states);
  }

  /**
   * Update loading messages
   */
  private updateLoadingMessages(states: LoadingStateItem[]): void {
    const globalState = states.find(s => s.type === LoadingType.GLOBAL);
    if (globalState?.message) {
      this.globalLoadingMessage = globalState.message;
    }

    const componentState = states.find(s => s.type === LoadingType.COMPONENT);
    if (componentState?.message) {
      this.componentLoadingMessage = componentState.message;
    }

    const buttonState = states.find(s => s.type === LoadingType.BUTTON);
    if (buttonState?.message) {
      this.buttonLoadingMessage = buttonState.message;
    }

    const formState = states.find(s => s.type === LoadingType.FORM);
    if (formState?.message) {
      this.formLoadingMessage = formState.message;
    }

    const uploadState = states.find(s => s.type === LoadingType.UPLOAD);
    if (uploadState) {
      this.uploadLoadingMessage = uploadState.message || 'Uploading...';
      this.uploadProgress = uploadState.progress;
    }

    const searchState = states.find(s => s.type === LoadingType.SEARCH);
    if (searchState?.message) {
      this.searchLoadingMessage = searchState.message;
    }

    const navigationState = states.find(s => s.type === LoadingType.NAVIGATION);
    if (navigationState?.message) {
      this.navigationLoadingMessage = navigationState.message;
    }
  }

  /**
   * Toggle statistics display
   */
  toggleStats(): void {
    this.showStats = !this.showStats;
  }
}
