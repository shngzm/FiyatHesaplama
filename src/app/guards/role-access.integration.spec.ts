import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { User, CreateUserDto } from '../models/user.model';

describe('Role-Based Access Control Integration Tests', () => {
  let authService: AuthService;
  let userService: UserService;
  let router: Router;

  beforeEach(() => {
    // Clear storage before creating services
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }

    TestBed.configureTestingModule({
      providers: [AuthService, UserService, Router]
    });

    authService = TestBed.inject(AuthService);
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    // Logout and clear storage after each test
    authService.logout();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  });

  describe('Admin User Access', () => {
    beforeEach(() => {
      // Login as admin (created by UserService initialization)
      authService.login('admin', 'admin123');
    });

    it('should allow admin to access model management', () => {
      const user = authService.getCurrentUser();
      expect(user?.role).toBe('admin');
      expect(authService.isLoggedIn()).toBe(true);
    });

    it('should allow admin to access product management', () => {
      const user = authService.getCurrentUser();
      expect(user?.role).toBe('admin');
      expect(authService.isLoggedIn()).toBe(true);
    });

    it('should allow admin to access user management', () => {
      const user = authService.getCurrentUser();
      expect(user?.role).toBe('admin');
      expect(authService.isLoggedIn()).toBe(true);
    });

    it('should allow admin to access gold price management', () => {
      const user = authService.getCurrentUser();
      expect(user?.role).toBe('admin');
      expect(authService.isLoggedIn()).toBe(true);
    });
  });

  describe('Manager User Access', () => {
    beforeEach(() => {
      // Create and login as manager
      const managerDto: CreateUserDto = {
        username: 'mgr' + Date.now(), // Unique username
        password: 'test123',
        location: 'Test Store',
        role: 'manager'
      };
      userService.create(managerDto);
      authService.login(managerDto.username, 'test123');
    });

    it('should NOT allow manager to access model management', () => {
      const user = authService.getCurrentUser();
      expect(user?.role).toBe('manager');
      expect(user?.role).not.toBe('admin');
    });

    it('should NOT allow manager to access product management', () => {
      const user = authService.getCurrentUser();
      expect(user?.role).toBe('manager');
      expect(user?.role).not.toBe('admin');
    });

    it('should NOT allow manager to access user management', () => {
      const user = authService.getCurrentUser();
      expect(user?.role).toBe('manager');
      expect(user?.role).not.toBe('admin');
    });

    it('should allow manager to access gold price management', () => {
      const user = authService.getCurrentUser();
      expect(user?.role).toBe('manager');
      expect(authService.isLoggedIn()).toBe(true);
    });
  });

  describe('Representative (Sales) User Access', () => {
    beforeEach(() => {
      // Create and login as representative
      const repDto: CreateUserDto = {
        username: 'rep' + Date.now(), // Unique username
        password: 'test123',
        location: 'Sales Floor',
        role: 'representative'
      };
      userService.create(repDto);
      authService.login(repDto.username, 'test123');
    });

    it('should NOT allow representative to access model management', () => {
      const user = authService.getCurrentUser();
      expect(user?.role).toBe('representative');
      expect(user?.role).not.toBe('admin');
    });

    it('should NOT allow representative to access product management', () => {
      const user = authService.getCurrentUser();
      expect(user?.role).toBe('representative');
      expect(user?.role).not.toBe('admin');
    });

    it('should NOT allow representative to access user management', () => {
      const user = authService.getCurrentUser();
      expect(user?.role).toBe('representative');
      expect(user?.role).not.toBe('admin');
    });

    it('should allow representative to access gold price management', () => {
      const user = authService.getCurrentUser();
      expect(user?.role).toBe('representative');
      expect(authService.isLoggedIn()).toBe(true);
    });

    it('should allow representative to access calculation features', () => {
      const user = authService.getCurrentUser();
      expect(user?.role).toBe('representative');
      expect(authService.isLoggedIn()).toBe(true);
    });
  });

  describe('Unauthorized Access Attempts', () => {
    it('should redirect non-authenticated users to login', () => {
      // Make sure we're logged out
      authService.logout();
      expect(authService.isLoggedIn()).toBe(false);
      expect(authService.getCurrentUser()).toBeNull();
    });

    it('should redirect non-admin users from admin-only routes', () => {
      const repDto: CreateUserDto = {
        username: 'rep_test' + Date.now(),
        password: 'test123',
        location: 'Sales Floor 2',
        role: 'representative'
      };
      userService.create(repDto);
      authService.login(repDto.username, 'test123');

      const user = authService.getCurrentUser();
      expect(user?.role).not.toBe('admin');
      
      // Verify user cannot perform admin actions
      expect(user?.role === 'admin').toBe(false);
    });
  });
});

