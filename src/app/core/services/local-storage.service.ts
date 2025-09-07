import { Injectable } from '@angular/core';

export interface LocalStorageCartItem {
  productId: string;
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: string;
    categoryRef: {
      _id: string;
      name: string;
      description: string;
      isActive: boolean;
      isSoftDeleted: boolean;
      routeSlug: string;
      createdAt: string;
      updatedAt: string;
      __v: number;
    };
    images: string[];
    mainImage: string;
    thumbnail?: string;
    stock: number;
    isActive: boolean;
    isFeatured?: boolean;
    isSoftDeleted?: boolean;
    tags?: string[];
    specifications?: {
      [key: string]: string;
    };
    rating?: number;
    reviewCount?: number;
    averageRating?: number;
    isNew?: boolean;
    discount?: number;
    isWishlisted?: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  quantity: number;
  addedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly CART_KEY = 'ecommerce_cart';
  private readonly CART_EXPIRY_KEY = 'ecommerce_cart_expiry';
  private readonly CART_EXPIRY_DAYS = 30; // Cart expires after 30 days

  constructor() {}

  // Cart Management
  getCart(): LocalStorageCartItem[] {
    try {
      const cartData = localStorage.getItem(this.CART_KEY);
      const expiryData = localStorage.getItem(this.CART_EXPIRY_KEY);
      
      if (!cartData || !expiryData) {
        return [];
      }

      // Check if cart has expired
      const expiryDate = new Date(expiryData);
      if (new Date() > expiryDate) {
        this.clearCart();
        return [];
      }

      return JSON.parse(cartData);
    } catch (error) {
      console.error('Error reading cart from localStorage:', error);
      return [];
    }
  }

  saveCart(cart: LocalStorageCartItem[]): void {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + this.CART_EXPIRY_DAYS);
      
      localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
      localStorage.setItem(this.CART_EXPIRY_KEY, expiryDate.toISOString());
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  clearCart(): void {
    try {
      localStorage.removeItem(this.CART_KEY);
      localStorage.removeItem(this.CART_EXPIRY_KEY);
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error);
    }
  }

  // Cart Item Management
  addToCart(product: any, quantity: number = 1): LocalStorageCartItem[] {
    const cart = this.getCart();
    const existingItemIndex = cart.findIndex(item => item.productId === product._id);

    if (existingItemIndex > -1) {
      // Update existing item
      cart[existingItemIndex].quantity += quantity;
      cart[existingItemIndex].addedAt = new Date().toISOString();
    } else {
      // Add new item
      const cartItem: LocalStorageCartItem = {
        productId: product._id,
        product: {
          _id: product._id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          originalPrice: product.originalPrice,
          category: product.category || '',
          categoryRef: product.categoryRef || {
            _id: '',
            name: product.category || '',
            description: '',
            isActive: true,
            isSoftDeleted: false,
            routeSlug: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            __v: 0
          },
          images: product.images || [],
          mainImage: product.mainImage || '',
          thumbnail: product.thumbnail,
          stock: product.stock || 0,
          isActive: product.isActive !== undefined ? product.isActive : true,
          isFeatured: product.isFeatured || false,
          isSoftDeleted: product.isSoftDeleted || false,
          tags: product.tags || [],
          specifications: product.specifications || {},
          rating: product.rating || 0,
          reviewCount: product.reviewCount || 0,
          averageRating: product.averageRating || 0,
          isNew: product.isNew || false,
          discount: product.discount || 0,
          isWishlisted: product.isWishlisted || false,
          createdAt: product.createdAt || new Date().toISOString(),
          updatedAt: product.updatedAt || new Date().toISOString(),
          __v: product.__v || 0
        },
        quantity,
        addedAt: new Date().toISOString()
      };
      cart.push(cartItem);
    }

    this.saveCart(cart);
    return cart;
  }

  updateCartItemQuantity(productId: string, quantity: number): LocalStorageCartItem[] {
    const cart = this.getCart();
    const itemIndex = cart.findIndex(item => item.productId === productId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart[itemIndex].quantity = quantity;
        cart[itemIndex].addedAt = new Date().toISOString();
      }
      this.saveCart(cart);
    }

    return cart;
  }

  removeFromCart(productId: string): LocalStorageCartItem[] {
    const cart = this.getCart();
    const filteredCart = cart.filter(item => item.productId !== productId);
    this.saveCart(filteredCart);
    return filteredCart;
  }

  getCartItemCount(): number {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotal(): number {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  getCartSubtotal(): number {
    return this.getCartTotal();
  }

  // Utility Methods
  isCartEmpty(): boolean {
    return this.getCart().length === 0;
  }

  getCartItem(productId: string): LocalStorageCartItem | null {
    const cart = this.getCart();
    return cart.find(item => item.productId === productId) || null;
  }

  // Check if cart has expired
  isCartExpired(): boolean {
    try {
      const expiryData = localStorage.getItem(this.CART_EXPIRY_KEY);
      if (!expiryData) return true;
      
      const expiryDate = new Date(expiryData);
      return new Date() > expiryDate;
    } catch (error) {
      console.error('Error checking cart expiry:', error);
      return true;
    }
  }

  // Get cart expiry date
  getCartExpiryDate(): Date | null {
    try {
      const expiryData = localStorage.getItem(this.CART_EXPIRY_KEY);
      return expiryData ? new Date(expiryData) : null;
    } catch (error) {
      console.error('Error getting cart expiry date:', error);
      return null;
    }
  }

  // Get days until cart expires
  getDaysUntilExpiry(): number {
    const expiryDate = this.getCartExpiryDate();
    if (!expiryDate) return 0;
    
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }
}
