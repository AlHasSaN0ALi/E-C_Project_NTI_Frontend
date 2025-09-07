import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subject, takeUntil, of } from 'rxjs';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { CartService } from '../../../../core/services/cart.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingHelperService } from '../../../../core/services/loading-helper.service';
import { ErrorHandlingService } from '../../../../core/services/error-handling.service';
import { LoadingType } from '../../../../core/services/loading-state.service';
import { Product, Category } from '../../../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatGridListModule,
    MatDividerModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredProducts: Product[] = [];
  allProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategory: string = 'all';
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private loadingHelper: LoadingHelperService,
    private errorHandling: ErrorHandlingService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProducts(): void {
    this.loadingHelper.withLoading(
      this.productService.getProducts({ limit: 20 }),
      'load-products',
      LoadingType.COMPONENT,
      'Loading products...'
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.allProducts = response.data || [];
          this.featuredProducts = this.allProducts.filter(product => product.isFeatured).slice(0, 8);
          
          // If no featured products, use first 8 products
          if (this.featuredProducts.length === 0) {
            this.featuredProducts = this.allProducts.slice(0, 8);
          }
          
          // If still no products, create placeholders
          if (this.allProducts.length === 0) {
            this.createPlaceholderProducts();
          }
        },
        error: (error: any) => {
          this.errorHandling.handleHttpError(error, {
            component: 'HomeComponent',
            action: 'Load Products',
            additionalData: { filters: { limit: 20 } }
          });
          
          // Create placeholder products on error
          this.createPlaceholderProducts();
        }
      });
  }

  private loadCategories(): void {
    this.loadingHelper.withLoading(
      this.categoryService.getCategories(),
      'load-categories',
      LoadingType.COMPONENT,
      'Loading categories...'
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.categories = response.data || [];
        },
        error: (error: any) => {
          this.errorHandling.handleHttpError(error, {
            component: 'HomeComponent',
            action: 'Load Categories',
            additionalData: {}
          });
          this.categories = [];
        }
      });
  }

  private createPlaceholderProducts(): void {
    // Create placeholder products for design purposes
    const placeholderProducts: Product[] = [
      {
        _id: '1',
        name: 'MacBook Pro 16" M3 Max',
        description: 'Powerful laptop for professionals with M3 Max chip, 32GB RAM, 1TB SSD',
        price: 2499.99,
        originalPrice: 2799.99,
        images: [],
        mainImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==',
        category: 'Laptops',
        categoryRef: {
          _id: 'cat1',
          name: 'Laptops',
          description: 'Laptop devices',
          isActive: true,
          isSoftDeleted: false,
          routeSlug: 'laptops',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0
        },
        stock: 15,
        averageRating: 4.8,
        rating: 4.8,
        reviewCount: 124,
        isNew: true,
        isActive: true,
        isFeatured: true,
        discount: 11,
        isWishlisted: false,
        tags: ['laptop', 'macbook', 'professional', 'm3-max'],
        specifications: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0
      },
      {
        _id: '2',
        name: 'Dell XPS 13',
        description: 'Ultra-thin laptop with 13.4" 4K display, Intel i7, 16GB RAM',
        price: 1299.99,
        originalPrice: 1499.99,
        images: [],
        mainImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==',
        category: 'Laptops',
        categoryRef: {
          _id: 'cat1',
          name: 'Laptops',
          description: 'Laptop devices',
          isActive: true,
          isSoftDeleted: false,
          routeSlug: 'laptops',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0
        },
        stock: 8,
        averageRating: 4.6,
        rating: 4.6,
        reviewCount: 89,
        isNew: false,
        isActive: true,
        isFeatured: false,
        discount: 13,
        isWishlisted: false,
        tags: ['laptop', 'dell', 'xps', 'ultrabook'],
        specifications: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0
      },
      {
        _id: '3',
        name: 'ASUS ROG Gaming Laptop',
        description: 'High-performance gaming laptop with RTX 4070, 32GB RAM, 1TB SSD',
        price: 1899.99,
        originalPrice: 2199.99,
        images: [],
        mainImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==',
        category: 'Gaming',
        categoryRef: {
          _id: 'cat2',
          name: 'Gaming',
          description: 'Gaming devices',
          isActive: true,
          isSoftDeleted: false,
          routeSlug: 'gaming',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0
        },
        stock: 12,
        averageRating: 4.7,
        rating: 4.7,
        reviewCount: 156,
        isNew: true,
        isActive: true,
        isFeatured: true,
        discount: 14,
        isWishlisted: false,
        tags: ['gaming', 'laptop', 'asus', 'rog', 'rtx'],
        specifications: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0
      },
      {
        _id: '4',
        name: 'HP Pavilion 15',
        description: 'Budget-friendly laptop with AMD Ryzen 5, 8GB RAM, 256GB SSD',
        price: 599.99,
        originalPrice: 699.99,
        images: [],
        mainImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==',
        category: 'Laptops',
        categoryRef: {
          _id: 'cat1',
          name: 'Laptops',
          description: 'Laptop devices',
          isActive: true,
          isSoftDeleted: false,
          routeSlug: 'laptops',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0
        },
        stock: 25,
        averageRating: 4.3,
        rating: 4.3,
        reviewCount: 67,
        isNew: false,
        isActive: true,
        isFeatured: false,
        discount: 14,
        isWishlisted: false,
        tags: ['laptop', 'hp', 'pavilion', 'budget', 'ryzen'],
        specifications: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0
      },
      {
        _id: '5',
        name: 'Lenovo ThinkPad X1',
        description: 'Business laptop with Intel i7, 16GB RAM, 512GB SSD, Windows 11 Pro',
        price: 1599.99,
        originalPrice: 1799.99,
        images: [],
        mainImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==',
        category: 'Business',
        categoryRef: {
          _id: 'cat3',
          name: 'Business',
          description: 'Business devices',
          isActive: true,
          isSoftDeleted: false,
          routeSlug: 'business',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0
        },
        stock: 18,
        averageRating: 4.5,
        rating: 4.5,
        reviewCount: 92,
        isNew: false,
        isActive: true,
        isFeatured: false,
        discount: 11,
        isWishlisted: false,
        tags: ['laptop', 'lenovo', 'thinkpad', 'business', 'professional'],
        specifications: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0
      },
      {
        _id: '6',
        name: 'MSI Creator 17',
        description: 'Content creation laptop with RTX 4060, 32GB RAM, 2TB SSD',
        price: 2199.99,
        originalPrice: 2499.99,
        images: [],
        mainImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==',
        category: 'Content Creation',
        categoryRef: {
          _id: 'cat4',
          name: 'Content Creation',
          description: 'Content creation devices',
          isActive: true,
          isSoftDeleted: false,
          routeSlug: 'content-creation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0
        },
        stock: 6,
        averageRating: 4.9,
        rating: 4.9,
        reviewCount: 43,
        isNew: true,
        isActive: true,
        isFeatured: true,
        discount: 12,
        isWishlisted: false,
        tags: ['laptop', 'msi', 'creator', 'content-creation', 'rtx'],
        specifications: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0
      },
      {
        _id: '7',
        name: 'Acer Swift 3',
        description: 'Lightweight laptop with Intel i5, 8GB RAM, 512GB SSD',
        price: 699.99,
        originalPrice: 799.99,
        images: [],
        mainImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==',
        category: 'Laptops',
        categoryRef: {
          _id: 'cat1',
          name: 'Laptops',
          description: 'Laptop devices',
          isActive: true,
          isSoftDeleted: false,
          routeSlug: 'laptops',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0
        },
        stock: 22,
        averageRating: 4.2,
        rating: 4.2,
        reviewCount: 78,
        isNew: false,
        isActive: true,
        isFeatured: false,
        discount: 12,
        isWishlisted: false,
        tags: ['laptop', 'acer', 'swift', 'lightweight', 'portable'],
        specifications: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0
      },
      {
        _id: '8',
        name: 'Razer Blade 15',
        description: 'Gaming laptop with RTX 4080, 32GB RAM, 1TB SSD, 240Hz display',
        price: 2499.99,
        originalPrice: 2799.99,
        images: [],
        mainImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==',
        category: 'Gaming',
        categoryRef: {
          _id: 'cat2',
          name: 'Gaming',
          description: 'Gaming devices',
          isActive: true,
          isSoftDeleted: false,
          routeSlug: 'gaming',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0
        },
        stock: 4,
        averageRating: 4.8,
        rating: 4.8,
        reviewCount: 134,
        isNew: true,
        isActive: true,
        isFeatured: true,
        discount: 11,
        isWishlisted: false,
        tags: ['gaming', 'laptop', 'razer', 'blade', 'rtx-4080'],
        specifications: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0
      }
    ];

    // If no products from backend, use placeholders
    if (this.allProducts.length === 0) {
      this.allProducts = placeholderProducts;
      this.featuredProducts = placeholderProducts.slice(0, 8);
    }
  }

  get filteredProducts(): Product[] {
    return this.allProducts;
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.loadProductsByCategory(category);
  }

  private loadAllProducts(): void {
    this.loadingHelper.withLoading(
      this.productService.getProducts({ limit: 50 }),
      'load-all-products',
      LoadingType.COMPONENT,
      'Loading all products...'
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.allProducts = response.data || [];
          if (this.allProducts.length === 0) {
            this.createPlaceholderProducts();
          }
        },
        error: (error: any) => {
          this.errorHandling.handleHttpError(error, {
            component: 'HomeComponent',
            action: 'Load All Products',
            additionalData: {}
          });
          this.createPlaceholderProducts();
        }
      });
  }

  private loadProductsByCategory(categoryId: string): void {
    if (categoryId === 'all') {
      this.loadAllProducts();
      return;
    }

    this.loadingHelper.withLoading(
      this.productService.getProductsByCategory(categoryId, { limit: 50 }),
      'load-category-products',
      LoadingType.COMPONENT,
      'Loading products...'
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.allProducts = response.data || [];
          this.notificationService.success(`Loaded ${this.allProducts.length} products from category`);
        },
        error: (error: any) => {
          console.warn('Primary category endpoint failed, trying fallback:', error);
          // Try fallback method first
          this.tryFallbackCategoryEndpoint(categoryId);
        }
      });
  }

  private tryFallbackCategoryEndpoint(categoryId: string): void {
    this.loadingHelper.withLoading(
      this.productService.getProductsByCategoryFallback(categoryId, { limit: 50 }),
      'load-category-products-fallback',
      LoadingType.COMPONENT,
      'Loading products...'
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.allProducts = response.data || [];
          this.notificationService.success(`Loaded ${this.allProducts.length} products from category (fallback)`);
        },
        error: (error: any) => {
          this.errorHandling.handleHttpError(error, {
            component: 'HomeComponent',
            action: 'Load Products by Category (Fallback)',
            additionalData: { categoryId }
          });
          // Final fallback to client-side filtering
          this.fallbackToClientSideFiltering(categoryId);
        }
      });
  }

  private fallbackToClientSideFiltering(categoryId: string): void {
    // Fallback to client-side filtering if backend API fails
    if (categoryId === 'all') {
      // Keep current allProducts as they are already loaded
      return;
    } else {
      // Filter from the current allProducts
      const originalProducts = [...this.allProducts];
      this.allProducts = originalProducts.filter(product => 
        product.category === categoryId || 
        product.category === this.getCategoryNameById(categoryId) ||
        (product.categoryRef && product.categoryRef._id === categoryId)
      );
    }
    this.notificationService.warning('Using offline filtering');
  }

  private getCategoryNameById(categoryId: string): string {
    const category = this.categories.find(cat => cat._id === categoryId);
    return category ? category.name : categoryId;
  }

  getCategoryIcon(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'Laptops': 'laptop',
      'Gaming': 'sports_esports',
      'Business': 'business_center',
      'Content Creation': 'create',
      'Electronics': 'devices',
      'Clothing': 'checkroom',
      'Books': 'menu_book',
      'Home & Garden': 'home',
      'Sports': 'sports',
      'Toys': 'toys',
      'Beauty': 'face',
      'Automotive': 'directions_car',
      'Health': 'health_and_safety',
      'Food': 'restaurant'
    };
    return iconMap[categoryName] || 'category';
  }

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

  getImageUrl(product: Product): string {
    // Check for mainImage field first (backend structure)
    if (product.mainImage) {
      // If mainImage already includes the full path, use it directly
      if (product.mainImage.startsWith('http')) {
        return product.mainImage;
      }
      // If mainImage is a relative path, construct full URL
      return `http://localhost:3000${product.mainImage}`;
    }
    
    // Fallback to images array (if it exists)
    if (product.images && product.images.length > 0) {
      return `http://localhost:3000/uploads/${product.images[0]}`;
    }
    
    // Return a data URI placeholder to avoid 404 errors
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    
    if (product.stock === 0) {
      this.notificationService.warning('This product is out of stock');
      return;
    }

    this.loadingHelper.withButtonLoading(
      of(this.cartService.addToCart(product, 1)),
      'add-to-cart',
      'Adding to cart...'
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success(`${product.name} added to cart!`);
        },
        error: (error: any) => {
          this.errorHandling.handleHttpError(error, {
            component: 'HomeComponent',
            action: 'Add to Cart',
            additionalData: { productId: product._id, productName: product.name }
          });
        }
      });
  }

  scrollToProducts(): void {
    const element = document.getElementById('products-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}