import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { GoldPriceService } from '../../../services/gold-price.service';
import { NotificationService } from '../../../services/notification.service';
import { GoldPrice } from '../../../models/gold-price.model';

@Component({
  selector: 'app-gold-price-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gold-price-management.component.html',
  styleUrl: './gold-price-management.component.scss'
})
export class GoldPriceManagementComponent implements OnInit {
  priceForm: FormGroup;
  currentPrice: GoldPrice | null = null;
  hasManualPrice: boolean = false;

  constructor(
    private fb: FormBuilder,
    private goldPriceService: GoldPriceService,
    private notificationService: NotificationService
  ) {
    this.priceForm = this.fb.group({
      buying: ['', [Validators.required, Validators.min(0)]],
      selling: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadCurrentPrice();
  }

  loadCurrentPrice(): void {
    this.goldPriceService.goldPrice$.subscribe(price => {
      this.currentPrice = price;
      if (price) {
        this.priceForm.patchValue({
          buying: price.buying,
          selling: price.selling
        });
      }
    });
    
    this.hasManualPrice = this.goldPriceService.hasManualPrice();
  }

  savePrice(): void {
    if (this.priceForm.invalid) {
      this.notificationService.error('Lütfen tüm alanları doldurun');
      return;
    }

    const { buying, selling } = this.priceForm.value;
    this.goldPriceService.setManualPrice(buying, selling);
    this.hasManualPrice = true;
    this.notificationService.success('Altın kuru manuel olarak ayarlandı');
  }

  clearManualPrice(): void {
    this.goldPriceService.clearManualPrice().subscribe({
      next: (price) => {
        this.hasManualPrice = false;
        this.notificationService.success('Manuel kur silindi, API kullanılıyor');
      },
      error: () => {
        this.notificationService.error('Kur silinemedi');
      }
    });
  }

  refreshFromApi(): void {
    this.goldPriceService.refreshGoldPrice().subscribe({
      next: (price) => {
        this.notificationService.success('API\'den kur güncellendi');
      },
      error: () => {
        this.notificationService.error('API\'den kur alınamadı');
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }
}
