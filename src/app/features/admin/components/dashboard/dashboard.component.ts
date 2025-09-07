import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';
import { OrderService } from '../../../../core/services/order.service';
import { ProductService } from '../../../../core/services/product.service';
import { UserService } from '../../../../core/services/user.service';
import { ReviewService } from '../../../../core/services/review.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Order, Product, User, Review } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrders: Order[];
  topProducts: Product[];
  recentReviews: Review[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats | null = null;
  loading = false;
  recentOrdersPageSize = 5;
  recentOrdersPageIndex = 0;

  displayedColumns: string[] = ['orderNumber', 'customer', 'total', 'status', 'date', 'actions'];

  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private userService: UserService,
    private reviewService: ReviewService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load all dashboard data in parallel
    Promise.all([
      this.loadUserStats(),
      this.loadProductStats(),
      this.loadOrderStats(),
      this.loadRecentOrders(),
      this.loadTopProducts(),
      this.loadRecentReviews()
    ]).finally(() => {
      this.loading = false;
    });
  }

  private loadUserStats(): Promise<void> {
    return new Promise((resolve) => {
      // Mock data for now - would be replaced with actual API call
      this.stats = {
        totalUsers: 1250,
        pendingOrders: 0,
        lowStockProducts: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: [],
        topProducts: [],
        recentReviews: []
      };
      resolve();
    });
  }

  private loadProductStats(): Promise<void> {
    return new Promise((resolve) => {
      this.productService.getProducts().pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          if (this.stats) {
            this.stats.totalProducts = response.total || 0;
            this.stats.lowStockProducts = response.data?.filter(p => p.stock < 10).length || 0;
          }
          resolve();
        },
        error: (error) => {
          console.error('Error loading product stats:', error);
          resolve();
        }
      });
    });
  }

  private loadOrderStats(): Promise<void> {
    return new Promise((resolve) => {
      this.orderService.getOrders().pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          const orders = response.data || [];
          if (this.stats) {
            this.stats.totalOrders = response.total || 0;
            this.stats.totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
            this.stats.pendingOrders = orders.filter(order => order.status === 'pending').length;
          }
          resolve();
        },
        error: (error) => {
          console.error('Error loading order stats:', error);
          resolve();
        }
      });
    });
  }

  private loadRecentOrders(): Promise<void> {
    return new Promise((resolve) => {
      this.orderService.getOrders().pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          if (this.stats) {
            this.stats.recentOrders = response.data || [];
          }
          resolve();
        },
        error: (error) => {
          console.error('Error loading recent orders:', error);
          resolve();
        }
      });
    });
  }

  private loadTopProducts(): Promise<void> {
    return new Promise((resolve) => {
      this.productService.getProducts().pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          if (this.stats) {
            this.stats.topProducts = response.data || [];
          }
          resolve();
        },
        error: (error) => {
          console.error('Error loading top products:', error);
          resolve();
        }
      });
    });
  }

  private loadRecentReviews(): Promise<void> {
    return new Promise((resolve) => {
      this.reviewService.getRecentReviews(5).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          if (this.stats) {
            this.stats.recentReviews = response.data || [];
          }
          resolve();
        },
        error: (error) => {
          console.error('Error loading recent reviews:', error);
          resolve();
        }
      });
    });
  }

  onRefresh(): void {
    this.loadDashboardData();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'warn';
      case 'confirmed': return 'primary';
      case 'processing': return 'accent';
      case 'shipped': return 'primary';
      case 'delivered': return 'primary';
      case 'cancelled': return 'warn';
      case 'refunded': return 'warn';
      default: return 'primary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending': return 'schedule';
      case 'confirmed': return 'check_circle';
      case 'processing': return 'build';
      case 'shipped': return 'local_shipping';
      case 'delivered': return 'done';
      case 'cancelled': return 'cancel';
      case 'refunded': return 'money_off';
      default: return 'help';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onViewOrder(order: Order): void {
    // Navigate to order details
    console.log('View order:', order._id);
  }

  onViewProduct(product: Product): void {
    // Navigate to product details
    console.log('View product:', product._id);
  }

  onViewReview(review: Review): void {
    // Navigate to review details
    console.log('View review:', review._id);
  }
}