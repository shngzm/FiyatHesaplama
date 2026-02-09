import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { environment } from '../../environments/environment';

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    role: string;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Initialize from localStorage if available
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        console.error('Failed to load stored user:', error);
        this.clearAuth();
      }
    }
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      console.log('[AUTH] Login attempt:', { username, apiUrl: this.apiUrl });
      console.log('[AUTH] Full URL:', `${this.apiUrl}/login`);
      
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      );
      
      console.log('[AUTH] Login response:', response);
      
      if (response.success && response.token && response.user) {
        // Store token and user
        localStorage.setItem('token', response.token);
        
        // Map role correctly
        let userRole: UserRole = 'representative';
        if (response.user.role === 'admin') {
          userRole = 'admin';
        } else if (response.user.role === 'manager') {
          userRole = 'manager';
        }
        
        const user: User = {
          _id: response.user.id,
          username: response.user.username,
          password: '', // Don't store password
          role: userRole,
          location: 'Default',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        return true;
      } else {
        console.error('[AUTH] Login failed - invalid response:', response.message);
        return false;
      }
    } catch (error: any) {
      console.error('[AUTH] Login exception:', error);
      console.error('[AUTH] Error details:', {
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        url: error.url,
        headers: error.headers
      });
      return false;
    }
  }

  async logout(): Promise<void> {
    this.clearAuth();
  }

  private clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
