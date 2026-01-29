import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Model, CreateModelDto } from '../../models/model.model';
import { ModelService } from '../../services/model.service';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-model-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './model-management.component.html',
  styleUrl: './model-management.component.scss'
})
export class ModelManagementComponent implements OnInit, OnDestroy {
  modelForm: FormGroup;
  models: Model[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private modelService: ModelService,
    private productService: ProductService,
    private notificationService: NotificationService
  ) {
    this.modelForm = this.fb.group({
      modelTipi: ['', [Validators.required, Validators.minLength(2)]],
      kesimTipi: ['Dinamik', Validators.required],
      pay: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.modelService.models$
      .pipe(takeUntil(this.destroy$))
      .subscribe(models => this.models = models);

    this.modelForm.get('kesimTipi')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(kesimTipi => {
        const payControl = this.modelForm.get('pay');
        if (kesimTipi === 'Dinamik') {
          payControl?.setValue(0);
          payControl?.disable();
        } else {
          payControl?.enable();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.modelForm.invalid) {
      this.notificationService.error('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      const formValue = this.modelForm.getRawValue();
      // Convert pay to number if it's a string
      const dto: CreateModelDto = {
        modelTipi: formValue.modelTipi,
        kesimTipi: formValue.kesimTipi,
        pay: typeof formValue.pay === 'string' ? parseFloat(formValue.pay) : formValue.pay
      };
      console.log('Creating model with:', dto);
      this.modelService.create(dto);
      this.notificationService.success('Model başarıyla eklendi');
      this.modelForm.reset({ kesimTipi: 'Dinamik', pay: 0 });
    } catch (error: any) {
      this.notificationService.error(error.message || 'Model eklenemedi');
    }
  }

  deleteModel(model: Model): void {
    const productCount = this.productService.getByModel(model.id).length;
    const message = productCount > 0
      ? `Bu modele bağlı ${productCount} adet ürün de silinecek. Onaylıyor musunuz?`
      : `"${model.modelTipi}" modelini silmek istediğinizden emin misiniz?`;

    if (confirm(message)) {
      this.productService.deleteByModel(model.id);
      this.modelService.delete(model.id);
      this.notificationService.success('Model başarıyla silindi');
    }
  }
}
