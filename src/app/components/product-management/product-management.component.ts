import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Model } from '../../models/model.model';
import { ProductWithModel, CreateProductDto, Ayar } from '../../models/product.model';
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
  ayarOptions: Ayar[] = [14, 22];
  siraOptions: number[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private modelService: ModelService,
    private productService: ProductService,
    private notificationService: NotificationService
  ) {
    this.productForm = this.fb.group({
      modelId: ['', Validators.required],
      ayar: ['', Validators.required],
      sira: ['', Validators.required],
      birimCmTel: ['', [Validators.required, Validators.min(0)]],
      kesilenParca: [{ value: 0, disabled: false }, [Validators.required, Validators.min(0)]],
      digerAgirliklar: ['', [Validators.required, Validators.min(0)]],
      iscilik: ['', [Validators.required, Validators.min(0)]]
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

    this.productForm.get('modelId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(modelId => this.onModelChange(modelId));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onModelChange(modelId: string): void {
    if (!modelId) return;
    
    const model = this.models.find(m => m.id === modelId);
    const kesilenParcaControl = this.productForm.get('kesilenParca');
    
    if (model?.kesimTipi === 'Dinamik') {
      kesilenParcaControl?.enable();
    } else {
      kesilenParcaControl?.setValue(0);
      kesilenParcaControl?.disable();
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.notificationService.error('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      const formValue = this.productForm.getRawValue();
      // Convert string values to proper types
      const dto: CreateProductDto = {
        modelId: formValue.modelId,
        ayar: typeof formValue.ayar === 'string' ? parseInt(formValue.ayar, 10) : formValue.ayar,
        sira: typeof formValue.sira === 'string' ? parseInt(formValue.sira, 10) : formValue.sira,
        birimCmTel: typeof formValue.birimCmTel === 'string' ? parseFloat(formValue.birimCmTel) : formValue.birimCmTel,
        kesilenParca: typeof formValue.kesilenParca === 'string' ? parseFloat(formValue.kesilenParca) : formValue.kesilenParca,
        digerAgirliklar: typeof formValue.digerAgirliklar === 'string' ? parseFloat(formValue.digerAgirliklar) : formValue.digerAgirliklar,
        iscilik: typeof formValue.iscilik === 'string' ? parseInt(formValue.iscilik, 10) : formValue.iscilik
      };
      console.log('Creating product with:', dto);
      this.productService.create(dto);
      this.notificationService.success('Ürün başarıyla eklendi');
      this.productForm.reset();
    } catch (error: any) {
      this.notificationService.error(error.message || 'Ürün eklenemedi');
    }
  }

  deleteProduct(product: ProductWithModel): void {
    const message = `${product.modelTipi} - ${product.ayar} ayar - Sıra ${product.sira} ürünü silmek istediğinizden emin misiniz?`;
    
    if (confirm(message)) {
      this.productService.delete(product.id);
      this.notificationService.success('Ürün başarıyla silindi');
    }
  }
}
