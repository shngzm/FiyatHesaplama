import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/admin/login']);
    return false;
  }

  const currentUser = authService.getCurrentUser();
  if (currentUser?.role === 'admin') {
    return true;
  }

  // Eğer admin değilse ana sayfaya yönlendir
  router.navigate(['/']);
  return false;
};
