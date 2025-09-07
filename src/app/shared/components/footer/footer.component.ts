import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <footer class="footer">
      <div class="footer-content">
        <!-- Company Info -->
        <div class="footer-section">
          <h3 class="footer-title">
            <mat-icon>store</mat-icon>
            Laptop Shop
          </h3>
          <p class="footer-description">
            Your one-stop destination for quality laptops and tech products at great prices. 
            We're committed to providing excellent customer service and fast delivery.
          </p>
        </div>

        <!-- Quick Links -->
        <div class="footer-section">
          <h4 class="footer-subtitle">Quick Links</h4>
          <ul class="footer-links">
            <li><a routerLink="/home">Home</a></li>
            <li><a routerLink="/products">Products</a></li>
            <li><a routerLink="/categories">Categories</a></li>
            <li><a routerLink="/about">About Us</a></li>
            <li><a routerLink="/contact">Contact</a></li>
          </ul>
        </div>

        <!-- Customer Service -->
        <div class="footer-section">
          <h4 class="footer-subtitle">Customer Service</h4>
          <ul class="footer-links">
            <li><a routerLink="/customer-service" fragment="help-center">Help Center</a></li>
            <li><a routerLink="/customer-service" fragment="shipping-info">Shipping Info</a></li>
            <li><a routerLink="/customer-service" fragment="returns">Returns</a></li>
            <li><a routerLink="/customer-service" fragment="privacy-policy">Privacy Policy</a></li>
            <li><a routerLink="/customer-service" fragment="terms-of-service">Terms of Service</a></li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div class="footer-section">
          <h4 class="footer-subtitle">Contact Info</h4>
          <div class="contact-info">
            <div class="contact-item">
              <mat-icon>location_on</mat-icon>
              <span>123 Commerce Street<br>Business City, BC 12345</span>
            </div>
            <div class="contact-item">
              <mat-icon>phone</mat-icon>
              <span>+1 (555) 123-4567</span>
            </div>
            <div class="contact-item">
              <mat-icon>email</mat-icon>
              <span>info&#64;laptopshop.com</span>
            </div>
          </div>
          <div class="contact-us-link">
            <a routerLink="/contact" class="contact-button">
              <mat-icon>contact_mail</mat-icon>
              Contact Us
            </a>
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <p class="copyright">
            © {{ currentYear }} Laptop Shop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  `,
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  get currentYear(): number {
    return new Date().getFullYear();
  }
}