export interface Model {
  id: string;
  modelTipi: string;
  productType?: string; // 'Kolye/Bilezik' | 'Yüzük' | 'Küpe'
  ayars?: number[]; // Mevcut ayarlar
  siras?: number[]; // Mevcut sıralar (sadece Kolye/Bilezik)
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateModelDto {
  modelTipi: string;
  productType?: string;
}

export interface UpdateModelDto {
  modelTipi?: string;
  productType?: string;
}
