import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Model } from '../../models/model.model';
import { CalculationHistory, CalculationResult } from '../../models/calculation.model';
import { ModelService } from '../../services/model.service';
import { ProductService } from '../../services/product.service';
import { CalculationService } from '../../services/calculation.service';
import { GoldPriceService } from '../../services/gold-price.service';
import { NotificationService } from '../../services/notification.service';
import { GoldPrice } from '../../models/gold-price.model';

@Component({
  selector: 'app-calculation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './calculation.component.html',
  styleUrl: './calculation.component.scss'
})
export class CalculationComponent implements OnInit, OnDestroy {
  calculationForm: FormGroup;
  models: Model[] = [];
  ayars: number[] = [];
  siras: number[] = [];
  result: CalculationResult | null = null;
  history: CalculationHistory[] = [];
  showBreakdown: boolean = false;
  goldPrice: GoldPrice | null = null;
  isLoadingPrice: boolean = false;
  isRealApiData: boolean = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private modelService: ModelService,
    private productService: ProductService,
    private calculationService: CalculationService,
    private goldPriceService: GoldPriceService,
    private notificationService: NotificationService
  ) {
    this.calculationForm = this.fb.group({
      modelId: ['', Validators.required],
      ayar: ['', Validators.required],
      sira: ['', Validators.required],
      uzunluk: ['', [Validators.required, Validators.min(0.01), Validators.max(1000)]]
    });
  }

  ngOnInit(): void {
    this.modelService.models$
      .pipe(takeUntil(this.destroy$))
      .subscribe(models => {
        this.models = models;
      });

    this.calculationService.history$
      .pipe(takeUntil(this.destroy$))
      .subscribe(history => {
        this.history = history;
      });

    this.goldPriceService.goldPrice$
      .pipe(takeUntil(this.destroy$))
      .subscribe(price => {
        this.goldPrice = price;
      });

    this.loadGoldPrice();

    this.calculationForm.get('modelId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(modelId => {
        this.onModelChange(modelId);
      });

    this.calculationForm.get('ayar')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(ayar => {
        this.onAyarChange(ayar);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onModelChange(modelId: string): void {
    console.log('Model changed to:', modelId);
    if (!modelId) {
      this.ayars = [];
      this.siras = [];
      this.calculationForm.patchValue({ ayar: '', sira: '' });
      return;
    }

    this.ayars = this.productService.getAyarsForModel(modelId);
    console.log('Available ayars:', this.ayars);
    this.siras = [];
    this.calculationForm.patchValue({ ayar: '', sira: '' });

    if (this.ayars.length === 1) {
      this.calculationForm.patchValue({ ayar: this.ayars[0] });
    }
  }

  onAyarChange(ayar: number | null): void {
    const modelId = this.calculationForm.get('modelId')?.value;
    console.log('Ayar changed to:', ayar, 'for model:', modelId);
    
    if (!modelId || !ayar) {
      this.siras = [];
      this.calculationForm.patchValue({ sira: '' });
      return;
    }

    // Convert ayar to number if it's a string
    const ayarNumber = typeof ayar === 'string' ? parseInt(ayar, 10) : ayar;
    this.siras = this.productService.getSirasForModelAndAyar(modelId, ayarNumber);
    console.log('Available siras:', this.siras);
    this.calculationForm.patchValue({ sira: '' });

    if (this.siras.length === 1) {
      this.calculationForm.patchValue({ sira: this.siras[0] });
    }
  }

  calculate(): void {
    if (this.calculationForm.invalid) {
      this.notificationService.error('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      const input = this.calculationForm.value;
      // Convert string values to numbers
      const calculationInput = {
        modelId: input.modelId,
        ayar: typeof input.ayar === 'string' ? parseInt(input.ayar, 10) : input.ayar,
        sira: typeof input.sira === 'string' ? parseInt(input.sira, 10) : input.sira,
        uzunluk: typeof input.uzunluk === 'string' ? parseFloat(input.uzunluk) : input.uzunluk
      };
      console.log('Calculation input:', calculationInput);
      this.isLoadingPrice = true;
      
      this.calculationService.calculateWithPrice(calculationInput)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.result = result;
            this.isLoadingPrice = false;
            
            if (result.fiyat) {
              this.notificationService.success('Gram ve fiyat hesaplama başarılı!');
            } else {
              this.notificationService.success('Gram hesaplama başarılı! (Fiyat hesaplanamadı)');
            }
          },
          error: (error) => {
            this.isLoadingPrice = false;
            this.notificationService.error(error.message || 'Hesaplama hatası');
            this.result = null;
          }
        });
    } catch (error: any) {
      this.isLoadingPrice = false;
      this.notificationService.error(error.message || 'Hesaplama hatası');
      this.result = null;
    }
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

  reset(): void {
    this.calculationForm.reset();
    this.result = null;
    this.showBreakdown = false;
    this.ayars = [];
    this.siras = [];
  }

  toggleBreakdown(): void {
    this.showBreakdown = !this.showBreakdown;
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

  getCacheStatus(): string {
    if (!this.goldPrice) return '';
    
    const isCacheValid = this.goldPriceService.isCacheValid();
    const ageMinutes = this.goldPriceService.getCacheAgeMinutes();
    
    if (isCacheValid) {
      return `${ageMinutes} dakika önce güncellendi`;
    }
    return 'Güncelleme gerekli';
  }

  get canCalculate(): boolean {
    return this.calculationForm.valid;
  }
}
