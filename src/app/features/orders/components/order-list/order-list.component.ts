import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { OrderService } from '../../../../core/services/order.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Order, OrderStatus, OrderListResponse } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatExpansionModule,
    MatChipsModule,
    MatTooltipModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  isLoading = false;
  totalOrders = 0;
  pageSize = 10;
  currentPage = 0;
  
  // Filters
  statusFilter: OrderStatus | 'all' = 'all';
  searchQuery = '';
  
  // Sort
  sortBy: 'createdAt' | 'totalAmount' | 'status' = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';
  
  // Status options
  statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrders(): void {
    this.isLoading = true;
    const params: any = {
      page: this.currentPage + 1,
      limit: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    if (this.statusFilter !== 'all') {
      params.status = this.statusFilter;
    }

    this.orderService.getOrders(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: OrderListResponse) => {
          this.orders = response.data || [];
          this.totalOrders = response.total || 0;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading orders:', error);
          this.orders = [];
          this.totalOrders = 0;
          this.isLoading = false;
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active as 'createdAt' | 'totalAmount' | 'status';
    this.sortOrder = sort.direction === 'asc' ? 'asc' : 'desc';
    this.loadOrders();
  }

  onStatusFilterChange(): void {
    this.currentPage = 0;
    this.loadOrders();
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadOrders();
  }

  cancelOrder(order: Order): void {
    if (order.status === 'cancelled') {
      this.notificationService.warning('Order is already cancelled');
      return;
    }

    if (order.status === 'delivered') {
      this.notificationService.warning('Cannot cancel delivered order');
      return;
    }

    // TODO: Implement cancel order dialog
    this.notificationService.info('Cancel order functionality coming soon');
  }

  trackOrder(order: Order): void {
    // TODO: Navigate to order tracking page
    this.notificationService.info('Order tracking coming soon');
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case 'pending':
        return 'warn';
      case 'confirmed':
      case 'processing':
        return 'primary';
      case 'shipped':
        return 'accent';
      case 'delivered':
        return 'primary';
      case 'cancelled':
        return 'warn';
      case 'refunded':
        return 'basic';
      default:
        return 'basic';
    }
  }

  getStatusIcon(status: OrderStatus): string {
    switch (status) {
      case 'pending':
        return 'schedule';
      case 'confirmed':
        return 'check_circle';
      case 'processing':
        return 'build';
      case 'shipped':
        return 'local_shipping';
      case 'delivered':
        return 'done_all';
      case 'cancelled':
        return 'cancel';
      case 'refunded':
        return 'money_off';
      default:
        return 'help';
    }
  }

  canCancelOrder(order: Order): boolean {
    return order.status === 'pending' || order.status === 'confirmed';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}