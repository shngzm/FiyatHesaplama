import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { User, CreateUserDto, UserRole } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit, OnDestroy {
  userForm: FormGroup;
  users: User[] = [];
  roleOptions: UserRole[] = ['admin', 'manager', 'representative'];
  locationOptions: string[] = ['İstanbul', 'Ankara', 'Trabzon'];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      location: ['', Validators.required],
      role: ['representative', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userService.users$
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => this.users = users);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.notificationService.error('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      const dto: CreateUserDto = this.userForm.value;
      this.userService.create(dto);
      this.notificationService.success('Kullanıcı başarıyla eklendi');
      this.userForm.reset({ role: 'representative' });
    } catch (error: any) {
      this.notificationService.error(error.message || 'Kullanıcı eklenemedi');
    }
  }

  deleteUser(user: User): void {
    const message = `"${user.username}" kullanıcısını silmek istediğinizden emin misiniz?`;

    if (confirm(message)) {
      try {
        this.userService.delete(user.id);
        this.notificationService.success('Kullanıcı başarıyla silindi');
      } catch (error: any) {
        this.notificationService.error(error.message || 'Kullanıcı silinemedi');
      }
    }
  }

  getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      admin: 'Yönetici',
      manager: 'Mağaza Müdürü',
      representative: 'Satış Temsilcisi'
    };
    return labels[role];
  }
}
