import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { ModelManagementComponent } from './components/model-management/model-management.component';
import { ProductManagementComponent } from './components/product-management/product-management.component';
import { CalculationComponent } from './components/calculation/calculation.component';
import { ScrapCalculatorComponent } from './components/scrap-calculator/scrap-calculator.component';
import { GramPriceCalculatorComponent } from './components/gram-price-calculator/gram-price-calculator.component';
import { GoldPriceManagementComponent } from './components/admin/gold-price-management/gold-price-management.component';
import { UserManagementComponent } from './components/admin/user-management/user-management.component';
import { CustomerManagementComponent } from './components/customer-management/customer-management.component';
import { OrderManagementComponent } from './components/order-management/order-management.component';
import { ActivityReportComponent } from './components/activity-report/activity-report.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { adminManagerGuard } from './guards/admin-manager.guard';

export const routes: Routes = [
  { path: 'login', component: AdminLoginComponent },
  { 
    path: '', 
    component: HomeComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'scrap-calculator', 
    component: ScrapCalculatorComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'calculation', 
    component: CalculationComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'gram-price-calculator', 
    component: GramPriceCalculatorComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'admin/models', 
    component: ModelManagementComponent,
    canActivate: [adminManagerGuard]
  },
  { 
    path: 'admin/products', 
    component: ProductManagementComponent,
    canActivate: [adminManagerGuard]
  },
  { 
    path: 'admin/gold-price', 
    component: GoldPriceManagementComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'admin/users', 
    component: UserManagementComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'customers', 
    component: CustomerManagementComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'orders', 
    component: OrderManagementComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'activity-report', 
    component: ActivityReportComponent,
    canActivate: [authGuard, adminGuard]
  },
  { path: '**', redirectTo: 'login' }
];
