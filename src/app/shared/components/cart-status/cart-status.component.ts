import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-cart-status',
  standalone: true,
  imports: [
    CommonModule,
    MatBadgeModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <div class="cart-status">
      <mat-icon 
        [matBadge]="cartItemCount" 
        [matBadgeHidden]="cartItemCount === 0"
        matBadgeColor="warn"
        matBadgeSize="small"
        [matTooltip]="getCartTooltip()"
        class="cart-icon"
      >
        shopping_cart
      </mat-icon>
      
      <div class="cart-info" *ngIf="!isAuthenticated && !isCartEmpty()">
        <div class="cart-expiry" [class.expired]="cartExpiryInfo.isExpired">
          <span *ngIf="cartExpiryInfo.isExpired" class="expired-text">
            Cart expired
          </span>
          <span *ngIf="!cartExpiryInfo.isExpired" class="expiry-text">
            Expires in {{ cartExpiryInfo.daysUntilExpiry }} days
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-status {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cart-icon {
      cursor: pointer;
      color: var(--text-primary);
    }

    .cart-info {
      font-size: 12px;
    }

    .cart-expiry {
      padding: 2px 6px;
      border-radius: 4px;
      background-color: var(--success-light);
      color: var(--success-dark);
    }

    .cart-expiry.expired {
      background-color: var(--error-light);
      color: var(--error-dark);
    }

    .expired-text {
      font-weight: 500;
    }

    .expiry-text {
      font-weight: 400;
    }
  `]
})
export class CartStatusComponent implements OnInit, OnDestroy {
  cartItemCount = 0;
  isAuthenticated = false;
  isCartEmpty = true;
  cartExpiryInfo = {
    isExpired: false,
    daysUntilExpiry: 0,
    expiryDate: null as Date | null
  };

  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to cart changes
    this.cartService.getCart().pipe(
      takeUntil(this.destroy$)
    ).subscribe(cart => {
      this.cartItemCount = this.cartService.getItemCount();
      this.isCartEmpty = this.cartService.isCartEmpty();
      this.cartExpiryInfo = this.cartService.getCartExpiryInfo();
    });

    // Subscribe to auth state changes
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.isAuthenticated = !!user;
      this.cartExpiryInfo = this.cartService.getCartExpiryInfo();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCartTooltip(): string {
    if (this.isAuthenticated) {
      return `Cart: ${this.cartItemCount} items`;
    } else {
      if (this.cartExpiryInfo.isExpired) {
        return 'Cart expired - items will be cleared';
      } else {
        return `Guest cart: ${this.cartItemCount} items (expires in ${this.cartExpiryInfo.daysUntilExpiry} days)`;
      }
    }
  }
}
