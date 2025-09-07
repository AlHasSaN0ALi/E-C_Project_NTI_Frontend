import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { Subject, takeUntil } from 'rxjs';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  isLoading = false;
  
  private destroy$ = new Subject<void>();

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe({
      next: (response: any) => {
        this.categories = response.data || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
        this.categories = [];
        this.isLoading = false;
      }
    });
  }

  getCategoryIcon(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'Electronics': 'devices',
      'Clothing': 'checkroom',
      'Books': 'menu_book',
      'Home': 'home',
      'Sports': 'sports_soccer',
      'Beauty': 'face',
      'Toys': 'toys',
      'Automotive': 'directions_car',
      'Health': 'health_and_safety',
      'Food': 'restaurant'
    };
    return iconMap[categoryName] || 'category';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder-category.jpg';
  }
}
