import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService, Theme } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss']
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
  currentTheme: Theme = 'auto';
  isDarkMode = false;
  availableThemes = this.themeService.getAvailableThemes();

  private destroy$ = new Subject<void>();

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.getTheme()
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme;
      });

    this.themeService.isDarkModeActive()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        this.isDarkMode = isDark;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onThemeChange(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  onToggleTheme(): void {
    this.themeService.toggleTheme();
  }

  getCurrentThemeIcon(): string {
    return this.themeService.getThemeIcon();
  }

  getCurrentThemeLabel(): string {
    return this.themeService.getThemeLabel();
  }
}
