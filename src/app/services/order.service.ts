import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order, CreateOrderInput, UpdateOrderInput, OrderStatistics } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  /**
   * Get all orders with optional filters
   */
  getOrders(filters?: {
    customerId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<{ success: boolean; data: Order[]; count: number }> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.customerId) params = params.set('customerId', filters.customerId);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
    }

    return this.http.get<{ success: boolean; data: Order[]; count: number }>(
      this.apiUrl,
      { params }
    );
  }

  /**
   * Get order by ID
   */
  getOrderById(id: string): Observable<{ success: boolean; data: Order }> {
    return this.http.get<{ success: boolean; data: Order }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get orders by customer ID
   */
  getOrdersByCustomer(customerId: string): Observable<{
    success: boolean;
    data: Order[];
    count: number;
    customer: { id: string; name: string };
  }> {
    return this.http.get<{
      success: boolean;
      data: Order[];
      count: number;
      customer: { id: string; name: string };
    }>(`${this.apiUrl}/customer/${customerId}`);
  }

  /**
   * Create a new order
   */
  createOrder(order: CreateOrderInput): Observable<{ success: boolean; data: Order }> {
    return this.http.post<{ success: boolean; data: Order }>(this.apiUrl, order);
  }

  /**
   * Update order
   */
  updateOrder(id: string, updates: UpdateOrderInput): Observable<{ success: boolean; data: Order }> {
    return this.http.put<{ success: boolean; data: Order }>(`${this.apiUrl}/${id}`, updates);
  }

  /**
   * Delete order
   */
  deleteOrder(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get order statistics
   */
  getStatistics(filters?: {
    startDate?: string;
    endDate?: string;
    customerId?: string;
  }): Observable<{ success: boolean; data: OrderStatistics }> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
      if (filters.customerId) params = params.set('customerId', filters.customerId);
    }

    return this.http.get<{ success: boolean; data: OrderStatistics }>(
      `${this.apiUrl}/statistics`,
      { params }
    );
  }

  /**
   * Format order number for display
   */
  formatOrderNumber(orderNumber: string): string {
    return orderNumber;
  }

  /**
   * Calculate total from subtotal and discount
   */
  calculateTotal(subtotal: number, discount: number = 0): number {
    return Math.max(0, subtotal - discount);
  }
}
