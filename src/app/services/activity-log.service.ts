import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ActivityLog, ActivityLogStatistics } from '../models/activity-log.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  private readonly API_URL = `${environment.apiUrl}/activity-logs`;

  constructor(private http: HttpClient) {}

  getActivityLogs(filters?: {
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Observable<{ success: boolean; data: ActivityLog[]; count: number }> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.userId) params = params.set('userId', filters.userId);
      if (filters.action) params = params.set('action', filters.action);
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }
    
    return this.http.get<{ success: boolean; data: ActivityLog[]; count: number }>(this.API_URL, { params });
  }

  getStatistics(filters?: {
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<{ success: boolean; data: ActivityLogStatistics }> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.userId) params = params.set('userId', filters.userId);
      if (filters.action) params = params.set('action', filters.action);
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
    }
    
    return this.http.get<{ success: boolean; data: ActivityLogStatistics }>(`${this.API_URL}/statistics`, { params });
  }
}
