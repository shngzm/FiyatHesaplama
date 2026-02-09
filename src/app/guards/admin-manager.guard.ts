import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminManagerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/admin/login']);
    return false;
  }

  const currentUser = authService.getCurrentUser();
  if (currentUser?.role === 'admin' || currentUser?.role === 'manager') {
    return true;
  }

  // Eğer admin veya manager değilse ana sayfaya yönlendir
  router.navigate(['/']);
  return false;
};
