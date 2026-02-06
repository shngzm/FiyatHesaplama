import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { adminGuard } from './admin.guard';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('adminGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'getCurrentUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/admin/models' } as RouterStateSnapshot;
  });

  it('should allow access for admin users', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.getCurrentUser.and.returnValue({
      id: '1',
      username: 'admin',
      password: 'admin123',
      location: 'Merkez',
      role: 'admin',
      createdAt: new Date()
    });

    const result = TestBed.runInInjectionContext(() => 
      adminGuard(mockRoute, mockState)
    );

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should block access for manager users and redirect to home', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.getCurrentUser.and.returnValue({
      id: '2',
      username: 'manager1',
      password: 'pass123',
      location: 'Mağaza 1',
      role: 'manager',
      createdAt: new Date()
    });

    const result = TestBed.runInInjectionContext(() => 
      adminGuard(mockRoute, mockState)
    );

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should block access for representative users and redirect to home', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.getCurrentUser.and.returnValue({
      id: '3',
      username: 'sales1',
      password: 'pass123',
      location: 'Mağaza 2',
      role: 'representative',
      createdAt: new Date()
    });

    const result = TestBed.runInInjectionContext(() => 
      adminGuard(mockRoute, mockState)
    );

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should block access for non-authenticated users and redirect to login', () => {
    authService.isLoggedIn.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => 
      adminGuard(mockRoute, mockState)
    );

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/admin/login']);
  });

  it('should block access when getCurrentUser returns null', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.getCurrentUser.and.returnValue(null);

    const result = TestBed.runInInjectionContext(() => 
      adminGuard(mockRoute, mockState)
    );

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
