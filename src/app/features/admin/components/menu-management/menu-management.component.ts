import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { Subject, takeUntil } from 'rxjs';
import { MenuService, MenuItem } from '../../../../core/services/menu.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSortModule,
    MatChipsModule,
    MatDividerModule,
    MatExpansionModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="menu-management-container">
      <div class="header-section">
        <h1 class="page-title">
          <mat-icon>menu</mat-icon>
          Menu Management
        </h1>
        <p class="page-subtitle">
          Manage navigation menu items for the website header
        </p>
      </div>

      <div class="loading-container" *ngIf="isLoading">
        <app-loading-spinner message="Loading menu items..."></app-loading-spinner>
      </div>

      <div class="content-section" *ngIf="!isLoading">
        <!-- Menu Items Table -->
        <mat-card class="menu-table-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>list</mat-icon>
              Menu Items
            </mat-card-title>
            <div class="header-actions">
              <button mat-raised-button color="primary" (click)="openAddDialog()">
                <mat-icon>add</mat-icon>
                Add Menu Item
              </button>
            </div>
          </mat-card-header>

          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="menuItems" matSort class="menu-table">
                <!-- Order Column -->
                <ng-container matColumnDef="order">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Order</th>
                  <td mat-cell *matCellDef="let item">
                    <mat-chip class="order-chip">{{ item.order }}</mat-chip>
                  </td>
                </ng-container>

                <!-- Title Column -->
                <ng-container matColumnDef="title">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="title-cell">
                      <mat-icon>{{ item.icon }}</mat-icon>
                      <span>{{ item.title }}</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Route Column -->
                <ng-container matColumnDef="route">
                  <th mat-header-cell *matHeaderCellDef>Route</th>
                  <td mat-cell *matCellDef="let item">
                    <code class="route-code">{{ item.route }}</code>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="status-cell">
                      <mat-slide-toggle 
                        [checked]="item.isActive" 
                        (change)="toggleActive(item)"
                        [disabled]="isUpdating"
                      >
                        Active
                      </mat-slide-toggle>
                      <mat-slide-toggle 
                        [checked]="item.isVisible" 
                        (change)="toggleVisibility(item)"
                        [disabled]="isUpdating"
                      >
                        Visible
                      </mat-slide-toggle>
                    </div>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="actions-cell">
                      <button mat-icon-button (click)="openEditDialog(item)" matTooltip="Edit">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button (click)="moveUp(item)" [disabled]="item.order === 1" matTooltip="Move Up">
                        <mat-icon>keyboard_arrow_up</mat-icon>
                      </button>
                      <button mat-icon-button (click)="moveDown(item)" [disabled]="item.order === menuItems.length" matTooltip="Move Down">
                        <mat-icon>keyboard_arrow_down</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="deleteMenuItem(item)" matTooltip="Delete">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Menu Preview -->
        <mat-card class="preview-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>visibility</mat-icon>
              Menu Preview
            </mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <div class="menu-preview">
              <div class="preview-navbar">
                <div class="preview-menu-items">
                  <div 
                    *ngFor="let item of visibleMenuItems" 
                    class="preview-menu-item"
                    [class.inactive]="!item.isActive"
                  >
                    <mat-icon>{{ item.icon }}</mat-icon>
                    <span>{{ item.title }}</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>

    <!-- Add/Edit Menu Item Dialog -->
    <div class="dialog-overlay" *ngIf="showDialog" (click)="closeDialog()">
      <div class="dialog-content" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h2>{{ isEditing ? 'Edit Menu Item' : 'Add Menu Item' }}</h2>
          <button mat-icon-button (click)="closeDialog()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <form [formGroup]="menuForm" (ngSubmit)="saveMenuItem()" class="dialog-form">
          <mat-form-field appearance="outline">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" placeholder="Enter menu item title">
            <mat-error *ngIf="menuForm.get('title')?.hasError('required')">
              Title is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Route</mat-label>
            <input matInput formControlName="route" placeholder="Enter route (e.g., /about)">
            <mat-error *ngIf="menuForm.get('route')?.hasError('required')">
              Route is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Icon</mat-label>
            <mat-select formControlName="icon">
              <mat-option value="home">Home</mat-option>
              <mat-option value="info">Info</mat-option>
              <mat-option value="contact_mail">Contact Mail</mat-option>
              <mat-option value="help_outline">Help Outline</mat-option>
              <mat-option value="shopping_cart">Shopping Cart</mat-option>
              <mat-option value="person">Person</mat-option>
              <mat-option value="settings">Settings</mat-option>
              <mat-option value="dashboard">Dashboard</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Order</mat-label>
            <input matInput type="number" formControlName="order" min="1">
            <mat-error *ngIf="menuForm.get('order')?.hasError('required')">
              Order is required
            </mat-error>
          </mat-form-field>

          <div class="form-checkboxes">
            <mat-slide-toggle formControlName="isActive">
              Active
            </mat-slide-toggle>
            <mat-slide-toggle formControlName="isVisible">
              Visible
            </mat-slide-toggle>
          </div>

          <div class="dialog-actions">
            <button mat-button type="button" (click)="closeDialog()">
              Cancel
            </button>
            <button mat-raised-button color="primary" type="submit" [disabled]="menuForm.invalid || isSaving">
              <mat-icon *ngIf="isSaving">hourglass_empty</mat-icon>
              {{ isEditing ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./menu-management.component.scss']
})
export class MenuManagementComponent implements OnInit, OnDestroy {
  menuItems: MenuItem[] = [];
  visibleMenuItems: MenuItem[] = [];
  displayedColumns: string[] = ['order', 'title', 'route', 'status', 'actions'];
  isLoading = false;
  isUpdating = false;
  isSaving = false;
  isEditing = false;
  showDialog = false;
  editingItem: MenuItem | null = null;
  
  menuForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private menuService: MenuService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.menuForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      route: ['', [Validators.required, Validators.pattern(/^\/[a-zA-Z0-9\-_\/]*$/)]],
      icon: ['', Validators.required],
      order: [1, [Validators.required, Validators.min(1)]],
      isActive: [true],
      isVisible: [true]
    });
  }

  ngOnInit(): void {
    this.loadMenuItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMenuItems(): void {
    this.isLoading = true;
    this.menuService.loadMenuItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.menuItems = items;
          this.updateVisibleItems();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading menu items:', error);
          this.notificationService.error('Failed to load menu items');
          this.isLoading = false;
        }
      });
  }

  private updateVisibleItems(): void {
    this.visibleMenuItems = this.menuService.getVisibleMenuItems();
  }

  openAddDialog(): void {
    this.isEditing = false;
    this.editingItem = null;
    this.menuForm.reset({
      title: '',
      route: '',
      icon: '',
      order: this.menuItems.length + 1,
      isActive: true,
      isVisible: true
    });
    this.showDialog = true;
  }

  openEditDialog(item: MenuItem): void {
    this.isEditing = true;
    this.editingItem = item;
    this.menuForm.patchValue({
      title: item.title,
      route: item.route,
      icon: item.icon,
      order: item.order,
      isActive: item.isActive,
      isVisible: item.isVisible
    });
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.isEditing = false;
    this.editingItem = null;
    this.menuForm.reset();
  }

  saveMenuItem(): void {
    if (this.menuForm.invalid) {
      this.notificationService.warning('Please fill in all required fields');
      return;
    }

    this.isSaving = true;
    const formValue = this.menuForm.value;

    if (this.isEditing && this.editingItem) {
      // Update existing item
      this.menuService.updateMenuItem(this.editingItem._id!, formValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedItem) => {
            this.notificationService.success('Menu item updated successfully');
            this.closeDialog();
            this.updateVisibleItems();
            this.isSaving = false;
          },
          error: (error) => {
            console.error('Error updating menu item:', error);
            this.notificationService.error('Failed to update menu item');
            this.isSaving = false;
          }
        });
    } else {
      // Create new item
      this.menuService.createMenuItem(formValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (newItem) => {
            this.notificationService.success('Menu item created successfully');
            this.closeDialog();
            this.updateVisibleItems();
            this.isSaving = false;
          },
          error: (error) => {
            console.error('Error creating menu item:', error);
            this.notificationService.error('Failed to create menu item');
            this.isSaving = false;
          }
        });
    }
  }

  deleteMenuItem(item: MenuItem): void {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      this.menuService.deleteMenuItem(item._id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Menu item deleted successfully');
            this.updateVisibleItems();
          },
          error: (error) => {
            console.error('Error deleting menu item:', error);
            this.notificationService.error('Failed to delete menu item');
          }
        });
    }
  }

  toggleActive(item: MenuItem): void {
    this.isUpdating = true;
    this.menuService.updateMenuItem(item._id!, { isActive: !item.isActive })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.updateVisibleItems();
          this.isUpdating = false;
        },
        error: (error) => {
          console.error('Error toggling active status:', error);
          this.notificationService.error('Failed to update menu item');
          this.isUpdating = false;
        }
      });
  }

  toggleVisibility(item: MenuItem): void {
    this.isUpdating = true;
    this.menuService.updateMenuItem(item._id!, { isVisible: !item.isVisible })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.updateVisibleItems();
          this.isUpdating = false;
        },
        error: (error) => {
          console.error('Error toggling visibility:', error);
          this.notificationService.error('Failed to update menu item');
          this.isUpdating = false;
        }
      });
  }

  moveUp(item: MenuItem): void {
    if (item.order > 1) {
      const currentIndex = this.menuItems.findIndex(i => i._id === item._id);
      const targetIndex = currentIndex - 1;
      
      // Swap orders
      const temp = this.menuItems[currentIndex].order;
      this.menuItems[currentIndex].order = this.menuItems[targetIndex].order;
      this.menuItems[targetIndex].order = temp;
      
      this.reorderItems();
    }
  }

  moveDown(item: MenuItem): void {
    if (item.order < this.menuItems.length) {
      const currentIndex = this.menuItems.findIndex(i => i._id === item._id);
      const targetIndex = currentIndex + 1;
      
      // Swap orders
      const temp = this.menuItems[currentIndex].order;
      this.menuItems[currentIndex].order = this.menuItems[targetIndex].order;
      this.menuItems[targetIndex].order = temp;
      
      this.reorderItems();
    }
  }

  private reorderItems(): void {
    this.menuService.reorderMenuItems(this.menuItems)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.updateVisibleItems();
        },
        error: (error) => {
          console.error('Error reordering items:', error);
          this.notificationService.error('Failed to reorder menu items');
          // Reload items to restore correct order
          this.loadMenuItems();
        }
      });
  }
}