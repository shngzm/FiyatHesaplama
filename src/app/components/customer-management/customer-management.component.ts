import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { Customer, HOW_DID_YOU_FIND_US_OPTIONS } from '../../models/customer.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-customer-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './customer-management.component.html',
  styleUrls: ['./customer-management.component.scss']
})
export class CustomerManagementComponent implements OnInit {
  customers: Customer[] = [];
  customerForm!: FormGroup;
  isEditing = false;
  editingCustomerId: string | null = null;
  isLoading = false;
  searchTerm = '';
  
  howDidYouFindUsOptions = [...HOW_DID_YOU_FIND_US_OPTIONS];

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private notificationService: NotificationService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  initForm(): void {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^(\+90|0)?[0-9]{10}$/)]],
      email: ['', [Validators.email]],
      howDidYouFindUs: this.fb.array([]),
      howDidYouFindUsOther: [''],
      notes: ['']
    });
  }

  get howDidYouFindUsArray(): FormArray {
    return this.customerForm.get('howDidYouFindUs') as FormArray;
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.customerService.getCustomers(this.searchTerm || undefined).subscribe({
      next: (response) => {
        this.customers = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.notificationService.showError('Müşteriler yüklenemedi');
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.loadCustomers();
  }

  onCheckboxChange(option: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const arr = this.howDidYouFindUsArray;

    if (checkbox.checked) {
      arr.push(this.fb.control(option));
    } else {
      const index = arr.controls.findIndex(x => x.value === option);
      if (index >= 0) {
        arr.removeAt(index);
      }
    }

    // Show/hide "Diğer" text field
    const hasDiger = arr.controls.some(c => c.value === 'Diğer');
    if (!hasDiger) {
      this.customerForm.patchValue({ howDidYouFindUsOther: '' });
    }
  }

  isChecked(option: string): boolean {
    return this.howDidYouFindUsArray.controls.some(c => c.value === option);
  }

  showOtherField(): boolean {
    return this.howDidYouFindUsArray.controls.some(c => c.value === 'Diğer');
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      this.markFormGroupTouched(this.customerForm);
      return;
    }

    this.isLoading = true;
    const formValue = this.customerForm.value;

    if (this.isEditing && this.editingCustomerId) {
      // Update existing customer
      this.customerService.updateCustomer(this.editingCustomerId, formValue).subscribe({
        next: () => {
          this.notificationService.showSuccess('Müşteri güncellendi');
          this.loadCustomers();
          this.resetForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating customer:', error);
          this.notificationService.showError('Müşteri güncellenemedi');
          this.isLoading = false;
        }
      });
    } else {
      // Create new customer
      this.customerService.createCustomer(formValue).subscribe({
        next: () => {
          this.notificationService.showSuccess('Müşteri oluşturuldu');
          this.loadCustomers();
          this.resetForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating customer:', error);
          this.notificationService.showError('Müşteri oluşturulamadı');
          this.isLoading = false;
        }
      });
    }
  }

  editCustomer(customer: Customer): void {
    this.isEditing = true;
    this.editingCustomerId = customer.id;

    // Clear existing array
    while (this.howDidYouFindUsArray.length) {
      this.howDidYouFindUsArray.removeAt(0);
    }

    // Add customer's selections
    customer.howDidYouFindUs.forEach(option => {
      this.howDidYouFindUsArray.push(this.fb.control(option));
    });

    this.customerForm.patchValue({
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      email: customer.email || '',
      howDidYouFindUsOther: customer.howDidYouFindUsOther || '',
      notes: customer.notes || ''
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteCustomer(customer: Customer): void {
    if (!confirm(`${customer.firstName} ${customer.lastName} isimli müşteriyi silmek istediğinizden emin misiniz?`)) {
      return;
    }

    this.isLoading = true;
    this.customerService.deleteCustomer(customer.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Müşteri silindi');
        this.loadCustomers();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error deleting customer:', error);
        this.notificationService.showError('Müşteri silinemedi');
        this.isLoading = false;
      }
    });
  }

  resetForm(): void {
    this.customerForm.reset();
    while (this.howDidYouFindUsArray.length) {
      this.howDidYouFindUsArray.removeAt(0);
    }
    this.isEditing = false;
    this.editingCustomerId = null;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  formatPhoneNumber(phone: string): string {
    return this.customerService.formatPhoneNumber(phone);
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
