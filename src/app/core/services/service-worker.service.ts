import { Injectable, Optional, Inject } from '@angular/core';
import { filter, map } from 'rxjs/operators';
import { NotificationService } from './notification.service';

// Service Worker types (fallback if @angular/service-worker not available)
interface SwUpdate {
  isEnabled: boolean;
  checkForUpdate(): Promise<void>;
  activateUpdate(): Promise<void>;
  versionUpdates: any;
  currentVersion?: string;
  availableVersion?: string;
}

interface VersionReadyEvent {
  type: string;
  latestVersion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceWorkerService {
  private swUpdate: SwUpdate | null = null;

  constructor(
    @Optional() @Inject('SwUpdate') swUpdate: any,
    
    private notificationService: NotificationService
  ) {
    this.swUpdate = swUpdate;
    if (this.swUpdate) {
      this.checkForUpdates();
      this.handleUpdates();
    }
  }

  /**
   * Check for app updates
   */
  checkForUpdates(): void {
    if (this.swUpdate?.isEnabled) {
      this.swUpdate.checkForUpdate().then(() => {
        console.log('Checking for updates...');
      }).catch((err: any) => {
        console.error('Error checking for updates:', err);
      });
    }
  }

  /**
   * Handle app updates
   */
  private handleUpdates(): void {
    if (this.swUpdate?.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(
          filter((evt: any): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
          map((evt: VersionReadyEvent) => evt.latestVersion)
        )
        .subscribe(() => {
          this.notifyUserOfUpdate();
        });
    }
  }

  /**
   * Notify user of available update
   */
  private notifyUserOfUpdate(): void {
    this.notificationService.info(
      'A new version of the app is available. Click to update.',
      'Update Available'
    );
  }

  /**
   * Activate the update
   */
  activateUpdate(): void {
    if (this.swUpdate?.isEnabled) {
      this.swUpdate.activateUpdate().then(() => {
        this.notificationService.success('App updated successfully!');
        // Reload the page to apply the update
        window.location.reload();
      }).catch((err: any) => {
        console.error('Error activating update:', err);
        this.notificationService.error('Failed to update the app');
      });
    }
  }

  /**
   * Check if service worker is enabled
   */
  isServiceWorkerEnabled(): boolean {
    return this.swUpdate?.isEnabled || false;
  }

  /**
   * Get current version
   */
  getCurrentVersion(): string {
    return this.swUpdate?.currentVersion || 'Unknown';
  }

  /**
   * Get available version
   */
  getAvailableVersion(): string {
    return this.swUpdate?.availableVersion || 'Unknown';
  }

  /**
   * Force check for updates
   */
  forceCheckForUpdates(): Promise<boolean> {
    if (this.swUpdate?.isEnabled) {
      return this.swUpdate.checkForUpdate().then(() => true);
    }
    return Promise.resolve(false);
  }
}
