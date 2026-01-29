import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ADMIN_USERNAME = 'mrc';
  private readonly ADMIN_PASSWORD = '6161';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Check if already logged in (session storage) - only in browser
    if (isPlatformBrowser(this.platformId)) {
      const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
      this.isAuthenticatedSubject.next(isLoggedIn);
    }
  }

  login(username: string, password: string): boolean {
    if (username === this.ADMIN_USERNAME && password === this.ADMIN_PASSWORD) {
      this.isAuthenticatedSubject.next(true);
      if (isPlatformBrowser(this.platformId)) {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
      }
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticatedSubject.next(false);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('isAdminLoggedIn');
    }
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
