import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  public notifications$ = this.notificationSubject.asObservable();

  success(message: string, duration: number = 3000): void {
    this.show('success', message, duration);
  }

  // Alias for success
  showSuccess(message: string, duration: number = 3000): void {
    this.success(message, duration);
  }

  error(message: string, duration: number = 5000): void {
    this.show('error', message, duration);
  }

  // Alias for error
  showError(message: string, duration: number = 5000): void {
    this.error(message, duration);
  }

  warning(message: string, duration: number = 4000): void {
    this.show('warning', message, duration);
  }

  info(message: string, duration: number = 3000): void {
    this.show('info', message, duration);
  }

  private show(type: NotificationType, message: string, duration: number): void {
    const notification: Notification = {
      id: this.generateId(),
      type,
      message,
      duration
    };
    this.notificationSubject.next(notification);
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
