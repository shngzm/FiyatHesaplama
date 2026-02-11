import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivityLogService } from '../../services/activity-log.service';
import { ActivityLog, ActivityLogStatistics } from '../../models/activity-log.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-activity-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activity-report.component.html',
  styleUrl: './activity-report.component.scss'
})
export class ActivityReportComponent implements OnInit {
  logs: ActivityLog[] = [];
  statistics: ActivityLogStatistics | null = null;
  loading = false;
  
  // Filters
  startDate = '';
  endDate = '';
  selectedAction = '';
  
  actionOptions = [
    { value: '', label: 'Tümü' },
    { value: 'CREATE_CUSTOMER', label: 'Müşteri Oluştur' },
    { value: 'UPDATE_CUSTOMER', label: 'Müşteri Güncelle' },
    { value: 'DELETE_CUSTOMER', label: 'Müşteri Sil' },
    { value: 'CREATE_ORDER', label: 'Sipariş Oluştur' },
    { value: 'UPDATE_ORDER', label: 'Sipariş Güncelle' },
    { value: 'DELETE_ORDER', label: 'Sipariş Sil' },
    { value: 'CREATE_PRODUCT', label: 'Ürün Oluştur' },
    { value: 'UPDATE_PRODUCT', label: 'Ürün Güncelle' },
    { value: 'DELETE_PRODUCT', label: 'Ürün Sil' },
    { value: 'USER_LOGIN', label: 'Kullanıcı Girişi' }
  ];

  constructor(
    private activityLogService: ActivityLogService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadLogs();
    this.loadStatistics();
  }

  loadLogs(): void {
    this.loading = true;
    
    const filters: any = { limit: 100 };
    if (this.startDate) filters.startDate = this.startDate;
    if (this.endDate) filters.endDate = this.endDate;
    if (this.selectedAction) filters.action = this.selectedAction;
    
    this.activityLogService.getActivityLogs(filters).subscribe({
      next: (response) => {
        this.logs = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load logs:', error);
        this.notificationService.showError('Loglar yüklenemedi');
        this.loading = false;
      }
    });
  }

  loadStatistics(): void {
    const filters: any = {};
    if (this.startDate) filters.startDate = this.startDate;
    if (this.endDate) filters.endDate = this.endDate;
    
    this.activityLogService.getStatistics(filters).subscribe({
      next: (response) => {
        this.statistics = response.data;
      },
      error: (error) => {
        console.error('Failed to load statistics:', error);
      }
    });
  }

  applyFilters(): void {
    this.loadLogs();
    this.loadStatistics();
  }

  clearFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.selectedAction = '';
    this.applyFilters();
  }

  getActionLabel(action: string): string {
    const option = this.actionOptions.find(opt => opt.value === action);
    return option ? option.label : action;
  }

  formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleString('tr-TR');
  }

  getStatKeys(obj: Record<string, number>): string[] {
    return Object.keys(obj);
  }
}
