import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { GoldPrice } from '../../models/gold-price.model';
import { GoldPriceService } from '../../services/gold-price.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-gram-price-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gram-price-calculator.component.html',
  styleUrl: './gram-price-calculator.component.scss'
})
export class GramPriceCalculatorComponent implements OnInit, OnDestroy {
  priceForm: FormGroup;
  ayarOptions = [
    { value: 8, label: '8 Ayar' },
    { value: 10, label: '10 Ayar' },
    { value: 14, label: '14 Ayar' },
    { value: 18, label: '18 Ayar' },
    { value: 21, label: '21 Ayar' },
    { value: 22, label: '22 Ayar' }
  ];
  
  goldPrice: GoldPrice | null = null;
  isLoadingPrice: boolean = false;
  isRealApiData: boolean = false;
  totalPrice: number | null = null;
  pricePerGram: number | null = null;
  
  // Calculated values (stored separately)
  calculatedAyar: number | null = null;
  calculatedGram: number | null = null;
  calculatedAyarRatio: number | null = null;
  calculatedGoldPrice: number | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private goldPriceService: GoldPriceService,
    private notificationService: NotificationService
  ) {
    this.priceForm = this.fb.group({
      ayar: ['', Validators.required],
      gram: ['', [Validators.required, Validators.min(0.01), Validators.max(10000)]]
    });
  }

  ngOnInit(): void {
    this.loadGoldPrice();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGoldPrice(): void {
    this.isLoadingPrice = true;
    
    this.goldPriceService.getGoldPrice()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (price) => {
          this.goldPrice = price;
          this.isRealApiData = false; // Currently using demo data
          this.isLoadingPrice = false;
          console.log('Gold price loaded:', price);
        },
        error: (error) => {
          console.error('Error loading gold price:', error);
          this.isLoadingPrice = false;
          this.notificationService.error('Altın fiyatı yüklenirken hata oluştu');
        }
      });
  }

  calculate(): void {
    if (this.priceForm.invalid) {
      this.notificationService.error('Lütfen tüm alanları doldurun');
      return;
    }

    if (!this.goldPrice) {
      this.notificationService.error('Altın fiyatı yüklenemedi');
      return;
    }

    const ayar = parseInt(this.priceForm.value.ayar);
    const gram = parseFloat(this.priceForm.value.gram);

    console.log('Calculating price for:', { ayar, gram });

    // Ayar oranları (sabit değerler)
    const ayarRatios: { [key: number]: number } = {
      8: 0.333,
      10: 0.417,
      14: 0.585,
      18: 0.750,
      21: 0.875,
      22: 0.916
    };

    const ayarRatio = ayarRatios[ayar] || (ayar / 24);
    
    // Store calculated values
    this.calculatedAyar = ayar;
    this.calculatedGram = gram;
    this.calculatedAyarRatio = ayarRatio;
    this.calculatedGoldPrice = this.goldPrice.selling;
    
    // Gram başına fiyat
    this.pricePerGram = this.goldPrice.selling * ayarRatio;
    
    // Toplam fiyat
    this.totalPrice = this.pricePerGram * gram;

    console.log('Calculation result:', {
      ayar,
      ayarRatio,
      pricePerGram: this.pricePerGram,
      totalPrice: this.totalPrice
    });
  }

  reset(): void {
    this.priceForm.reset();
    this.totalPrice = null;
    this.pricePerGram = null;
    this.calculatedAyar = null;
    this.calculatedGram = null;
    this.calculatedAyarRatio = null;
    this.calculatedGoldPrice = null;
  }

  refreshGoldPrice(): void {
    this.loadGoldPrice();
  }

  getAyarRatio(): number {
    const ayar = parseInt(this.priceForm.value.ayar);
    const ayarRatios: { [key: number]: number } = {
      8: 0.333,
      10: 0.417,
      14: 0.585,
      18: 0.750,
      21: 0.875,
      22: 0.916
    };
    return ayarRatios[ayar] || (ayar / 24);
  }
}
