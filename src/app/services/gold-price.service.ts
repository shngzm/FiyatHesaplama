import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { GoldPrice, GoldPriceApiResponse } from '../models/gold-price.model';

@Injectable({
  providedIn: 'root'
})
export class GoldPriceService {
  private readonly API_URL = 'https://finans.truncgil.com/v4/today.json';
  private readonly CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes
  private readonly STORAGE_KEY = 'elizi_goldtool_manual_gold_price';

  private goldPriceSubject = new BehaviorSubject<GoldPrice | null>(null);
  public goldPrice$ = this.goldPriceSubject.asObservable();

  private lastFetchTime: number = 0;
  private isFetching = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadManualPrice();
  }

  /**
   * Get current gold price
   * Prioritizes manual price, then cache, then API
   */
  getGoldPrice(): Observable<GoldPrice> {
    // Check for manual price first
    const manualPrice = this.getManualPrice();
    if (manualPrice) {
      this.goldPriceSubject.next(manualPrice);
      this.lastFetchTime = Date.now();
      return of(manualPrice);
    }

    const now = Date.now();
    const cachedPrice = this.goldPriceSubject.value;

    // Return cached data if valid
    if (cachedPrice && (now - this.lastFetchTime) < this.CACHE_DURATION_MS) {
      return of(cachedPrice);
    }

    // Prevent multiple simultaneous requests
    if (this.isFetching) {
      return this.goldPrice$.pipe(
        map(price => {
          if (!price) {
            throw new Error('Altın kuru henüz yüklenmedi');
          }
          return price;
        })
      );
    }

    // Fetch fresh data
    this.isFetching = true;
    return this.fetchGoldPrice();
  }

  /**
   * Fetch gold price from API
   */
  private fetchGoldPrice(): Observable<GoldPrice> {
    return this.http.get<GoldPriceApiResponse>(this.API_URL).pipe(
      map(response => this.parseApiResponse(response)),
      tap(goldPrice => {
        this.goldPriceSubject.next(goldPrice);
        this.lastFetchTime = Date.now();
        this.isFetching = false;
      }),
      catchError((error: HttpErrorResponse) => {
        this.isFetching = false;
        console.warn('Altın kuru API\'si çalışmıyor, mock data kullanılıyor:', error.message);
        
        // Return cached data if available
        const cachedPrice = this.goldPriceSubject.value;
        if (cachedPrice) {
          console.warn('Cache\'lenmiş altın kuru kullanılıyor');
          return of(cachedPrice);
        }
        
        // Use mock data as fallback
        const mockPrice = this.getMockGoldPrice();
        this.goldPriceSubject.next(mockPrice);
        this.lastFetchTime = Date.now();
        return of(mockPrice);
      })
    );
  }

  /**
   * Get mock gold price data (fallback when API is unavailable)
   */
  private getMockGoldPrice(): GoldPrice {
    return {
      currency: 'TRY',
      buying: 7090.98,
      selling: 7091.83,
      timestamp: new Date()
    };
  }

  /**
   * Parse API response to GoldPrice object
   */
  private parseApiResponse(response: any): GoldPrice {
    // finans.truncgil.com API format: GRA field for gram gold
    if (response.GRA) {
      return {
        currency: 'TRY',
        buying: response.GRA.Buying || 0,
        selling: response.GRA.Selling || 0,
        timestamp: new Date()
      };
    }
    // Old Genel Para API format (fallback)
    else if (response.GA) {
      const buying = this.parsePrice(response.GA.Alış);
      const selling = this.parsePrice(response.GA.Satış);
      
      return {
        currency: 'TRY',
        buying,
        selling,
        timestamp: new Date()
      };
    } 
    // Alternative TCMB format
    else if (response.data) {
      return {
        currency: 'TRY',
        buying: response.data.buying || 0,
        selling: response.data.selling || 0,
        timestamp: new Date()
      };
    }
    
    throw new Error('Geçersiz API yanıtı');
  }

  /**
   * Parse price string to number
   * Handles Turkish number format (e.g., "2.850,50" -> 2850.50)
   */
  private parsePrice(priceStr: string | undefined): number {
    if (!priceStr) return 0;
    
    // Remove thousand separators and replace comma with dot
    const normalized = priceStr
      .replace(/\./g, '')  // Remove dots (thousand separator)
      .replace(',', '.');  // Replace comma with dot (decimal separator)
    
    return parseFloat(normalized) || 0;
  }

  /**
   * Calculate price for given weight, carat, and labor cost (işçilik)
   * Formula: (ayar_katsayısı + işçilik_milyem) × gram × altın_satış_fiyatı
   * @param weightInGrams Weight in grams
   * @param carat Carat (8, 10, 14, 18, 21, or 22)
   * @param iscilikMilyem Labor cost in milyem (e.g., 250)
   * @returns Price in TL
   */
  calculatePrice(
    weightInGrams: number, 
    carat: 8 | 10 | 14 | 18 | 21 | 22, 
    iscilikMilyem: number = 0
  ): Observable<{
    price: number;
    goldPrice: GoldPrice;
  }> {
    return this.getGoldPrice().pipe(
      map(goldPrice => {
        // Use selling price for calculations
        const pricePerGram = goldPrice.selling;
        
        // Ayar katsayıları
        const ayarKatsayisiMap: { [key: number]: number } = {
          8: 0.333,
          10: 0.417,
          14: 0.585,
          18: 0.750,
          21: 0.875,
          22: 0.916
        };
        
        const ayarKatsayisi = ayarKatsayisiMap[carat] || (carat / 24);
        
        // İşçilik milyemi ondalık sayıya çevir (250 milyem = 0.250)
        const iscilikKatsayisi = iscilikMilyem / 1000;
        
        // Final price calculation: (ayar + işçilik) × gram × fiyat
        const totalKatsayi = ayarKatsayisi + iscilikKatsayisi;
        const price = weightInGrams * pricePerGram * totalKatsayi;
        
        return {
          price: Math.round(price * 100) / 100, // Round to 2 decimals
          goldPrice
        };
      })
    );
  }

  /**
   * Force refresh gold price (bypass cache)
   */
  refreshGoldPrice(): Observable<GoldPrice> {
    this.lastFetchTime = 0;
    return this.getGoldPrice();
  }

  /**
   * Check if cached data is still valid
   */
  isCacheValid(): boolean {
    const now = Date.now();
    return (now - this.lastFetchTime) < this.CACHE_DURATION_MS;
  }

  /**
   * Get cache age in minutes
   */
  getCacheAgeMinutes(): number {
    const now = Date.now();
    return Math.floor((now - this.lastFetchTime) / (60 * 1000));
  }

  /**
   * Set manual gold price (overrides API)
   */
  setManualPrice(buying: number, selling: number): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const manualPrice: GoldPrice = {
      currency: 'TRY',
      buying,
      selling,
      timestamp: new Date()
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(manualPrice));
    this.goldPriceSubject.next(manualPrice);
    this.lastFetchTime = Date.now();
  }

  /**
   * Get manual price from localStorage
   */
  getManualPrice(): GoldPrice | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;

    try {
      const price = JSON.parse(stored);
      return {
        ...price,
        timestamp: new Date(price.timestamp)
      };
    } catch {
      return null;
    }
  }

  /**
   * Clear manual price (return to API mode)
   */
  clearManualPrice(): Observable<GoldPrice> {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.lastFetchTime = 0;
    return this.getGoldPrice();
  }

  /**
   * Check if manual price is set
   */
  hasManualPrice(): boolean {
    return this.getManualPrice() !== null;
  }

  /**
   * Load manual price on init
   */
  private loadManualPrice(): void {
    const manualPrice = this.getManualPrice();
    if (manualPrice) {
      this.goldPriceSubject.next(manualPrice);
      this.lastFetchTime = Date.now();
    }
  }
}
