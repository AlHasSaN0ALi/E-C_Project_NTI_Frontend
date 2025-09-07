export interface ProductListResponse {
  success: boolean;
  data: any[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
  inStock?: boolean;
}

// Re-export Product from product.model to avoid circular dependency
export { Product } from './product.model';
