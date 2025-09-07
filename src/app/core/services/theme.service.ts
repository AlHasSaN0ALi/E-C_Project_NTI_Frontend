import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>('auto');
  private isDarkMode = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initializeTheme();
    this.watchSystemTheme();
  }

  /**
   * Get current theme
   */
  getTheme(): Observable<Theme> {
    return this.themeSubject.asObservable();
  }

  /**
   * Get current theme value
   */
  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  /**
   * Check if dark mode is active
   */
  isDarkModeActive(): Observable<boolean> {
    return this.isDarkMode.asObservable();
  }

  /**
   * Set theme
   */
  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    this.applyTheme(theme);
    this.saveTheme(theme);
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    const currentTheme = this.getCurrentTheme();
    if (currentTheme === 'auto') {
      this.setTheme('light');
    } else if (currentTheme === 'light') {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }
  }

  /**
   * Initialize theme from localStorage or system preference
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const theme = savedTheme || 'auto';
    this.setTheme(theme);
  }

  /**
   * Watch system theme changes
   */
  private watchSystemTheme(): void {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        if (this.getCurrentTheme() === 'auto') {
          this.updateDarkMode(e.matches);
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      
      // Initial check
      if (this.getCurrentTheme() === 'auto') {
        this.updateDarkMode(mediaQuery.matches);
      }
    }
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: Theme): void {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('light-theme', 'dark-theme');
    
    if (theme === 'auto') {
      // Use system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.updateDarkMode(prefersDark);
    } else if (theme === 'dark') {
      body.classList.add('dark-theme');
      this.updateDarkMode(true);
    } else {
      body.classList.add('light-theme');
      this.updateDarkMode(false);
    }
  }

  /**
   * Update dark mode state
   */
  private updateDarkMode(isDark: boolean): void {
    this.isDarkMode.next(isDark);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#121212' : '#ffffff');
    }
  }

  /**
   * Save theme to localStorage
   */
  private saveTheme(theme: Theme): void {
    localStorage.setItem('theme', theme);
  }

  /**
   * Get theme icon
   */
  getThemeIcon(): string {
    const theme = this.getCurrentTheme();
    switch (theme) {
      case 'light':
        return 'light_mode';
      case 'dark':
        return 'dark_mode';
      case 'auto':
        return 'brightness_auto';
      default:
        return 'brightness_auto';
    }
  }

  /**
   * Get theme label
   */
  getThemeLabel(): string {
    const theme = this.getCurrentTheme();
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'auto':
        return 'Auto';
      default:
        return 'Auto';
    }
  }

  /**
   * Get available themes
   */
  getAvailableThemes(): { value: Theme; label: string; icon: string }[] {
    return [
      { value: 'light', label: 'Light', icon: 'light_mode' },
      { value: 'dark', label: 'Dark', icon: 'dark_mode' },
      { value: 'auto', label: 'Auto', icon: 'brightness_auto' }
    ];
  }
}
