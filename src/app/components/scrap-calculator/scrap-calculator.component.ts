import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Ayar } from '../../models/product.model';
import { GoldPriceService } from '../../services/gold-price.service';
import { NotificationService } from '../../services/notification.service';
import { GoldPrice } from '../../models/gold-price.model';

@Component({
  selector: 'app-scrap-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scrap-calculator.component.html',
  styleUrl: './scrap-calculator.component.scss'
})
export class ScrapCalculatorComponent implements OnInit, OnDestroy {
  private readonly STORAGE_KEY = 'elizi_goldtool_scrap_history';
  private readonly MAX_HISTORY = 5;
  
  goldPrice: GoldPrice | null = null;
  isLoadingPrice: boolean = false;
  isRealApiData: boolean = false;
  
  quickGram: number | null = null;
  quickAyar: Ayar = 14;
  productType: 'elizi' | 'diger' = 'elizi';
  quickScrapResult: {
    gram: number;
    ayar: Ayar;
    productType: 'elizi' | 'diger';
    katsayi: number;
    alisFiyat: number;
    toplamFiyat: number;
    timestamp: Date;
  } | null = null;
  
  calculationHistory: Array<{
    gram: number;
    ayar: Ayar;
    productType: 'elizi' | 'diger';
    katsayi: number;
    alisFiyat: number;
    toplamFiyat: number;
    timestamp: Date;
  }> = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private goldPriceService: GoldPriceService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.goldPriceService.goldPrice$
      .pipe(takeUntil(this.destroy$))
      .subscribe(price => {
        this.goldPrice = price;
      });

    this.loadGoldPrice();
    this.loadHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGoldPrice(): void {
    this.goldPriceService.getGoldPrice()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (price) => {
          this.goldPrice = price;
          this.isRealApiData = true;
        },
        error: (error) => {
          console.error('Altın kuru yüklenemedi:', error);
          this.isRealApiData = false;
        }
      });
  }

  refreshGoldPrice(): void {
    this.isLoadingPrice = true;
    this.goldPriceService.refreshGoldPrice()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (price) => {
          this.goldPrice = price;
          this.isLoadingPrice = false;
          this.isRealApiData = true;
          this.notificationService.success('Altın kuru güncellendi');
        },
        error: (error) => {
          this.isLoadingPrice = false;
          this.isRealApiData = false;
          this.notificationService.error('Altın kuru güncellenemedi');
        }
      });
  }

  calculateQuickScrap(): void {
    if (!this.quickGram || this.quickGram <= 0 || !this.goldPrice) {
      this.notificationService.error('Lütfen gram değeri girin ve altın kurunun yüklendiğinden emin olun');
      return;
    }

    const katsayi = this.getKatsayi();
    const toplamFiyat = this.quickGram * katsayi * this.goldPrice.buying;

    const result = {
      gram: this.quickGram,
      ayar: this.quickAyar,
      productType: this.productType,
      katsayi: katsayi,
      alisFiyat: this.goldPrice.buying,
      toplamFiyat: toplamFiyat,
      timestamp: new Date()
    };

    this.quickScrapResult = result;
    this.addToHistory(result);
    this.notificationService.success('Bozma fiyatı hesaplandı!');
  }

  reset(): void {
    this.quickGram = null;
    this.quickAyar = 14;
    this.productType = 'elizi';
    this.quickScrapResult = null;
  }

  getKatsayi(): number {
    if (this.productType === 'elizi') {
      return this.quickAyar === 14 ? 0.585 : 0.916;
    } else {
      return this.quickAyar === 14 ? 0.575 : 0.912;
    }
  }

  getKatsayiText(): string {
    const katsayi = this.getKatsayi();
    const type = this.productType === 'elizi' ? 'Elizi' : 'Diğer';
    return `${type} - ${this.quickAyar} ayar (${katsayi})`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }

  getCacheStatus(): string {
    if (!this.goldPrice) return '';
    
    const isCacheValid = this.goldPriceService.isCacheValid();
    const ageMinutes = this.goldPriceService.getCacheAgeMinutes();
    
    if (isCacheValid) {
      return `${ageMinutes} dakika önce güncellendi`;
    }
    return 'Güncelleme gerekli';
  }

  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        this.calculationHistory = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
    } catch (error) {
      console.error('History yüklenemedi:', error);
      this.calculationHistory = [];
    }
  }

  private addToHistory(result: typeof this.quickScrapResult): void {
    if (!result) return;
    
    // Add to beginning of array
    this.calculationHistory.unshift(result);
    
    // Keep only last MAX_HISTORY items
    if (this.calculationHistory.length > this.MAX_HISTORY) {
      this.calculationHistory = this.calculationHistory.slice(0, this.MAX_HISTORY);
    }
    
    // Save to localStorage
    this.saveHistory();
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.calculationHistory));
    } catch (error) {
      console.error('History kaydedilemedi:', error);
    }
  }

  clearHistory(): void {
    this.calculationHistory = [];
    localStorage.removeItem(this.STORAGE_KEY);
    this.notificationService.success('Hesaplama geçmişi temizlendi');
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} saat önce`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return new Date(date).toLocaleDateString('tr-TR');
  }
}
