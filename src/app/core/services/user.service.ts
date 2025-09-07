import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { User, UserResponse, UserListResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  /**
   * Get all users with filtering and pagination
   */
  getUsers(page: number = 1, limit: number = 10, sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc', search?: string, role?: string, status?: string): Observable<UserListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    if (search) {
      params = params.set('search', search);
    }

    if (role) {
      params = params.set('role', role);
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.apiService.get<UserListResponse>(this.apiUrl, { params });
  }

  /**
   * Get a specific user by ID
   */
  getUser(userId: string): Observable<UserResponse> {
    return this.apiService.get<UserResponse>(`${this.apiUrl}/${userId}`);
  }

  /**
   * Create a new user
   */
  createUser(userData: Partial<User>): Observable<UserResponse> {
    return this.apiService.post<UserResponse>(this.apiUrl, userData);
  }

  /**
   * Update an existing user
   */
  updateUser(userId: string, userData: Partial<User>): Observable<UserResponse> {
    return this.apiService.put<UserResponse>(`${this.apiUrl}/${userId}`, userData);
  }

  /**
   * Delete a user
   */
  deleteUser(userId: string): Observable<{ success: boolean; message: string }> {
    return this.apiService.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${userId}`);
  }

  /**
   * Toggle user active status
   */
  toggleUserStatus(userId: string): Observable<UserResponse> {
    return this.apiService.patch<UserResponse>(`${this.apiUrl}/${userId}/toggle-status`, {});
  }

  /**
   * Reset user password
   */
  resetUserPassword(userId: string): Observable<{ success: boolean; message: string }> {
    return this.apiService.post<{ success: boolean; message: string }>(`${this.apiUrl}/${userId}/reset-password`, {});
  }

  /**
   * Get user statistics
   */
  getUserStats(): Observable<{
    success: boolean;
    data: {
      totalUsers: number;
      activeUsers: number;
      inactiveUsers: number;
      newUsersThisMonth: number;
    };
  }> {
    return this.apiService.get<{
      success: boolean;
      data: {
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        newUsersThisMonth: number;
      };
    }>(`${this.apiUrl}/stats`);
  }
}
