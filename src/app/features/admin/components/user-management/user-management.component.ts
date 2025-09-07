import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { User } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

interface UserListResponse {
  success: boolean;
  data: User[];
  total: number;
  page: number;
  limit: number;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  users: User[] = [];
  loading = false;
  totalUsers = 0;
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];

  // Filters
  searchQuery = '';
  roleFilter = '';
  statusFilter = '';
  sortBy = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Filter options
  roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' }
  ];

  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

  sortOptions = [
    { value: 'createdAt', label: 'Registration Date' },
    { value: 'firstName', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'lastLogin', label: 'Last Login' }
  ];

  displayedColumns: string[] = ['avatar', 'name', 'email', 'role', 'status', 'lastLogin', 'actions'];

  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    // Debounce search input
    // This would be implemented with a search subject and debounceTime
  }

  loadUsers(): void {
    this.loading = true;
    
    const params = {
      page: this.currentPage,
      limit: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      search: this.searchQuery,
      role: this.roleFilter,
      status: this.statusFilter
    };

    // Mock data for now - would be replaced with actual API call
    setTimeout(() => {
      this.users = [
        {
          _id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          role: 'user',
          isActive: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          lastLogin: new Date('2024-01-20')
        },
        {
          _id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          role: 'admin',
          isActive: true,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10'),
          lastLogin: new Date('2024-01-21')
        }
      ];
      this.totalUsers = 2;
      this.loading = false;
    }, 1000);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active;
    this.sortOrder = sort.direction === 'asc' ? 'asc' : 'desc';
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onViewUser(user: User): void {
    console.log('View user:', user._id);
  }

  onEditUser(user: User): void {
    console.log('Edit user:', user._id);
  }

  onToggleUserStatus(user: User): void {
    const newStatus = !user.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      // Mock API call
      user.isActive = newStatus;
      this.notificationService.success(`User ${action}d successfully`);
    }
  }

  onDeleteUser(user: User): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      // Mock API call
      const index = this.users.findIndex(u => u._id === user._id);
      if (index > -1) {
        this.users.splice(index, 1);
        this.totalUsers--;
        this.notificationService.success('User deleted successfully');
      }
    }
  }

  onResetPassword(user: User): void {
    if (confirm('Are you sure you want to reset this user\'s password?')) {
      // Mock API call
      this.notificationService.success('Password reset email sent to user');
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'admin': return 'primary';
      case 'user': return 'accent';
      default: return 'primary';
    }
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'primary' : 'warn';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
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

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
}
