import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';
import { environment } from '../../environments/environment';

interface ApiResponse {
  success: boolean;
  user?: User;
  users?: User[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor() {
    // Load users from backend
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    try {
      console.log('[UserService] Loading users from backend...');
      
      const response = await firstValueFrom(
        this.http.get<ApiResponse>(`${this.apiUrl}/users`)
      );

      if (response.success && response.users) {
        console.log('[UserService] Loaded users:', response.users.length);
        this.usersSubject.next(response.users);
      }
    } catch (error: any) {
      console.error('[UserService] Load users error:', error);
      // Don't throw - just log, UI will show empty list
    }
  }

  getAll(): Observable<User[]> {
    return this.users$;
  }

  getById(id: string): User | undefined {
    return this.usersSubject.value.find(u => u.id === id);
  }

  async create(dto: CreateUserDto): Promise<User> {
    try {
      console.log('[UserService] Creating user:', dto.username);
      
      const response = await firstValueFrom(
        this.http.post<ApiResponse>(`${this.apiUrl}/register`, {
          username: dto.username,
          password: dto.password,
          role: dto.role || 'representative'
        })
      );

      console.log('[UserService] User created:', response);

      if (response.success && response.user) {
        // Reload users from backend to get fresh data
        await this.loadUsers();
        return response.user;
      } else {
        throw new Error(response.message || 'Kullanıcı oluşturulamadı');
      }
    } catch (error: any) {
      console.error('[UserService] Create user error:', error);
      throw new Error(error.error?.message || 'Kullanıcı oluşturulurken hata oluştu');
    }
  }

  update(id: string, dto: UpdateUserDto): User {
    const index = this.usersSubject.value.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('Kullanıcı bulunamadı');
    }

    // If username is being updated, check if it already exists
    if (dto.username) {
      const exists = this.usersSubject.value.some(
        u => u.id !== id && u.username.toLowerCase() === dto.username!.toLowerCase()
      );
      
      if (exists) {
        throw new Error('Bu kullanıcı adı zaten mevcut');
      }
    }

    const updated = [...this.usersSubject.value];
    updated[index] = {
      ...updated[index],
      ...dto,
      updatedAt: new Date()
    };

    this.usersSubject.next(updated);
    return updated[index];
  }

  delete(id: string): void {
    const user = this.getById(id);
    
    // Prevent deleting the last admin
    if (user?.role === 'admin') {
      const adminCount = this.usersSubject.value.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        throw new Error('Son admin kullanıcısı silinemez');
      }
    }

    const updated = this.usersSubject.value.filter(u => u.id !== id);
    this.usersSubject.next(updated);
  }

  async deleteFromBackend(id: string): Promise<void> {
    try {
      console.log('[UserService] Deleting user from backend:', id);
      
      const response = await firstValueFrom(
        this.http.delete<ApiResponse>(`${this.apiUrl}/users/${id}`)
      );

      console.log('[UserService] User deleted:', response);

      if (response.success) {
        // Reload users from backend to get fresh data
        await this.loadUsers();
      } else {
        throw new Error(response.message || 'Kullanıcı silinemedi');
      }
    } catch (error: any) {
      console.error('[UserService] Delete user error:', error);
      throw new Error(error.error?.message || 'Kullanıcı silinirken hata oluştu');
    }
  }
}
