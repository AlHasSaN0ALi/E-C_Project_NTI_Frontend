import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    filename: string;
    size: number;
    mimeType: string;
  };
}

export interface MultipleUploadResponse {
  success: boolean;
  message: string;
  data: {
    urls: string[];
    filenames: string[];
    totalSize: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private readonly apiUrl = `${environment.apiUrl}/upload`;
  private uploadProgress$ = new BehaviorSubject<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });

  constructor(private http: HttpClient) {}

  /**
   * Upload a single file with progress tracking
   */
  uploadFile(file: File, folder: string = 'products'): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    return this.http.post<UploadResponse>(`${this.apiUrl}/single`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<UploadResponse>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            if (event.total) {
              const progress: UploadProgress = {
                loaded: event.loaded,
                total: event.total,
                percentage: Math.round((event.loaded / event.total) * 100)
              };
              this.uploadProgress$.next(progress);
            }
            return null;
          case HttpEventType.Response:
            return event.body!;
          default:
            return null;
        }
      }),
      tap((response) => {
        if (response) {
          // Reset progress when upload completes
          this.uploadProgress$.next({ loaded: 0, total: 0, percentage: 0 });
        }
      })
    );
  }

  /**
   * Upload multiple files with progress tracking
   */
  uploadMultipleFiles(files: File[], folder: string = 'products'): Observable<MultipleUploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('folder', folder);

    return this.http.post<MultipleUploadResponse>(`${this.apiUrl}/multiple`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<MultipleUploadResponse>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            if (event.total) {
              const progress: UploadProgress = {
                loaded: event.loaded,
                total: event.total,
                percentage: Math.round((event.loaded / event.total) * 100)
              };
              this.uploadProgress$.next(progress);
            }
            return null;
          case HttpEventType.Response:
            return event.body!;
          default:
            return null;
        }
      }),
      tap((response) => {
        if (response) {
          // Reset progress when upload completes
          this.uploadProgress$.next({ loaded: 0, total: 0, percentage: 0 });
        }
      })
    );
  }

  /**
   * Delete an uploaded file
   */
  deleteFile(filename: string, folder: string = 'products'): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/delete`, {
      params: { filename, folder }
    });
  }

  /**
   * Get upload progress observable
   */
  getUploadProgress(): Observable<UploadProgress> {
    return this.uploadProgress$.asObservable();
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, maxSize: number = 5 * 1024 * 1024, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${this.formatFileSize(maxSize)}`
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Generate preview URL for file
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke preview URL to free memory
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Compress image before upload
   */
  compressImage(file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = this.createPreviewUrl(file);
    });
  }
}
