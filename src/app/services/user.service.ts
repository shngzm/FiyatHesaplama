import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly STORAGE_KEY = 'elizi_goldtool_users_v1';
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadFromStorage();
    this.initializeAdminUser();
  }

  private loadFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          const users = JSON.parse(stored).map((u: any) => ({
            ...u,
            createdAt: new Date(u.createdAt),
            updatedAt: u.updatedAt ? new Date(u.updatedAt) : undefined
          }));
          this.usersSubject.next(users);
        } catch (error) {
          console.error('Failed to load users from storage:', error);
        }
      }
    }
  }

  private initializeAdminUser(): void {
    if (isPlatformBrowser(this.platformId) && this.usersSubject.value.length === 0) {
      console.log('Initializing default admin user...');
      const adminUser: CreateUserDto = {
        username: 'admin',
        password: 'admin123', // In production, this should be hashed
        location: 'Merkez',
        role: 'admin'
      };
      
      this.create(adminUser);
      console.log('Default admin user created');
    }
  }

  private saveToStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.usersSubject.value));
    }
  }

  getAll(): Observable<User[]> {
    return this.users$;
  }

  getById(id: string): User | undefined {
    return this.usersSubject.value.find(u => u.id === id);
  }

  getByUsername(username: string): User | undefined {
    return this.usersSubject.value.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  create(dto: CreateUserDto): User {
    // Check if username already exists
    const exists = this.usersSubject.value.some(
      u => u.username.toLowerCase() === dto.username.toLowerCase()
    );
    
    if (exists) {
      throw new Error('Bu kullanıcı adı zaten mevcut');
    }

    const newUser: User = {
      id: this.generateId(),
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updated = [...this.usersSubject.value, newUser];
    this.usersSubject.next(updated);
    this.saveToStorage();

    return newUser;
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
    this.saveToStorage();

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
    this.saveToStorage();
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
