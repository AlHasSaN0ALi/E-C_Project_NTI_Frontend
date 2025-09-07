import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthService } from './core/services/auth.service';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MainLayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'E-Commerce Store';

  constructor(
    public authService: AuthService,
    public loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    // Initialize the application
    console.log('E-Commerce Application Started');
  }
}
