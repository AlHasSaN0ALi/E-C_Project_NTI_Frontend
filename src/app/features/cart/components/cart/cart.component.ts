import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { CartService, CartItem, CartSummary } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-cart',
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
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  cartSummary: CartSummary | null = null;
  isLoading = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCart(): void {
    this.isLoading = true;
    this.cartService.getCartSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary: CartSummary) => {
          this.cartSummary = summary;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading cart:', error);
          this.isLoading = false;
        }
      });
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(item);
      return;
    }

    if (newQuantity > item.product.stock) {
      this.notificationService.warning(`Only ${item.product.stock} items available in stock`);
      return;
    }

    this.cartService.updateQuantity(item.product._id, newQuantity);
    this.notificationService.success('Cart updated');
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.product._id);
    this.notificationService.success('Item removed from cart');
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.notificationService.success('Cart cleared');
  }

  proceedToCheckout(): void {
    if (!this.cartSummary || this.cartSummary.items.length === 0) {
      this.notificationService.warning('Your cart is empty');
      return;
    }
    
    // Check if user is logged in
    if (!this.authService.isAuthenticated) {
      this.notificationService.warning('Please log in to proceed to checkout');
      this.router.navigate(['/auth/login']);
      return;
    }
    
    // Navigate to checkout
    this.router.navigate(['/checkout']);
  }

  continueShopping(): void {
    // Navigate to home page
    this.router.navigate(['/home']);
  }

  getItemTotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  getItemSavings(item: CartItem): number {
    if (!item.product.originalPrice) return 0;
    return (item.product.originalPrice - item.product.price) * item.quantity;
  }

  onImageError(event: any): void {
    // Prevent infinite loop by checking if we're already showing a placeholder
    if (!event.target.src.includes('data:image') && !event.target.src.includes('placeholder')) {
      // Use a data URI for a simple placeholder to avoid 404 errors
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }
  }

  getImageUrl(product: Product): string {
    // Check for mainImage field first (backend structure)
    if (product.mainImage) {
      // If mainImage already includes the full path, use it directly
      if (product.mainImage.startsWith('http')) {
        return product.mainImage;
      }
      // If mainImage is a relative path, construct full URL
      return `http://localhost:3000${product.mainImage}`;
    }
    
    // Fallback to images array (if it exists)
    if (product.images && product.images.length > 0) {
      return `http://localhost:3000/uploads/${product.images[0]}`;
    }
    
    // Return a data URI placeholder to avoid 404 errors
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }

  onQuantityChange(item: CartItem, event: Event): void {
    const target = event.target as HTMLInputElement;
    const newQuantity = +target.value;
    this.updateQuantity(item, newQuantity);
  }
}