
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  // Success notification
  success(message: string, title?: string): void {
    if (this.toastr) {
      this.toastr.success(message, title || 'Success');
    }
  }

  // Error notification
  error(message: string, title?: string): void {
    if (this.toastr) {
      this.toastr.error(message, title || 'Error');
    }
  }

  // Warning notification
  warning(message: string, title?: string): void {
    if (this.toastr) {
      this.toastr.warning(message, title || 'Warning');
    }
  }

  // Info notification
  info(message: string, title?: string): void {
    if (this.toastr) {
      this.toastr.info(message, title || 'Info');
    }
  }

  // Clear all notifications
  clear(): void {
    this.toastr.clear();
  }
}
