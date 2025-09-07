import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil, of } from 'rxjs';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { CartService } from '../../../../core/services/cart.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingHelperService } from '../../../../core/services/loading-helper.service';
import { ErrorHandlingService } from '../../../../core/services/error-handling.service';
import { LoadingType } from '../../../../core/services/loading-state.service';
import { Product, Category, Review } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatStepperModule,
    MatExpansionModule,
    MatToolbarModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  category: Category | null = null;
  relatedProducts: Product[] = [];
  reviews: Review[] = [];
  
  // Image gallery
  selectedImageIndex = 0;
  showImageGallery = false;
  
  // Purchase form
  purchaseForm!: FormGroup;
  quantity = 1;
  selectedVariant: any = null;
  
  // Loading states
  isLoading = false;
  isAddingToCart = false;
  isAddingToWishlist = false;
  isLoadingReviews = false;
  isLoadingRelated = false;
  
  // Tabs
  selectedTab = 0;
  
  // Reviews
  reviewForm!: FormGroup;
  showReviewForm = false;
  
  private destroy$ = new Subject<void>();

constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private loadingHelper: LoadingHelperService,
    private errorHandling: ErrorHandlingService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const productId = params['id'];
        if (productId) {
          this.loadProduct(productId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.purchaseForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1)]],
      variant: ['']
    });

    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      title: ['', [Validators.required, Validators.minLength(5)]],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  private loadProduct(id: string): void {
    this.loadingHelper.withLoading(
      this.productService.getProduct(id),
      'load-product',
      LoadingType.COMPONENT,
      'Loading product details...'
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product: any) => {
          console.log('Product loaded from backend:', product);
          
          // Ensure all required fields are properly initialized
          this.product = {
            _id: product._id || '',
            name: product.name || 'Unknown Product',
            description: product.description || 'No description available',
            price: product.price || 0,
            originalPrice: product.originalPrice || product.price || 0,
            category: product.category || '',
            categoryRef: product.categoryRef || null,
            images: product.images || [],
            mainImage: product.mainImage || '',
            thumbnail: product.thumbnail || '',
            stock: product.stock || 0,
            isActive: product.isActive !== undefined ? product.isActive : true,
            isFeatured: product.isFeatured || false,
            isSoftDeleted: product.isSoftDeleted || false,
            tags: product.tags || [],
            specifications: product.specifications || {},
            rating: product.rating || 0,
            reviewCount: product.reviewCount || 0,
            averageRating: product.averageRating || 0,
            isNew: product.isNew || false,
            discount: product.discount || 0,
            isWishlisted: product.isWishlisted || false,
            createdAt: product.createdAt || new Date().toISOString(),
            updatedAt: product.updatedAt || new Date().toISOString(),
            __v: product.__v || 0
          };
          
          console.log('Processed product:', this.product);
          
          this.quantity = 1;
          this.selectedImageIndex = 0;
          
          // Only load category if categoryRef exists and has _id
          if (this.product!.categoryRef && this.product!.categoryRef._id) {
            this.loadCategory(this.product!.categoryRef._id);
          } else {
            console.warn('Product categoryRef is missing or invalid:', this.product!.categoryRef);
          }
          
          this.loadReviews(id);
          
          // Only load related products if categoryRef exists and has _id
          if (this.product!.categoryRef && this.product!.categoryRef._id) {
            this.loadRelatedProducts(this.product!.categoryRef._id);
          }
        },
        error: (error: any) => {
          this.errorHandling.handleHttpError(error, {
            component: 'ProductDetailsComponent',
            action: 'Load Product',
            additionalData: { productId: id }
          });
          this.router.navigate(['/products']);
        }
      });
  }

  private loadCategory(categoryId: string): void {
    // Don't load category if categoryId is undefined or empty
    if (!categoryId || categoryId === 'undefined') {
      console.warn('Category ID is undefined, skipping category load');
      return;
    }

    this.loadingHelper.withLoading(
      this.categoryService.getCategory(categoryId),
      'load-category',
      LoadingType.COMPONENT,
      'Loading category...'
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (category: any) => {
          this.category = category;
        },
        error: (error: any) => {
          this.errorHandling.handleHttpError(error, {
            component: 'ProductDetailsComponent',
            action: 'Load Category',
            additionalData: { categoryId }
          });
        }
      });
  }

  private loadReviews(productId: string): void {
    this.isLoadingReviews = true;
    // TODO: Implement review service
    // this.reviewService.getProductReviews(productId).subscribe({
    //   next: (reviews: any) => {
    //     this.reviews = reviews.data || [];
    //     this.isLoadingReviews = false;
    //   },
    //   error: (error: any) => {
    //     console.error('Error loading reviews:', error);
    //     this.isLoadingReviews = false;
    //   }
    // });
    
    // Mock data for now
    setTimeout(() => {
      this.reviews = [];
      this.isLoadingReviews = false;
    }, 1000);
  }

  private loadRelatedProducts(categoryId: string): void {
    // Don't load related products if categoryId is undefined or empty
    if (!categoryId || categoryId === 'undefined') {
      console.warn('Category ID is undefined, skipping related products load');
      return;
    }

    this.loadingHelper.withLoading(
      this.productService.getProducts({ category: categoryId, limit: 4 }),
      'load-related-products',
      LoadingType.COMPONENT,
      'Loading related products...'
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.relatedProducts = (response.data || []).filter((p: Product) => p._id !== this.product?._id);
        },
        error: (error: any) => {
          this.errorHandling.handleHttpError(error, {
            component: 'ProductDetailsComponent',
            action: 'Load Related Products',
            additionalData: { categoryId }
          });
        }
      });
  }

  // Image gallery methods
  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  openImageGallery(): void {
    this.showImageGallery = true;
  }

  closeImageGallery(): void {
    this.showImageGallery = false;
  }

  nextImage(): void {
    const totalImages = this.getTotalImageCount();
    if (totalImages > 0) {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % totalImages;
    }
  }

  previousImage(): void {
    const totalImages = this.getTotalImageCount();
    if (totalImages > 0) {
      this.selectedImageIndex = this.selectedImageIndex === 0 
        ? totalImages - 1 
        : this.selectedImageIndex - 1;
    }
  }

  // Purchase methods
  updateQuantity(change: number): void {
    const newQuantity = this.quantity + change;
    if (newQuantity >= 1 && newQuantity <= (this.product?.stock || 0)) {
      this.quantity = newQuantity;
      this.purchaseForm.patchValue({ quantity: newQuantity });
    }
  }

  onQuantityChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newQuantity = +target.value;
    if (newQuantity >= 1 && newQuantity <= (this.product?.stock || 0)) {
      this.quantity = newQuantity;
      this.purchaseForm.patchValue({ quantity: newQuantity });
    }
  }

  addToCart(): void {
    if (!this.product) return;
    
    this.loadingHelper.withButtonLoading(
      of(this.cartService.addToCart(this.product, this.quantity)),
      'add-to-cart',
      'Adding to cart...'
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success(`${this.product?.name} added to cart!`);
        },
        error: (error: any) => {
          this.errorHandling.handleHttpError(error, {
            component: 'ProductDetailsComponent',
            action: 'Add to Cart',
            additionalData: { 
              productId: this.product?._id, 
              quantity: this.quantity 
            }
          });
        }
      });
  }

  addToWishlist(): void {
    if (!this.product || this.isAddingToWishlist) return;
    
    this.isAddingToWishlist = true;
    // TODO: Implement wishlist service
    console.log('Adding to wishlist:', this.product);
    
    // Simulate API call
    setTimeout(() => {
      this.isAddingToWishlist = false;
      // Show success message
    }, 1000);
  }

  buyNow(): void {
    if (!this.product) return;
    
    // Add to cart and proceed to checkout
    this.addToCart();
    // TODO: Navigate to checkout
    console.log('Proceeding to checkout');
  }

  // Review methods
  submitReview(): void {
    if (this.reviewForm.valid && this.product) {
      const reviewData = this.reviewForm.value;
      // TODO: Implement review service
      console.log('Submitting review:', reviewData);
      
      // Reset form
      this.reviewForm.reset({
        rating: 5,
        title: '',
        comment: ''
      });
      this.showReviewForm = false;
    }
  }

  // Utility methods
  getStars(rating: number): Array<{filled: boolean, half: boolean}> {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push({ filled: true, half: false });
      } else if (i === fullStars && hasHalfStar) {
        stars.push({ filled: false, half: true });
      } else {
        stars.push({ filled: false, half: false });
      }
    }
    return stars;
  }

  onImageError(event: any): void {
    // Prevent infinite loop by checking if we're already showing a placeholder
    if (!event.target.src.includes('data:image') && !event.target.src.includes('placeholder')) {
      // Use a data URI for a simple placeholder to avoid 404 errors
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }
  }

  getImageUrl(product: Product | null, imageIndex: number = 0): string {
    // Return placeholder if product is null
    if (!product) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }

    // For imageIndex 0, use mainImage (primary image)
    if (imageIndex === 0 && product.mainImage) {
      // If mainImage already includes the full path, use it directly
      if (product.mainImage.startsWith('http')) {
        return product.mainImage;
      }
      // If mainImage is a relative path, construct full URL
      return `http://localhost:3000${product.mainImage}`;
    }
    
    // For additional images (imageIndex > 0), use images array
    if (imageIndex > 0 && product.images && product.images.length > (imageIndex - 1)) {
      const imagePath = product.images[imageIndex - 1];
      // If image path already includes the full path, use it directly
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      // If image path is relative, construct full URL
      return `http://localhost:3000${imagePath}`;
    }
    
    // Fallback: if no mainImage but has images array, use first image
    if (imageIndex === 0 && !product.mainImage && product.images && product.images.length > 0) {
      const imagePath = product.images[0];
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      return `http://localhost:3000${imagePath}`;
    }
    
    // Return a data URI placeholder to avoid 404 errors
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }

  getDiscountPercentage(): number {
    if (!this.product || !this.product.originalPrice) return 0;
    return Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100);
  }

  getTotalImageCount(): number {
    if (!this.product) return 0;
    let count = 0;
    if (this.product.mainImage) count++;
    if (this.product.images && this.product.images.length > 0) {
      count += this.product.images.length;
    }
    return count;
  }

  getAllImages(): string[] {
    if (!this.product) return [];
    const images: string[] = [];
    
    // Add mainImage first (index 0)
    if (this.product.mainImage) {
      images.push(this.product.mainImage);
    }
    
    // Add additional images from images array
    if (this.product.images && this.product.images.length > 0) {
      images.push(...this.product.images);
    }
    
    return images;
  }

  isInStock(): boolean {
    return this.product ? this.product.stock > 0 : false;
  }

  getStockStatus(): string {
    if (!this.product) return 'Unknown';
    if (this.product.stock === 0) return 'Out of Stock';
    if (this.product.stock < 10) return 'Low Stock';
    return 'In Stock';
  }

  getStockStatusClass(): string {
    if (!this.product) return 'unknown';
    if (this.product.stock === 0) return 'out-of-stock';
    if (this.product.stock < 10) return 'low-stock';
    return 'in-stock';
  }

  getSpecificationKeys(): string[] {
    if (!this.product || !this.product.specifications) return [];
    return Object.keys(this.product.specifications);
  }
}