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
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'scrap-calculator', component: ScrapCalculatorComponent },
  { path: 'calculation', component: CalculationComponent },
  { path: 'gram-price-calculator', component: GramPriceCalculatorComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { 
    path: 'admin/models', 
    component: ModelManagementComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'admin/products', 
    component: ProductManagementComponent,
    canActivate: [authGuard]
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
  { path: '**', redirectTo: '' }
];
