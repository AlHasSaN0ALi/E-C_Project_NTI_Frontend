# E-Commerce Frontend

A modern, responsive e-commerce frontend built with Angular 17, featuring a comprehensive product catalog, shopping cart, order management, user authentication, and admin panel.

## 🚀 Features

### Core Features
- **Product Catalog** - Browse, search, and filter products with advanced filtering options
- **Shopping Cart** - Add/remove items, quantity management, and cart persistence
- **User Authentication** - Login, registration, profile management, and password reset
- **Order Management** - Order history, tracking, and status updates
- **Review System** - Product reviews, ratings, and moderation
- **Admin Panel** - Comprehensive dashboard for managing users, products, orders, and analytics

### Technical Features
- **Responsive Design** - Mobile-first approach with Material Design
- **Dark Theme Support** - Automatic system preference detection with manual override
- **Performance Monitoring** - Real-time performance metrics and optimization
- **Error Handling** - Global error boundary with user-friendly error messages
- **File Upload** - Drag & drop image upload with progress tracking
- **Lazy Loading** - Optimized bundle loading for better performance
- **Service Worker** - Offline support and automatic updates

## 🛠️ Tech Stack

- **Frontend Framework**: Angular 17.3.0
- **Language**: TypeScript 5.2.0
- **UI Library**: Angular Material 17.0.0
- **Styling**: SCSS with custom theming
- **State Management**: RxJS with BehaviorSubject
- **HTTP Client**: Angular HttpClient with interceptors
- **Routing**: Angular Router with lazy loading
- **Forms**: Reactive Forms with validation
- **Notifications**: ngx-toastr
- **Loading**: ngx-spinner
- **Charts**: Chart.js integration ready

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Angular CLI

### Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd ecommerce-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
# Copy environment files
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.prod.example.ts src/environments/environment.prod.ts
```

4. Update environment variables:
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1', // Your backend API URL
  appName: 'E-Commerce Store',
  // ... other configuration
};
```

5. Start development server:
```bash
ng serve
```

The application will be available at `http://localhost:4200`

## 🏗️ Project Structure

```
src/
├── app/
│   ├── core/                    # Core functionality
│   │   ├── guards/             # Route guards
│   │   ├── interceptors/       # HTTP interceptors
│   │   ├── models/             # TypeScript interfaces
│   │   └── services/           # Core services
│   ├── features/               # Feature modules
│   │   ├── auth/               # Authentication
│   │   ├── products/           # Product catalog
│   │   ├── cart/               # Shopping cart
│   │   ├── orders/             # Order management
│   │   ├── reviews/            # Review system
│   │   └── admin/              # Admin panel
│   ├── layouts/                # Layout components
│   ├── shared/                 # Shared components
│   └── environments/           # Environment configuration
├── assets/                     # Static assets
└── styles/                     # Global styles and themes
```

## 🎨 Theming

The application supports both light and dark themes with automatic system preference detection.

### Theme Configuration
```typescript
// src/app/core/services/theme.service.ts
const themeService = inject(ThemeService);

// Set theme
themeService.setTheme('dark'); // 'light' | 'dark' | 'auto'

// Toggle theme
themeService.toggleTheme();

// Get current theme
themeService.getCurrentTheme();
```

### Custom Theming
Themes are defined in `src/styles/themes.scss` with comprehensive color palettes, spacing, and typography variables.

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **xs**: 0px - 575px (Mobile)
- **sm**: 576px - 767px (Large Mobile)
- **md**: 768px - 991px (Tablet)
- **lg**: 992px - 1199px (Desktop)
- **xl**: 1200px+ (Large Desktop)

## 🔧 Development

### Available Scripts
```bash
# Development server
ng serve

# Build for production
ng build --configuration production

# Run tests
ng test

# Run linting
ng lint

# Generate component
ng generate component <name>

# Generate service
ng generate service <name>
```

### Code Style
- Follow Angular style guide
- Use TypeScript strict mode
- Implement proper error handling
- Write unit tests for services
- Use reactive forms
- Follow RxJS best practices

## 🚀 Deployment

### Production Build
```bash
ng build --configuration production
```

### Environment Configuration
Update `src/environments/environment.prod.ts` with production settings:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api/v1',
  // ... other production settings
};
```

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFlare, AWS CloudFront
- **Container**: Docker with nginx
- **Cloud**: AWS S3, Google Cloud Storage

## 📊 Performance

### Optimization Features
- Lazy loading for all feature modules
- OnPush change detection strategy
- Memory leak prevention with takeUntil
- Image optimization and compression
- Bundle size optimization
- Service worker for caching

### Performance Monitoring
The application includes built-in performance monitoring:
- Load time tracking
- Memory usage monitoring
- Network request counting
- Error tracking
- User interaction analytics

## 🔒 Security

### Security Features
- Content Security Policy (CSP)
- XSS protection
- CSRF protection
- Secure HTTP headers
- Input validation and sanitization
- JWT token management

## 🧪 Testing

### Testing Strategy
- Unit tests for services and components
- Integration tests for feature modules
- E2E tests for critical user flows
- Performance testing
- Accessibility testing

### Running Tests
```bash
# Unit tests
ng test

# E2E tests
ng e2e

# Coverage report
ng test --code-coverage
```

## 📚 API Integration

### Backend Requirements
The frontend expects a RESTful API with the following endpoints:

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout

#### Products
- `GET /products` - Get products with filtering
- `GET /products/:id` - Get product details
- `POST /products` - Create product (admin)
- `PUT /products/:id` - Update product (admin)
- `DELETE /products/:id` - Delete product (admin)

#### Categories
- `GET /categories` - Get categories
- `POST /categories` - Create category (admin)
- `PUT /categories/:id` - Update category (admin)
- `DELETE /categories/:id` - Delete category (admin)

#### Cart
- `GET /cart` - Get user cart
- `POST /cart/add` - Add item to cart
- `PUT /cart/update` - Update cart item
- `DELETE /cart/remove` - Remove cart item
- `DELETE /cart/clear` - Clear cart

#### Orders
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order
- `PUT /orders/:id` - Update order status (admin)

#### Reviews
- `GET /reviews/product/:id` - Get product reviews
- `POST /reviews` - Create review
- `PUT /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments
- Contact the development team

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Complete e-commerce functionality
- Responsive design
- Dark theme support
- Performance monitoring
- Error handling
- Admin panel
- Review system
- File upload system

---

**Built with ❤️ using Angular 17**