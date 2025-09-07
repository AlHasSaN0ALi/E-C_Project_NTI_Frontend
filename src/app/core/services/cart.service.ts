import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { Product } from '../models';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { LocalStorageService, LocalStorageCartItem } from './local-storage.service';

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: Date;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  totalSavings: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private readonly CART_STORAGE_KEY = 'ecommerce_cart';
  private readonly CART_PRODUCTS_KEY = 'ecommerce_cart_products';

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private localStorageService: LocalStorageService
  ) {
    this.initializeCart();
  }

  // Get cart as observable
  getCart(): Observable<CartItem[]> {
    return this.cartItems.asObservable();
  }

  // Get cart summary
  getCartSummary(): Observable<CartSummary> {
    return new Observable(observer => {
      this.cartItems.subscribe(items => {
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => {
          const price = item.product.price;
          return sum + (price * item.quantity);
        }, 0);
        const totalSavings = items.reduce((sum, item) => {
          const originalPrice = item.product.originalPrice || item.product.price;
          const savings = (originalPrice - item.product.price) * item.quantity;
          return sum + savings;
        }, 0);

        observer.next({
          items,
          totalItems,
          totalPrice,
          totalSavings
        });
      });
    });
  }

  // Add item to cart
  addToCart(product: Product, quantity: number = 1): void {
    if (this.authService.isAuthenticated) {
      // For authenticated users, use backend + local storage
      this.addToCartAuthenticated(product, quantity);
    } else {
      // For unauthenticated users, use local storage only
      this.addToCartUnauthenticated(product, quantity);
    }
  }

  private addToCartAuthenticated(product: Product, quantity: number): void {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(item => item.product._id === product._id);

    if (existingItem) {
      // Update quantity if item already exists
      existingItem.quantity += quantity;
    } else {
      // Add new item
      const newItem: CartItem = {
        product,
        quantity,
        addedAt: new Date()
      };
      currentItems.push(newItem);
    }

    this.cartItems.next([...currentItems]);
    this.saveCartToStorage();
    this.syncCartToBackend();
  }

  private addToCartUnauthenticated(product: Product, quantity: number): void {
    // Use LocalStorageService for unauthenticated users
    const updatedCart = this.localStorageService.addToCart(product, quantity);
    this.updateCartFromLocalStorage(updatedCart);
  }

  // Remove item from cart
  removeFromCart(productId: string): void {
    if (this.authService.isAuthenticated) {
      this.removeFromCartAuthenticated(productId);
    } else {
      this.removeFromCartUnauthenticated(productId);
    }
  }

  private removeFromCartAuthenticated(productId: string): void {
    const currentItems = this.cartItems.value;
    const filteredItems = currentItems.filter(item => item.product._id !== productId);
    this.cartItems.next(filteredItems);
    this.saveCartToStorage();
    this.syncCartToBackend();
  }

  private removeFromCartUnauthenticated(productId: string): void {
    const updatedCart = this.localStorageService.removeFromCart(productId);
    this.updateCartFromLocalStorage(updatedCart);
  }

  // Update item quantity
  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    if (this.authService.isAuthenticated) {
      this.updateQuantityAuthenticated(productId, quantity);
    } else {
      this.updateQuantityUnauthenticated(productId, quantity);
    }
  }

  private updateQuantityAuthenticated(productId: string, quantity: number): void {
    const currentItems = this.cartItems.value;
    const item = currentItems.find(item => item.product._id === productId);
    
    if (item) {
      item.quantity = quantity;
      this.cartItems.next([...currentItems]);
      this.saveCartToStorage();
      this.syncCartToBackend();
    }
  }

  private updateQuantityUnauthenticated(productId: string, quantity: number): void {
    const updatedCart = this.localStorageService.updateCartItemQuantity(productId, quantity);
    this.updateCartFromLocalStorage(updatedCart);
  }

  // Clear entire cart
  clearCart(): void {
    if (this.authService.isAuthenticated) {
      this.clearCartAuthenticated();
    } else {
      this.clearCartUnauthenticated();
    }
  }

  private clearCartAuthenticated(): void {
    this.cartItems.next([]);
    this.saveCartToStorage();
    this.syncCartToBackend();
  }

  private clearCartUnauthenticated(): void {
    this.localStorageService.clearCart();
    this.cartItems.next([]);
  }

  // Check if item is in cart
  isInCart(productId: string): boolean {
    return this.cartItems.value.some(item => item.product._id === productId);
  }

  // Get item quantity in cart
  getItemQuantity(productId: string): number {
    const item = this.cartItems.value.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  }

  // Get cart item count
  getItemCount(): number {
    if (this.authService.isAuthenticated) {
      return this.cartItems.value.reduce((sum, item) => sum + item.quantity, 0);
    } else {
      return this.localStorageService.getCartItemCount();
    }
  }

  // Get cart total price
  getCartTotal(): number {
    if (this.authService.isAuthenticated) {
      return this.cartItems.value.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    } else {
      return this.localStorageService.getCartTotal();
    }
  }

  // Check if cart is empty
  isCartEmpty(): boolean {
    if (this.authService.isAuthenticated) {
      return this.cartItems.value.length === 0;
    } else {
      return this.localStorageService.isCartEmpty();
    }
  }

  // Get cart expiry info for unauthenticated users
  getCartExpiryInfo(): { isExpired: boolean; daysUntilExpiry: number; expiryDate: Date | null } {
    if (this.authService.isAuthenticated) {
      return { isExpired: false, daysUntilExpiry: 0, expiryDate: null };
    } else {
      return {
        isExpired: this.localStorageService.isCartExpired(),
        daysUntilExpiry: this.localStorageService.getDaysUntilExpiry(),
        expiryDate: this.localStorageService.getCartExpiryDate()
      };
    }
  }

  // Helper method to update cart from local storage
  private updateCartFromLocalStorage(localStorageCart: LocalStorageCartItem[]): void {
    const cartItems: CartItem[] = localStorageCart.map(item => ({
      product: item.product,
      quantity: item.quantity,
      addedAt: new Date(item.addedAt)
    }));
    this.cartItems.next(cartItems);
  }

  // Sync local storage cart to backend when user logs in
  syncLocalCartToBackend(): void {
    if (!this.authService.isAuthenticated) return;
    
    const localCart = this.localStorageService.getCart();
    if (localCart && localCart.length > 0) {
      // Convert local cart data to backend format and sync
      const cartData = localCart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      this.apiService.put('/cart', { items: cartData }).pipe(
        catchError(error => {
          console.error('Error syncing local cart to backend:', error);
          return [];
        })
      ).subscribe(() => {
        // Clear local storage cart after successful sync
        this.localStorageService.clearCart();
      });
    }
  }

  // Load cart from backend when user is logged in
  loadCartFromBackend(): Observable<CartItem[]> {
    if (!this.authService.isAuthenticated) {
      return this.getCart();
    }

    return this.apiService.get<any>('/cart').pipe(
      map(response => {
        if (response.success && response.data) {
          const cartItems = response.data.items || [];
          this.cartItems.next(cartItems);
          this.saveCartToStorage();
          return cartItems;
        }
        return [];
      }),
      catchError(error => {
        console.error('Error loading cart from backend:', error);
        // Fallback to local storage
        this.loadCartFromStorage();
        return this.getCart();
      })
    );
  }

  // Private methods
  private initializeCart(): void {
    // Load initial cart state
    if (this.authService.isAuthenticated) {
      this.loadCartFromBackend().subscribe();
    } else {
      this.loadCartFromLocalStorage();
    }

    // Listen to auth state changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // User logged in - sync local cart to backend and load from backend
        this.syncLocalCartToBackend();
        this.loadCartFromBackend().subscribe();
      } else {
        // User logged out - load from local storage only
        this.loadCartFromLocalStorage();
      }
    });
  }

  private loadCartFromLocalStorage(): void {
    const localCart = this.localStorageService.getCart();
    this.updateCartFromLocalStorage(localCart);
  }

  private saveCartToStorage(): void {
    try {
      const cartData = this.cartItems.value.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        addedAt: item.addedAt.toISOString()
      }));
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cartData));
      
      // Also save product details for local storage cart
      const productData = this.cartItems.value.map(item => ({
        product: item.product,
        quantity: item.quantity,
        addedAt: item.addedAt.toISOString()
      }));
      localStorage.setItem(this.CART_PRODUCTS_KEY, JSON.stringify(productData));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  private loadCartFromStorage(): void {
    try {
      const productData = localStorage.getItem(this.CART_PRODUCTS_KEY);
      if (productData) {
        const parsedData = JSON.parse(productData);
        const cartItems: CartItem[] = parsedData.map((item: any) => ({
          product: item.product,
          quantity: item.quantity,
          addedAt: new Date(item.addedAt)
        }));
        this.cartItems.next(cartItems);
      } else {
        this.cartItems.next([]);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.cartItems.next([]);
    }
  }

  private getLocalCartData(): any[] {
    try {
      const cartData = localStorage.getItem(this.CART_STORAGE_KEY);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error getting local cart data:', error);
      return [];
    }
  }

  private syncCartToBackend(): void {
    if (!this.authService.isAuthenticated) return;

    const cartData = this.cartItems.value.map(item => ({
      productId: item.product._id,
      quantity: item.quantity
    }));

    this.apiService.put('/cart', { items: cartData }).pipe(
      catchError(error => {
        console.error('Error syncing cart to backend:', error);
        return [];
      })
    ).subscribe();
  }
}
