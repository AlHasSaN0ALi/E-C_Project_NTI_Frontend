import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject, takeUntil } from 'rxjs';
import { FileUploadService, UploadProgress } from '../../../../core/services/file-upload.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ImageUploadComponent } from '../../../../shared/components/image-upload/image-upload.component';

export interface ProductImage {
  id: string;
  url: string;
  filename: string;
  isMain: boolean;
  order: number;
  size: number;
  uploadedAt: Date;
}

@Component({
  selector: 'app-product-image-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    ImageUploadComponent
  ],
  templateUrl: './product-image-management.component.html',
  styleUrls: ['./product-image-management.component.scss']
})
export class ProductImageManagementComponent implements OnInit, OnDestroy {
  @Input() productId: string = '';
  @Input() images: ProductImage[] = [];
  @Input() maxImages: number = 10;
  @Input() disabled: boolean = false;

  @Output() imagesUpdated = new EventEmitter<ProductImage[]>();
  @Output() mainImageChanged = new EventEmitter<string>();

  uploading = false;
  uploadProgress = 0;
  selectedImages: ProductImage[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fileUploadService: FileUploadService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fileUploadService.getUploadProgress()
      .pipe(takeUntil(this.destroy$))
      .subscribe(progress => {
        this.uploadProgress = progress.percentage;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFilesSelected(files: File[]): void {
    console.log('Files selected:', files);
  }

  onFilesUploaded(urls: string[]): void {
    const newImages: ProductImage[] = urls.map((url, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      url,
      filename: this.extractFilenameFromUrl(url),
      isMain: this.images.length === 0 && index === 0, // First image becomes main if no images exist
      order: this.images.length + index,
      size: 0, // Would be set by backend
      uploadedAt: new Date()
    }));

    this.images = [...this.images, ...newImages];
    this.imagesUpdated.emit(this.images);
    this.notificationService.success(`${urls.length} image(s) uploaded successfully`);
  }

  onUploadError(error: string): void {
    this.notificationService.error(`Upload failed: ${error}`);
  }

  onUploadProgress(progress: UploadProgress): void {
    this.uploading = progress.percentage > 0 && progress.percentage < 100;
  }

  setMainImage(image: ProductImage): void {
    if (image.isMain) return;

    // Update all images to not be main
    this.images = this.images.map(img => ({
      ...img,
      isMain: img.id === image.id
    }));

    this.imagesUpdated.emit(this.images);
    this.mainImageChanged.emit(image.url);
    this.notificationService.success('Main image updated');
  }

  removeImage(image: ProductImage): void {
    if (confirm('Are you sure you want to remove this image?')) {
      // If removing main image, set another as main
      if (image.isMain && this.images.length > 1) {
        const nextImage = this.images.find(img => img.id !== image.id);
        if (nextImage) {
          nextImage.isMain = true;
        }
      }

      // Remove the image
      this.images = this.images.filter(img => img.id !== image.id);
      this.imagesUpdated.emit(this.images);

      // Delete from server
      this.fileUploadService.deleteFile(image.filename, 'products')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Image removed successfully');
          },
          error: (error) => {
            console.error('Error deleting image:', error);
            this.notificationService.warning('Image removed locally but may still exist on server');
          }
        });
    }
  }

  reorderImages(fromIndex: number, toIndex: number): void {
    const images = [...this.images];
    const [movedImage] = images.splice(fromIndex, 1);
    images.splice(toIndex, 0, movedImage);

    // Update order property
    this.images = images.map((img, index) => ({
      ...img,
      order: index
    }));

    this.imagesUpdated.emit(this.images);
  }

  toggleImageSelection(image: ProductImage): void {
    const index = this.selectedImages.findIndex(img => img.id === image.id);
    if (index > -1) {
      this.selectedImages.splice(index, 1);
    } else {
      this.selectedImages.push(image);
    }
  }

  isImageSelected(image: ProductImage): boolean {
    return this.selectedImages.some(img => img.id === image.id);
  }

  selectAllImages(): void {
    this.selectedImages = [...this.images];
  }

  clearSelection(): void {
    this.selectedImages = [];
  }

  deleteSelectedImages(): void {
    if (this.selectedImages.length === 0) return;

    const mainImageSelected = this.selectedImages.some(img => img.isMain);
    const remainingImages = this.images.filter(img => !this.selectedImages.some(selected => selected.id === img.id));

    if (mainImageSelected && remainingImages.length > 0) {
      // Set first remaining image as main
      remainingImages[0].isMain = true;
    }

    if (confirm(`Are you sure you want to delete ${this.selectedImages.length} selected image(s)?`)) {
      // Delete from server
      const deletePromises = this.selectedImages.map(image =>
        this.fileUploadService.deleteFile(image.filename, 'products').toPromise()
      );

      Promise.all(deletePromises).then(() => {
        this.images = remainingImages;
        this.imagesUpdated.emit(this.images);
        this.selectedImages = [];
        this.notificationService.success('Selected images deleted successfully');
      }).catch(error => {
        console.error('Error deleting images:', error);
        this.notificationService.warning('Some images may not have been deleted from server');
      });
    }
  }

  openImagePreview(image: ProductImage): void {
    // This would open a dialog with full-size image preview
    console.log('Open image preview:', image.url);
  }

  downloadImage(image: ProductImage): void {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.filename;
    link.click();
  }

  getImageSize(image: ProductImage): string {
    return this.fileUploadService.formatFileSize(image.size);
  }

  getMainImage(): ProductImage | null {
    return this.images.find(img => img.isMain) || null;
  }

  getAdditionalImages(): ProductImage[] {
    return this.images.filter(img => !img.isMain);
  }

  canSetAsMain(image: ProductImage): boolean {
    return !image.isMain && !this.disabled;
  }

  canRemoveImage(image: ProductImage): boolean {
    return !this.disabled;
  }

  canReorderImages(): boolean {
    return this.images.length > 1 && !this.disabled;
  }

  private extractFilenameFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1] || 'unknown';
  }
}
