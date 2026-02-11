import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Customer, CreateCustomerInput, UpdateCustomerInput } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) {}

  /**
   * Get all customers
   * @param search Optional search term
   */
  getCustomers(search?: string): Observable<{ success: boolean; data: Customer[]; count: number }> {
    let params: any = {};
    if (search) {
      params.search = search;
    }
    return this.http.get<{ success: boolean; data: Customer[]; count: number }>(
      this.apiUrl,
      search ? { params } : {}
    );
  }

  /**
   * Get customer by ID
   */
  getCustomerById(id: string): Observable<{ success: boolean; data: Customer }> {
    return this.http.get<{ success: boolean; data: Customer }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new customer
   */
  createCustomer(customer: CreateCustomerInput): Observable<{ success: boolean; data: Customer }> {
    return this.http.post<{ success: boolean; data: Customer }>(this.apiUrl, customer);
  }

  /**
   * Update customer
   */
  updateCustomer(id: string, updates: UpdateCustomerInput): Observable<{ success: boolean; data: Customer }> {
    return this.http.put<{ success: boolean; data: Customer }>(`${this.apiUrl}/${id}`, updates);
  }

  /**
   * Delete customer
   */
  deleteCustomer(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Format customer name
   */
  getCustomerFullName(customer: Customer | { firstName: string; lastName: string }): string {
    return `${customer.firstName} ${customer.lastName}`;
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as (5XX) XXX XX XX
    if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8)}`;
    }
    
    return phone;
  }
}
