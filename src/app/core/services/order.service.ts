import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, CreateOrderRequest, OrderStatus, OrderListResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  // Get all orders for current user
  getOrders(params?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    sortBy?: 'createdAt' | 'totalAmount' | 'status';
    sortOrder?: 'asc' | 'desc';
  }): Observable<OrderListResponse> {
    return this.http.get<OrderListResponse>(this.apiUrl, { params: params as any });
  }

  // Get single order by ID
  getOrderById(orderId: string): Observable<{ success: boolean; data: Order }> {
    return this.http.get<{ success: boolean; data: Order }>(`${this.apiUrl}/${orderId}`);
  }

  // Create new order
  createOrder(orderData: CreateOrderRequest): Observable<{ success: boolean; data: Order }> {
    return this.http.post<{ success: boolean; data: Order }>(this.apiUrl, orderData);
  }

  // Update order status (admin only)
  updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Observable<{ success: boolean; data: Order }> {
    return this.http.patch<{ success: boolean; data: Order }>(`${this.apiUrl}/${orderId}/status`, {
      status,
      notes
    });
  }

  // Cancel order
  cancelOrder(orderId: string, reason?: string): Observable<{ success: boolean; data: Order }> {
    return this.http.patch<{ success: boolean; data: Order }>(`${this.apiUrl}/${orderId}/cancel`, {
      reason
    });
  }

  // Track order
  trackOrder(orderId: string): Observable<{ success: boolean; data: Order }> {
    return this.http.get<{ success: boolean; data: Order }>(`${this.apiUrl}/${orderId}/track`);
  }

  // Get order statistics
  getOrderStats(): Observable<{
    success: boolean;
    data: {
      totalOrders: number;
      pendingOrders: number;
      completedOrders: number;
      cancelledOrders: number;
      totalSpent: number;
    };
  }> {
    return this.http.get<{
      success: boolean;
      data: {
        totalOrders: number;
        pendingOrders: number;
        completedOrders: number;
        cancelledOrders: number;
        totalSpent: number;
      };
    }>(`${this.apiUrl}/stats`);
  }
}
