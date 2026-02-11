export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  productType: 'kolye-bilezik' | 'yuzuk-kupe';
  modelName: string;
  purity: string;
  calculationDetails: {
    formula: string;
    uzunluk?: number;
    kesilenParca?: number;
    sira: number;
    birCmTel: number;
    digerAgirliklar: number;
    totalWeight: number;
  };
  subtotal: number;
  discount: number;
  total: number;
  notes?: string;
  status: 'bekliyor' | 'siparis-verildi' | 'teslim-edildi' | 'iptal';
  goldPrice: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CreateOrderInput {
  customerId: string;
  productType: 'kolye-bilezik' | 'yuzuk-kupe';
  modelName: string;
  purity: string;
  calculationDetails: {
    formula: string;
    uzunluk?: number;
    kesilenParca?: number;
    sira: number;
    birCmTel?: number;           // Optional: only for Kolye/Bilezik
    digerAgirliklar?: number;    // Optional: only for Kolye/Bilezik
    totalWeight: number;
  };
  subtotal: number;
  discount?: number;
  total: number;
  notes?: string;
  goldPrice: number;
}

export interface UpdateOrderInput {
  status?: 'bekliyor' | 'siparis-verildi' | 'teslim-edildi' | 'iptal';
  notes?: string;
  discount?: number;
  total?: number;
  subtotal?: number;
}

export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  statusBreakdown: {
    bekliyor: number;
    'siparis-verildi': number;
    'teslim-edildi': number;
    iptal: number;
  };
}

export const ORDER_STATUS_LABELS: Record<Order['status'], string> = {
  'bekliyor': 'Bekliyor',
  'siparis-verildi': 'Sipariş Verildi',
  'teslim-edildi': 'Teslim Edildi',
  'iptal': 'İptal'
};

export const ORDER_STATUS_COLORS: Record<Order['status'], string> = {
  'bekliyor': 'warning',
  'siparis-verildi': 'primary',
  'teslim-edildi': 'success',
  'iptal': 'danger'
};
