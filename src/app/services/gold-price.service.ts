import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom, of } from 'rxjs';
import { GoldPrice } from '../models/gold-price.model';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoldPriceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/gold-price`;
  
  private goldPriceSubject = new BehaviorSubject<GoldPrice | null>(null);
  public goldPrice$: Observable<GoldPrice | null> = this.goldPriceSubject.asObservable();

  constructor() {
    this.loadGoldPrice();
  }

  private async loadGoldPrice(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<GoldPrice>>(this.apiUrl)
      );
      
      if (response.success && response.data) {
        const price: GoldPrice = {
          ...response.data,
          timestamp: new Date(response.data.timestamp)
        };
        this.goldPriceSubject.next(price);
      }
    } catch (error) {
      console.error('Failed to load gold price:', error);
      // Set default price on error
      this.goldPriceSubject.next({
        currency: 'TRY',
        buying: 7000,
        selling: 7000,
        timestamp: new Date()
      });
    }
  }

  getGoldPrice(): Observable<GoldPrice | null> {
    return this.goldPrice$;
  }

  async updateGoldPrice(buying: number, selling: number, currency: string = 'TRY'): Promise<GoldPrice> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<GoldPrice>>(this.apiUrl, { buying, selling, currency })
      );
      
      if (response.success && response.data) {
        const price: GoldPrice = {
          ...response.data,
          timestamp: new Date(response.data.timestamp)
        };
        this.goldPriceSubject.next(price);
        return price;
      } else {
        throw new Error(response.message || 'Altın fiyatı güncellenemedi');
      }
    } catch (error: any) {
      console.error('Failed to update gold price:', error);
      throw error;
    }
  }

  async getHistory(limit: number = 10): Promise<GoldPrice[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<GoldPrice[]>>(`${this.apiUrl}/history?limit=${limit}`)
      );
      
      if (response.success && response.data) {
        return response.data.map(p => ({
          ...p,
          timestamp: new Date(p.timestamp)
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to load gold price history:', error);
      return [];
    }
  }

  getCurrentPrice(): GoldPrice | null {
    return this.goldPriceSubject.value;
  }

  // Helper methods for components
  hasManualPrice(): boolean {
    return this.goldPriceSubject.value !== null;
  }

  setManualPrice(buying: number, selling: number): void {
    this.updateGoldPrice(buying, selling);
  }

  clearManualPrice(): Observable<GoldPrice> {
    // Reload from server
    this.loadGoldPrice();
    return this.goldPrice$ as Observable<GoldPrice>;
  }

  refreshGoldPrice(): Observable<GoldPrice> {
    this.loadGoldPrice();
    return this.goldPrice$ as Observable<GoldPrice>;
  }

  isCacheValid(): boolean {
    const current = this.goldPriceSubject.value;
    if (!current || !current.timestamp) return false;
    
    const ageMinutes = this.getCacheAgeMinutes();
    return ageMinutes < 60; // Valid for 1 hour
  }

  getCacheAgeMinutes(): number {
    const current = this.goldPriceSubject.value;
    if (!current || !current.timestamp) return Infinity;
    
    const now = new Date();
    const diff = now.getTime() - new Date(current.timestamp).getTime();
    return Math.floor(diff / 60000);
  }

  calculatePrice(weight: number, ayar: number, basePrice: number): {
    price: number;
    goldPrice: { buying: number; selling: number };
  } {
    const current = this.goldPriceSubject.value;
    if (!current) {
      throw new Error('Altın fiyatı yüklenemedi');
    }

    const ayarKatsayisi = ayar / 24;
    const price = weight * ayarKatsayisi * basePrice;

    return {
      price,
      goldPrice: {
        buying: current.buying,
        selling: current.selling
      }
    };
  }
}
