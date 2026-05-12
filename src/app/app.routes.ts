import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list.component').then((m) => m.ProductListComponent),
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/product-detail.component').then((m) => m.ProductDetailComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/orders/checkout.component').then((m) => m.CheckoutComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/orders/user-dashboard.component').then((m) => m.UserDashboardComponent),
  },
  {
    path: 'maintenance',
    loadComponent: () => import('./features/maintenance/maintenance.component').then((m) => m.MaintenanceComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
  },
  {
    path: 'vendor',
    loadComponent: () => import('./features/vendor/vendor-dashboard.component').then((m) => m.VendorDashboardComponent),
  },
  { path: '**', redirectTo: '' },
];
