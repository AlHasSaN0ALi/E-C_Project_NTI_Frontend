import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Product, Category, ProductFilters } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-product-list',
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
    MatSliderModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSortModule,
    MatExpansionModule,
    MatToolbarModule,
    MatMenuModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  categories: Category[] = [];
  filteredProducts: Product[] = [];
  
  // Pagination
  totalProducts = 0;
  pageSize = 12;
  pageIndex = 0;
  pageSizeOptions = [12, 24, 48, 96];
  
  // Sorting
  sortField = 'name';
  sortDirection = 'asc';
  
  // Filtering
  filterForm!: FormGroup;
  showFilters = false;
  selectedFilters: string[] = [];
  
  // Loading states
  isLoading = false;
  isFiltering = false;
  
  // Search
  searchQuery = '';
  
  // Price range
  minPrice = 0;
  maxPrice = 10000;
  priceRange = [0, 10000];
  
  // View options
  viewMode: 'grid' | 'list' = 'grid';
  
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeFilterForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.setupSearchSubscription();
    this.setupRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      category: [''],
      minPrice: [0],
      maxPrice: [10000],
      inStock: [false],
      featured: [false],
      sortBy: ['name'],
      sortOrder: ['asc']
    });
  }

  private setupSearchSubscription(): void {
    this.filterForm.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.searchQuery = value;
        this.applyFilters();
      });
  }

  private setupRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['category']) {
          this.filterForm.patchValue({ category: params['category'] });
        }
        if (params['search']) {
          this.filterForm.patchValue({ search: params['search'] });
        }
        this.applyFilters();
      });
  }

  private loadProducts(): void {
    this.isLoading = true;
    const filters = this.buildFilters();
    
    this.productService.getProducts(filters).subscribe({
      next: (response: any) => {
        this.products = response.data || [];
        this.filteredProducts = [...this.products];
        this.totalProducts = response.total || 0;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response: any) => {
        this.categories = response.data || [];
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  private buildFilters(): ProductFilters {
    const formValue = this.filterForm.value;
    return {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      search: formValue.search || undefined,
      category: formValue.category || undefined,
      minPrice: formValue.minPrice || undefined,
      maxPrice: formValue.maxPrice || undefined,
      inStock: formValue.inStock || undefined,
      featured: formValue.featured || undefined,
      sortBy: formValue.sortBy || 'name',
      sortOrder: formValue.sortOrder || 'asc'
    };
  }

  applyFilters(): void {
    this.isFiltering = true;
    this.pageIndex = 0; // Reset to first page when filtering
    
    const filters = this.buildFilters();
    
    this.productService.getProducts(filters).subscribe({
      next: (response: any) => {
        this.products = response.data || [];
        this.filteredProducts = [...this.products];
        this.totalProducts = response.total || 0;
        this.isFiltering = false;
        this.updateSelectedFilters();
      },
      error: (error: any) => {
        console.error('Error filtering products:', error);
        this.isFiltering = false;
      }
    });
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      category: '',
      minPrice: 0,
      maxPrice: 10000,
      inStock: false,
      featured: false,
      sortBy: 'name',
      sortOrder: 'asc'
    });
    this.selectedFilters = [];
    this.applyFilters();
  }

  private updateSelectedFilters(): void {
    const formValue = this.filterForm.value;
    this.selectedFilters = [];
    
    if (formValue.category) {
      const category = this.categories.find(c => c._id === formValue.category);
      if (category) {
        this.selectedFilters.push(`Category: ${category.name}`);
      }
    }
    
    if (formValue.minPrice > 0 || formValue.maxPrice < 10000) {
      this.selectedFilters.push(`Price: $${formValue.minPrice} - $${formValue.maxPrice}`);
    }
    
    if (formValue.inStock) {
      this.selectedFilters.push('In Stock Only');
    }
    
    if (formValue.featured) {
      this.selectedFilters.push('Featured Only');
    }
  }

  removeFilter(filter: string): void {
    if (filter.startsWith('Category:')) {
      this.filterForm.patchValue({ category: '' });
    } else if (filter.startsWith('Price:')) {
      this.filterForm.patchValue({ minPrice: 0, maxPrice: 10000 });
    } else if (filter === 'In Stock Only') {
      this.filterForm.patchValue({ inStock: false });
    } else if (filter === 'Featured Only') {
      this.filterForm.patchValue({ featured: false });
    }
    
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyFilters();
  }

  onSortChange(sort: Sort): void {
    this.sortField = sort.active;
    this.sortDirection = sort.direction;
    this.filterForm.patchValue({
      sortBy: sort.active,
      sortOrder: sort.direction
    });
    this.applyFilters();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
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
    event.target.src = 'assets/images/placeholder-product.jpg';
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', product);
  }

  toggleWishlist(product: Product, event: Event): void {
    event.stopPropagation();
    // TODO: Implement wishlist functionality
    console.log('Toggle wishlist:', product);
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c._id === categoryId);
    return category ? category.name : 'Unknown';
  }
}