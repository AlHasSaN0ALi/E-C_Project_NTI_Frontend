import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface MenuItem {
  _id?: string;
  title: string;
  route: string;
  icon: string;
  order: number;
  isActive: boolean;
  isVisible: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MenuResponse {
  success: boolean;
  data: MenuItem[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuItems = new BehaviorSubject<MenuItem[]>([]);
  private readonly MENU_STORAGE_KEY = 'navbar_menu_items';

  constructor(private apiService: ApiService) {
    this.loadDefaultMenuItems();
  }

  // Get menu items as observable
  getMenuItems(): Observable<MenuItem[]> {
    return this.menuItems.asObservable();
  }

  // Get current menu items
  getCurrentMenuItems(): MenuItem[] {
    return this.menuItems.value;
  }

  // Load menu items from backend
  loadMenuItems(): Observable<MenuItem[]> {
    return this.apiService.get<MenuResponse>('/admin/menu').pipe(
      map(response => {
        if (response.success && response.data) {
          const sortedItems = response.data.sort((a, b) => a.order - b.order);
          this.menuItems.next(sortedItems);
          this.saveMenuToStorage(sortedItems);
          return sortedItems;
        }
        return this.getDefaultMenuItems();
      }),
      catchError(error => {
        console.error('Error loading menu items:', error);
        // Fallback to default menu items
        const defaultItems = this.getDefaultMenuItems();
        this.menuItems.next(defaultItems);
        return of(defaultItems);
      })
    );
  }

  // Create new menu item
  createMenuItem(menuItem: Omit<MenuItem, '_id' | 'createdAt' | 'updatedAt'>): Observable<MenuItem> {
    return this.apiService.post<{ success: boolean; data: MenuItem }>('/admin/menu', menuItem).pipe(
      map(response => {
        if (response.success && response.data) {
          const currentItems = this.menuItems.value;
          const newItems = [...currentItems, response.data].sort((a, b) => a.order - b.order);
          this.menuItems.next(newItems);
          this.saveMenuToStorage(newItems);
          return response.data;
        }
        throw new Error('Failed to create menu item');
      }),
      catchError(error => {
        console.error('Error creating menu item:', error);
        throw error;
      })
    );
  }

  // Update menu item
  updateMenuItem(id: string, updates: Partial<MenuItem>): Observable<MenuItem> {
    return this.apiService.put<{ success: boolean; data: MenuItem }>(`/admin/menu/${id}`, updates).pipe(
      map(response => {
        if (response.success && response.data) {
          const currentItems = this.menuItems.value;
          const updatedItems = currentItems.map(item => 
            item._id === id ? { ...item, ...response.data } : item
          ).sort((a, b) => a.order - b.order);
          this.menuItems.next(updatedItems);
          this.saveMenuToStorage(updatedItems);
          return response.data;
        }
        throw new Error('Failed to update menu item');
      }),
      catchError(error => {
        console.error('Error updating menu item:', error);
        throw error;
      })
    );
  }

  // Delete menu item
  deleteMenuItem(id: string): Observable<boolean> {
    return this.apiService.delete<{ success: boolean }>(`/admin/menu/${id}`).pipe(
      map(response => {
        if (response.success) {
          const currentItems = this.menuItems.value;
          const filteredItems = currentItems.filter(item => item._id !== id);
          this.menuItems.next(filteredItems);
          this.saveMenuToStorage(filteredItems);
          return true;
        }
        throw new Error('Failed to delete menu item');
      }),
      catchError(error => {
        console.error('Error deleting menu item:', error);
        throw error;
      })
    );
  }

  // Reorder menu items
  reorderMenuItems(items: MenuItem[]): Observable<boolean> {
    const reorderedItems = items.map((item, index) => ({ ...item, order: index + 1 }));
    
    return this.apiService.put<{ success: boolean }>('/admin/menu/reorder', { items: reorderedItems }).pipe(
      map(response => {
        if (response.success) {
          this.menuItems.next(reorderedItems);
          this.saveMenuToStorage(reorderedItems);
          return true;
        }
        throw new Error('Failed to reorder menu items');
      }),
      catchError(error => {
        console.error('Error reordering menu items:', error);
        throw error;
      })
    );
  }

  // Toggle menu item visibility
  toggleMenuItemVisibility(id: string): Observable<MenuItem> {
    const currentItems = this.menuItems.value;
    const item = currentItems.find(item => item._id === id);
    
    if (!item) {
      throw new Error('Menu item not found');
    }

    return this.updateMenuItem(id, { isVisible: !item.isVisible });
  }

  // Get visible menu items for navbar
  getVisibleMenuItems(): MenuItem[] {
    return this.menuItems.value
      .filter(item => item.isVisible && item.isActive)
      .sort((a, b) => a.order - b.order);
  }

  // Private methods
  private loadDefaultMenuItems(): void {
    const storedItems = this.getMenuFromStorage();
    if (storedItems && storedItems.length > 0) {
      this.menuItems.next(storedItems);
    } else {
      const defaultItems = this.getDefaultMenuItems();
      this.menuItems.next(defaultItems);
      this.saveMenuToStorage(defaultItems);
    }
  }

  private getDefaultMenuItems(): MenuItem[] {
    return [
      {
        _id: '1',
        title: 'Home',
        route: '/home',
        icon: 'home',
        order: 1,
        isActive: true,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '2',
        title: 'Contact Us',
        route: '/contact',
        icon: 'contact_mail',
        order: 2,
        isActive: true,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '3',
        title: 'About Us',
        route: '/about',
        icon: 'info',
        order: 3,
        isActive: true,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '4',
        title: 'FAQs',
        route: '/faq',
        icon: 'help_outline',
        order: 4,
        isActive: true,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private saveMenuToStorage(items: MenuItem[]): void {
    try {
      localStorage.setItem(this.MENU_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving menu to storage:', error);
    }
  }

  private getMenuFromStorage(): MenuItem[] | null {
    try {
      const stored = localStorage.getItem(this.MENU_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading menu from storage:', error);
      return null;
    }
  }
}
