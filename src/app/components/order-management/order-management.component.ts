import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { CustomerService } from '../../services/customer.service';
import { Order, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../models/order.model';
import { Customer } from '../../models/customer.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss']
})
export class OrderManagementComponent implements OnInit {
  orders: Order[] = [];
  customers: Customer[] = [];
  isLoading = false;
  
  // Filters
  selectedCustomerId: string = '';
  selectedStatus: string = '';
  
  statusLabels = ORDER_STATUS_LABELS;
  statusColors = ORDER_STATUS_COLORS;
  
  statuses = ['bekliyor', 'siparis-verildi', 'teslim-edildi', 'iptal'];

  constructor(
    private orderService: OrderService,
    private customerService: CustomerService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadOrders();
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (response) => {
        this.customers = response.data;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
      }
    });
  }

  loadOrders(): void {
    this.isLoading = true;
    
    const filters: any = {};
    if (this.selectedCustomerId) filters.customerId = this.selectedCustomerId;
    if (this.selectedStatus) filters.status = this.selectedStatus;

    this.orderService.getOrders(filters).subscribe({
      next: (response) => {
        this.orders = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.notificationService.showError('Siparişler yüklenemedi');
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadOrders();
  }

  updateOrderStatus(order: Order, newStatus: string): void {
    if (!confirm(`Sipariş durumunu "${this.statusLabels[newStatus as Order['status']]}" olarak değiştirmek istediğinizden emin misiniz?`)) {
      return;
    }

    this.orderService.updateOrder(order.id, { status: newStatus as Order['status'] }).subscribe({
      next: () => {
        this.notificationService.showSuccess('Sipariş durumu güncellendi');
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error updating order:', error);
        this.notificationService.showError('Sipariş durumu güncellenemedi');
      }
    });
  }

  deleteOrder(order: Order): void {
    if (!confirm(`${order.orderNumber} numaralı siparişi silmek istediğinizden emin misiniz?`)) {
      return;
    }

    this.orderService.deleteOrder(order.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Sipariş silindi');
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error deleting order:', error);
        this.notificationService.showError('Sipariş silinemedi');
      }
    });
  }

  getCustomerName(customerId: string): string {
    const customer = this.customers.find(c => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Bilinmiyor';
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' ₺';
  }

  getStatusBadgeClass(status: string): string {
    const colorMap: Record<string, string> = {
      'bekliyor': 'badge-warning',
      'siparis-verildi': 'badge-primary',
      'teslim-edildi': 'badge-success',
      'iptal': 'badge-danger'
    };
    return colorMap[status] || 'badge-secondary';
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status as Order['status']] || status;
  }
}
