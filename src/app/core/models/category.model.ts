export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  parentCategory?: string;
  isActive: boolean;
  productCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryListResponse {
  success: boolean;
  data: Category[];
  total: number;
  page: number;
  limit: number;
}
