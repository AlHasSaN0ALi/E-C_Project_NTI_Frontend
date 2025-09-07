import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Product, ProductListResponse, ProductFilters } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private apiService: ApiService) {}

  getProducts(filters?: ProductFilters): Observable<ProductListResponse> {
    const params: any = {};
    
    if (filters) {
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.featured !== undefined) params.featured = filters.featured;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;
      if (filters.inStock !== undefined) params.inStock = filters.inStock;
    }

    return this.apiService.get<ProductListResponse>('/product', params);
  }

  getProduct(id: string): Observable<Product> {
    return this.apiService.get<Product>(`/product/${id}`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.apiService.post<Product>('/product', product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.apiService.put<Product>(`/product/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.apiService.delete<void>(`/product/${id}`);
  }

  getFeaturedProducts(limit: number = 8): Observable<ProductListResponse> {
    return this.getProducts({ featured: true, limit });
  }

  getProductsByCategory(categoryId: string, filters?: ProductFilters): Observable<ProductListResponse> {
    // Use the specific category endpoint if available, otherwise fallback to general products endpoint
    const params: any = { ...filters };
    if (filters) {
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.search) params.search = filters.search;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.featured !== undefined) params.featured = filters.featured;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;
      if (filters.inStock !== undefined) params.inStock = filters.inStock;
    }
    
    // Try the specific category endpoint first
    return this.apiService.get<ProductListResponse>(`/product/category/${categoryId}`, params);
  }

  getProductsByCategoryFallback(categoryId: string, filters?: ProductFilters): Observable<ProductListResponse> {
    // Fallback method using the general products endpoint with category filter
    return this.getProducts({ ...filters, category: categoryId });
  }

  searchProducts(query: string, filters?: ProductFilters): Observable<ProductListResponse> {
    return this.getProducts({ ...filters, search: query });
  }

  getLowStockProducts(threshold: number = 10): Observable<ProductListResponse> {
    return this.getProducts({ inStock: true, limit: 100 });
  }

  updateProductStock(id: string, stock: number): Observable<Product> {
    return this.apiService.patch<Product>(`/product/${id}/stock`, { stock });
  }

  toggleProductFeatured(id: string): Observable<Product> {
    return this.apiService.patch<Product>(`/product/${id}/featured`, {});
  }
}
