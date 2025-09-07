import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Category, CategoryListResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private apiService: ApiService) {}

  getCategories(): Observable<CategoryListResponse> {
    return this.apiService.get<CategoryListResponse>('/category');
  }

  getCategory(id: string): Observable<Category> {
    return this.apiService.get<Category>(`/category/${id}`);
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.apiService.post<Category>('/category', category);
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.apiService.put<Category>(`/category/${id}`, category);
  }

  deleteCategory(id: string): Observable<void> {
    return this.apiService.delete<void>(`/category/${id}`);
  }

  getCategoryWithProducts(id: string): Observable<Category> {
    return this.apiService.get<Category>(`/category/${id}/products`);
  }

  getCategoryStats(): Observable<any> {
    return this.apiService.get<any>('/category/stats');
  }
}
