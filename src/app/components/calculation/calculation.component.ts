import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { CalculationService } from '../../services/calculation.service';
import { GoldPriceService } from '../../services/gold-price.service';
import { NotificationService } from '../../services/notification.service';
import { CustomerService } from '../../services/customer.service';
import { OrderService } from '../../services/order.service';
import { GoldPrice } from '../../models/gold-price.model';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-calculation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './calculation.component.html',
  styleUrl: './calculation.component.scss'
})

export class CalculationComponent implements OnInit, OnDestroy {
  calculationForm: FormGroup;
  productTypes = ['Kolye/Bilezik', 'Yüzük', 'Küpe'];
  subTypeOptions: { value: string; label: string }[] = [];
  models: any[] = [];
  ayars: number[] = [];
  siras: number[] = [];
  goldPrice: GoldPrice | null = null;
  result: any = null;
  isLoadingPrice = false;
  isSavingOrder = false;
  customers: Customer[] = [];
  customerControl = this.fb.control('', Validators.required);
  showOrderModal = false;
  history: any[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private calculationService: CalculationService,
    private goldPriceService: GoldPriceService,
    private notificationService: NotificationService,
    private customerService: CustomerService,
    private orderService: OrderService
  ) {
    this.calculationForm = this.fb.group({
      productType: ['Kolye/Bilezik', Validators.required],
      subType: ['', Validators.required],
      modelId: ['', Validators.required],
      ayar: ['', Validators.required],
      sira: ['', Validators.required],
      uzunluk: ['']
    });
  }

  ngOnInit(): void {
    this.loadGoldPrice();
    this.loadCustomers();
    this.onProductTypeChange();
    this.calculationForm.get('productType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.onProductTypeChange());
    this.calculationForm.get('modelId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.onModelChange());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isKolyeBilezik(): boolean {
    return this.calculationForm.get('productType')?.value === 'Kolye/Bilezik';
  }
  get isYuzukKupe(): boolean {
    const t = this.calculationForm.get('productType')?.value;
    return t === 'Yüzük' || t === 'Küpe';
  }
  get canCalculate(): boolean {
    if (!this.calculationForm.valid) return false;
    if (this.isKolyeBilezik && (!this.calculationForm.get('uzunluk')?.value || this.calculationForm.get('uzunluk')?.value <= 0)) return false;
    return true;
  }

  onProductTypeChange(): void {
    const type = this.calculationForm.get('productType')?.value;
    // Subtype options (dummy for now)
    this.subTypeOptions = [
      { value: 'standart', label: 'Standart' }
    ];
    // Models
    this.models = this.productService.getProductsByType(type);
    this.ayars = [];
    this.siras = [];
    this.calculationForm.patchValue({ modelId: '', ayar: '', sira: '', uzunluk: '' });
  }

  onModelChange(): void {
    const modelId = this.calculationForm.get('modelId')?.value;
    const model = this.models.find(m => m.id === modelId);
    this.ayars = model?.ayars || [];
    this.siras = model?.siras || [];
    this.calculationForm.patchValue({ ayar: '', sira: '' });
  }

  loadGoldPrice(): void {
    this.goldPriceService.goldPrice$
      .pipe(takeUntil(this.destroy$))
      .subscribe(price => this.goldPrice = price);
    this.goldPriceService.getGoldPrice().subscribe();
  }

  loadCustomers(): void {
    this.customerService.getCustomers().pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res.success) this.customers = res.data;
    });
  }

  calculate(): void {
    if (!this.canCalculate) {
      this.notificationService.showError('Lütfen tüm alanları doldurun');
      return;
    }
    this.isLoadingPrice = true;
    const input = {
      productType: this.calculationForm.get('productType')?.value,
      modelId: this.calculationForm.get('modelId')?.value,
      ayar: this.calculationForm.get('ayar')?.value,
      sira: this.calculationForm.get('sira')?.value,
      uzunluk: this.isKolyeBilezik ? this.calculationForm.get('uzunluk')?.value : undefined
    };
    this.calculationService.calculateWithPrice(input).subscribe({
      next: (res) => {
        this.result = res;
        this.isLoadingPrice = false;
      },
      error: (err) => {
        this.notificationService.showError(err.message || 'Hesaplama hatası');
        this.isLoadingPrice = false;
      }
    });
  }

  reset(): void {
    this.calculationForm.reset({ productType: 'Kolye/Bilezik', subType: '', modelId: '', ayar: '', sira: '', uzunluk: '' });
    this.result = null;
  }

  openOrderModal(): void {
    if (!this.result) {
      this.notificationService.showError('Önce hesaplama yapın');
      return;
    }
    this.showOrderModal = true;
  }

  closeOrderModal(): void {
    this.showOrderModal = false;
    this.customerControl.reset();
  }

  saveAsOrder(): void {
    if (!this.customerControl.value || !this.result) {
      this.notificationService.showError('Lütfen müşteri seçin');
      return;
    }
    this.isSavingOrder = true;
    const orderData = {
      customerId: this.customerControl.value,
      calculationIds: [],
      note: `${this.calculationForm.get('productType')?.value} - ${this.calculationForm.get('modelId')?.value} - ${this.calculationForm.get('ayar')?.value}K - ${this.result.fiyat} TL`,
      subtotal: this.result.fiyat,
      total: this.result.fiyat,
      status: 'bekliyor',
      productType: this.calculationForm.get('productType')?.value,
      modelName: this.models.find(m => m.id === this.calculationForm.get('modelId')?.value)?.modelTipi || '',
      purity: this.calculationForm.get('ayar')?.value,
      calculationDetails: this.result,
      goldPrice: this.goldPrice?.selling || 0
    };
    this.orderService.createOrder(orderData).subscribe({
      next: () => {
        this.notificationService.showSuccess('Sipariş oluşturuldu');
        this.closeOrderModal();
        this.result = null;
        this.customerControl.reset();
        this.isSavingOrder = false;
      },
      error: () => {
        this.notificationService.showError('Sipariş oluşturulamadı');
        this.isSavingOrder = false;
      }
    });
  }

  formatPrice(val: number): string {
    return val ? val.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }) : '₺0,00';
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR') + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }
}
