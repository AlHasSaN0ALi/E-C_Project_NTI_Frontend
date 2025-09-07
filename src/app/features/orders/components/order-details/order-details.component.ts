
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { OrderService } from '../../../../core/services/order.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Order, OrderStatus, Product } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatStepperModule,
    MatExpansionModule,
    MatTooltipModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  order: Order | null = null;
  isLoading = false;
  orderId: string = '';
  
  // Status tracking
  statusSteps = [
    { status: 'pending', label: 'Order Placed', icon: 'schedule' },
    { status: 'confirmed', label: 'Order Confirmed', icon: 'check_circle' },
    { status: 'processing', label: 'Processing', icon: 'build' },
    { status: 'shipped', label: 'Shipped', icon: 'local_shipping' },
    { status: 'delivered', label: 'Delivered', icon: 'done_all' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = params['id'];
      if (this.orderId) {
        this.loadOrderDetails();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrderDetails(): void {
    this.isLoading = true;
    this.orderService.getOrderById(this.orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.order = response.data;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading order details:', error);
          this.notificationService.error('Failed to load order details');
          this.isLoading = false;
        }
      });
  }

  cancelOrder(): void {
    if (!this.order) return;

    if (this.order.status === 'cancelled') {
      this.notificationService.warning('Order is already cancelled');
      return;
    }

    if (this.order.status === 'delivered') {
      this.notificationService.warning('Cannot cancel delivered order');
      return;
    }

    // TODO: Implement cancel order dialog
    this.notificationService.info('Cancel order functionality coming soon');
  }

  trackOrder(): void {
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

  getImageUrl(product: any): string {
    // Handle partial product from order items
    if (product.mainImage) {
      if (product.mainImage.startsWith('http')) {
        return product.mainImage;
      }
      return `http://localhost:3000${product.mainImage}`;
    }
    
    if (product.images && product.images.length > 0) {
      return `http://localhost:3000/uploads/${product.images[0]}`;
    }
    
    if (product.thumbnail) {
      return `http://localhost:3000/uploads/${product.thumbnail}`;
    }
    
    // Return placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }

  onImageError(event: any): void {
    if (!event.target.src.includes('data:image') && !event.target.src.includes('placeholder')) {
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }
  }

  canCancelOrder(): boolean {
    if (!this.order) return false;
    return this.order.status === 'pending' || this.order.status === 'confirmed';
  }

  getCurrentStepIndex(): number {
    if (!this.order) return 0;
    return this.statusSteps.findIndex(step => step.status === this.order!.status);
  }

  isStepCompleted(stepIndex: number): boolean {
    if (!this.order) return false;
    const currentIndex = this.getCurrentStepIndex();
    return stepIndex < currentIndex;
  }

  isStepActive(stepIndex: number): boolean {
    if (!this.order) return false;
    const currentIndex = this.getCurrentStepIndex();
    return stepIndex === currentIndex;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

}