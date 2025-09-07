export interface CategoryRef {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  isSoftDeleted: boolean;
  routeSlug: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string; // Category name (string)
  categoryRef: CategoryRef; // Full category object with _id
  subcategory?: string;
  brand?: string;
  images: string[]; // Additional images array
  mainImage: string; // Main image path (required in backend)
  thumbnail?: string; // Optional thumbnail
  stock: number;
  isActive: boolean;
  isFeatured?: boolean;
  isSoftDeleted?: boolean;
  tags?: string[];
  specifications?: {
    [key: string]: string;
  };
  rating?: number;
  reviewCount?: number;
  averageRating?: number;
  isNew?: boolean;
  discount?: number;
  isWishlisted?: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProductFilter {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  tags?: string[];
  search?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductResponse {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
