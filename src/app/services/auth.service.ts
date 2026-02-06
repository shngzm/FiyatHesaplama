import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'elizi_goldtool_users_v1';
  private readonly SESSION_KEY = 'currentUser';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Check if already logged in (session storage) - only in browser
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = sessionStorage.getItem(this.SESSION_KEY);
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        } catch (error) {
          console.error('Failed to restore session:', error);
          sessionStorage.removeItem(this.SESSION_KEY);
        }
      }
    }
  }

  login(username: string, password: string): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    // Load users from localStorage
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      return false;
    }

    try {
      const users: User[] = JSON.parse(stored);
      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
        return true;
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
    
    return false;
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.SESSION_KEY);
    }
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
