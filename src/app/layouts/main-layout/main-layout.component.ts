import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    LoadingComponent
  ],
  template: `
    <div class="main-layout">
      <app-header></app-header>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      
      <app-footer></app-footer>
      
      <app-loading></app-loading>
    </div>
  `,
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {}
