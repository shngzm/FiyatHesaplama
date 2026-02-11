import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Model } from '../../models/model.model';
import { ProductWithModel, CreateProductDto, Ayar, ProductType } from '../../models/product.model';
import { ModelService } from '../../services/model.service';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.scss'
})
export class ProductManagementComponent implements OnInit, OnDestroy {
  productForm: FormGroup;
  models: Model[] = [];
  products: ProductWithModel[] = [];
  ayarOptions: Ayar[] = [8, 10, 14, 18, 21, 22];
  siraOptions: number[] = [];
  productTypeOptions: { value: ProductType; label: string }[] = [
    { value: 'kolye-bilezik', label: 'Kolye/Bilezik' },
    { value: 'yuzuk', label: 'Yüzük' },
    { value: 'kupe', label: 'Küpe' }
  ];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private modelService: ModelService,
    private productService: ProductService,
    private notificationService: NotificationService
  ) {
    this.productForm = this.fb.group({
      productType: ['kolye-bilezik', Validators.required],
      ayar: ['', Validators.required],
      iscilik: ['', [Validators.required, Validators.min(0)]],
      
      // Kolye/Bilezik için
      modelId: [''],
      sira: [''],
      birimCmTel: ['', [Validators.min(0)]],
      kesilenParca: [0, [Validators.min(0)]],
      digerAgirliklar: ['', [Validators.min(0)]],
      
      // Yüzük/Küpe için
      gram: ['', [Validators.min(0)]]
    });

    // Generate sira options (3, 5, 7, ... 61)
    for (let i = 3; i <= 61; i += 2) {
      this.siraOptions.push(i);
    }
  }

  ngOnInit(): void {
    this.modelService.models$
      .pipe(takeUntil(this.destroy$))
      .subscribe(models => this.models = models);

    this.productService.productsWithModel$
      .pipe(takeUntil(this.destroy$))
      .subscribe(products => this.products = products);

    // Watch productType changes to update form validation
    this.productForm.get('productType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => this.onProductTypeChange(type));
    
    // Initialize with default type
    this.onProductTypeChange('kolye-bilezik');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onProductTypeChange(type: ProductType): void {
    const modelControl = this.productForm.get('modelId');
    const siraControl = this.productForm.get('sira');
    const birimCmTelControl = this.productForm.get('birimCmTel');
    const kesilenParcaControl = this.productForm.get('kesilenParca');
    const digerAgirliklarControl = this.productForm.get('digerAgirliklar');
    const gramControl = this.productForm.get('gram');

    if (type === 'kolye-bilezik') {
      // Kolye/Bilezik için model ve diğer alanlar gerekli
      modelControl?.setValidators([Validators.required]);
      siraControl?.setValidators([Validators.required]);
      birimCmTelControl?.setValidators([Validators.required, Validators.min(0)]);
      kesilenParcaControl?.setValidators([Validators.required, Validators.min(0)]);
      digerAgirliklarControl?.setValidators([Validators.required, Validators.min(0)]);
      gramControl?.clearValidators();
      gramControl?.setValue('');
    } else {
      // Yüzük/Küpe için sadece gram gerekli
      modelControl?.clearValidators();
      siraControl?.clearValidators();
      birimCmTelControl?.clearValidators();
      kesilenParcaControl?.clearValidators();
      digerAgirliklarControl?.clearValidators();
      gramControl?.setValidators([Validators.required, Validators.min(0.01)]);
      
      // Clear values
      modelControl?.setValue('');
      siraControl?.setValue('');
      birimCmTelControl?.setValue('');
      kesilenParcaControl?.setValue(0);
      digerAgirliklarControl?.setValue('');
    }

    // Update validity
    [modelControl, siraControl, birimCmTelControl, kesilenParcaControl, digerAgirliklarControl, gramControl].forEach(
      control => control?.updateValueAndValidity()
    );
  }

  get isKolyeBilezik(): boolean {
    return this.productForm.get('productType')?.value === 'kolye-bilezik';
  }

  get isYuzukKupe(): boolean {
    const type = this.productForm.get('productType')?.value;
    return type === 'yuzuk' || type === 'kupe';
  }

  async onSubmit(): Promise<void> {
    if (this.productForm.invalid) {
      this.notificationService.error('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      const formValue = this.productForm.getRawValue();
      const productType = formValue.productType as ProductType;
      
      const dto: CreateProductDto = {
        productType,
        ayar: typeof formValue.ayar === 'string' ? parseInt(formValue.ayar, 10) : formValue.ayar,
        iscilik: typeof formValue.iscilik === 'string' ? parseInt(formValue.iscilik, 10) : formValue.iscilik
      };

      if (productType === 'kolye-bilezik') {
        dto.modelId = formValue.modelId;
        dto.sira = typeof formValue.sira === 'string' ? parseInt(formValue.sira, 10) : formValue.sira;
        dto.birimCmTel = typeof formValue.birimCmTel === 'string' ? parseFloat(formValue.birimCmTel) : formValue.birimCmTel;
        dto.kesilenParca = typeof formValue.kesilenParca === 'string' ? parseFloat(formValue.kesilenParca) : formValue.kesilenParca;
        dto.digerAgirliklar = typeof formValue.digerAgirliklar === 'string' ? parseFloat(formValue.digerAgirliklar) : formValue.digerAgirliklar;
      } else {
        dto.gram = typeof formValue.gram === 'string' ? parseFloat(formValue.gram) : formValue.gram;
      }

      console.log('Creating product with:', dto);
      await this.productService.create(dto);
      this.notificationService.success('Ürün başarıyla eklendi');
      this.productForm.reset();
    } catch (error: any) {
      console.error('Product creation error:', error);
      this.notificationService.error(error.message || 'Ürün eklenemedi');
    }
  }

  async deleteProduct(product: ProductWithModel): Promise<void> {
    const message = `${product.modelTipi} - ${product.ayar} ayar - Sıra ${product.sira} ürünü silmek istediğinizden emin misiniz?`;
    
    if (confirm(message)) {
      try {
        await this.productService.delete(product.id);
        this.notificationService.success('Ürün başarıyla silindi');
      } catch (error: any) {
        console.error('Product deletion error:', error);
        this.notificationService.error(error.message || 'Ürün silinemedi');
      }
    }
  }
}
