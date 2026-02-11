export type Ayar = 8 | 10 | 14 | 18 | 21 | 22;
export type ProductType = 'kolye-bilezik' | 'yuzuk' | 'kupe';

export interface Product {
  id: string;
  productType: ProductType; // Ürün tipi: kolye-bilezik, yuzuk, kupe
  ayar: Ayar;
  
  // Kolye/Bilezik için (productType === 'kolye-bilezik')
  modelId?: string;
  sira?: number;
  birimCmTel?: number;
  kesilenParca?: number;
  digerAgirliklar?: number;
  
  // Yüzük/Küpe için (productType === 'yuzuk' || productType === 'kupe')
  gram?: number; // Ürün gramı
  
  iscilik: number; // Milyem cinsinden işçilik (örn: 250) - Her ürün için gerekli
  
  createdAt: Date;
  updatedAt?: Date;
  
  // Computed fields (for display)
  modelTipi?: string;
}

export interface CreateProductDto {
  productType: ProductType;
  ayar: Ayar;
  iscilik: number;
  
  // Kolye/Bilezik için
  modelId?: string;
  sira?: number;
  birimCmTel?: number;
  kesilenParca?: number;
  digerAgirliklar?: number;
  
  // Yüzük/Küpe için
  gram?: number;
}

export interface UpdateProductDto {
  productType?: ProductType;
  ayar?: Ayar;
  iscilik?: number;
  modelId?: string;
  sira?: number;
  birimCmTel?: number;
  kesilenParca?: number;
  digerAgirliklar?: number;
  gram?: number;
}

export interface ProductWithModel extends Product {
  modelTipi: string;
}
