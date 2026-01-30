export type Ayar = 8 | 10 | 14 | 18 | 21 | 22;

export interface Product {
  id: string;
  modelId: string;
  ayar: Ayar;
  sira: number;
  birimCmTel: number;
  kesilenParca: number;
  digerAgirliklar: number;
  iscilik: number; // Milyem cinsinden işçilik (örn: 250)
  createdAt: Date;
  updatedAt?: Date;
  
  // Computed fields (for display)
  modelTipi?: string;
  kesimTipi?: string;
  pay?: number;
}

export interface CreateProductDto {
  modelId: string;
  ayar: Ayar;
  sira: number;
  birimCmTel: number;
  kesilenParca: number;
  digerAgirliklar: number;
  iscilik: number;
}

export interface UpdateProductDto {
  modelId?: string;
  ayar?: Ayar;
  sira?: number;
  birimCmTel?: number;
  kesilenParca?: number;
  digerAgirliklar?: number;
  iscilik?: number;
}

export interface ProductWithModel extends Product {
  modelTipi: string;
  kesimTipi: string;
  pay: number;
}
