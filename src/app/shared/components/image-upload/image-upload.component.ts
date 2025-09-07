import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, takeUntil } from 'rxjs';
import { FileUploadService, UploadProgress } from '../../../core/services/file-upload.service';
import { NotificationService } from '../../../core/services/notification.service';

export interface ImageFile {
  file: File;
  preview: string;
  id: string;
  uploading?: boolean;
  progress?: number;
  error?: string;
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit, OnDestroy {
  @Input() maxFiles: number = 5;
  @Input() maxFileSize: number = 5 * 1024 * 1024; // 5MB
  @Input() allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp'];
  @Input() folder: string = 'products';
  @Input() compressImages: boolean = true;
  @Input() multiple: boolean = true;
  @Input() disabled: boolean = false;

  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() filesUploaded = new EventEmitter<string[]>();
  @Output() uploadProgress = new EventEmitter<UploadProgress>();
  @Output() uploadError = new EventEmitter<string>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  images: ImageFile[] = [];
  uploading = false;
  uploadProgressValue = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private fileUploadService: FileUploadService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.fileUploadService.getUploadProgress()
      .pipe(takeUntil(this.destroy$))
      .subscribe(progress => {
        this.uploadProgressValue = progress.percentage;
        this.uploadProgress.emit(progress);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up preview URLs
    this.images.forEach(img => {
      this.fileUploadService.revokePreviewUrl(img.preview);
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(Array.from(input.files));
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) return;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFiles(Array.from(files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private async handleFiles(files: File[]): Promise<void> {
    if (this.disabled) return;

    // Check if adding these files would exceed maxFiles
    if (this.images.length + files.length > this.maxFiles) {
      this.notificationService.warning(`Maximum ${this.maxFiles} files allowed`);
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const validation = this.fileUploadService.validateFile(file, this.maxFileSize, this.allowedTypes);
      
      if (validation.valid) {
        try {
          let processedFile = file;
          
          // Compress image if enabled and it's an image
          if (this.compressImages && file.type.startsWith('image/')) {
            processedFile = await this.fileUploadService.compressImage(file);
          }
          
          validFiles.push(processedFile);
        } catch (error) {
          errors.push(`Failed to process ${file.name}: ${error}`);
        }
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    // Show validation errors
    if (errors.length > 0) {
      this.notificationService.error(errors.join(', '));
    }

    // Add valid files
    if (validFiles.length > 0) {
      this.addImages(validFiles);
      this.filesSelected.emit(validFiles);
    }
  }

  private addImages(files: File[]): void {
    files.forEach(file => {
      const imageFile: ImageFile = {
        file,
        preview: this.fileUploadService.createPreviewUrl(file),
        id: Math.random().toString(36).substr(2, 9)
      };
      this.images.push(imageFile);
    });
  }

  removeImage(index: number): void {
    const image = this.images[index];
    this.fileUploadService.revokePreviewUrl(image.preview);
    this.images.splice(index, 1);
  }

  async uploadImages(): Promise<void> {
    if (this.images.length === 0 || this.uploading) return;

    this.uploading = true;
    this.images.forEach(img => {
      img.uploading = true;
      img.progress = 0;
    });

    try {
      const files = this.images.map(img => img.file);
      
      if (this.multiple && files.length > 1) {
        // Upload multiple files
        this.fileUploadService.uploadMultipleFiles(files, this.folder)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response) {
                this.images.forEach((img, index) => {
                  img.uploading = false;
                  img.progress = 100;
                });
                this.uploading = false;
                this.filesUploaded.emit(response.data.urls);
                this.notificationService.success('Images uploaded successfully');
              }
            },
            error: (error) => {
              this.handleUploadError(error);
            }
          });
      } else {
        // Upload single files
        const uploadPromises = files.map((file, index) => 
          this.fileUploadService.uploadFile(file, this.folder)
            .pipe(takeUntil(this.destroy$))
            .toPromise()
        );

        try {
          const responses = await Promise.all(uploadPromises);
          const urls = responses.map(response => response?.data.url).filter(Boolean) as string[];
          
          this.images.forEach((img, index) => {
            img.uploading = false;
            img.progress = 100;
          });
          
          this.uploading = false;
          this.filesUploaded.emit(urls);
          this.notificationService.success('Images uploaded successfully');
        } catch (error) {
          this.handleUploadError(error);
        }
      }
    } catch (error) {
      this.handleUploadError(error);
    }
  }

  private handleUploadError(error: any): void {
    this.images.forEach(img => {
      img.uploading = false;
      img.error = 'Upload failed';
    });
    this.uploading = false;
    this.uploadError.emit(error.message || 'Upload failed');
    this.notificationService.error('Failed to upload images');
  }

  clearImages(): void {
    this.images.forEach(img => {
      this.fileUploadService.revokePreviewUrl(img.preview);
    });
    this.images = [];
  }

  triggerFileInput(): void {
    if (!this.disabled) {
      this.fileInput.nativeElement.click();
    }
  }

  getFileSize(file: File): string {
    return this.fileUploadService.formatFileSize(file.size);
  }

  formatFileSize(bytes: number): string {
    return this.fileUploadService.formatFileSize(bytes);
  }

  canUpload(): boolean {
    return this.images.length > 0 && !this.uploading && !this.disabled;
  }

  canAddMore(): boolean {
    return this.images.length < this.maxFiles && !this.disabled;
  }
}
