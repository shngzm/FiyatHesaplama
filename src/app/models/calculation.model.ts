import { Ayar } from './product.model';

export type ProductType = 'Kolye/Bilezik' | 'Yüzük/Küpe';

export interface CalculationHistory {
  id: string;
  modelTipi: string;
  modelId: string;
  productType: ProductType;  // NEW: Product type for calculation
  ayar: Ayar;
  sira: number;
  uzunluk?: number;          // Optional: not used for Yüzük/Küpe
  birimCmTel?: number;       // Optional: only for Kolye/Bilezik
  digerAgirliklar?: number;  // Optional: only for Kolye/Bilezik
  kesilenParca?: number;     // Optional: only for Kolye/Bilezik
  sonuc: number;
  fiyat?: number;           // Calculated price in TL
  bozmaFiyati?: number;     // Scrap price in TL
  altinKuru?: number;       // Gold price used for calculation (TL/gram)
  altinAlisKuru?: number;   // Gold buying price used (TL/gram)
  calculatedAt: Date;
}

export interface CalculationInput {
  modelId: string;
  productType: ProductType;  // NEW: Product type selection
  ayar: Ayar;
  sira: number;
  uzunluk?: number;          // Optional: only for Kolye/Bilezik
}

export interface CalculationResult {
  sonuc: number;
  gram: number;             // Same as sonuc, for backward compatibility
  fiyat?: number;           // Price in TL
  bozmaFiyati?: number;     // Scrap price in TL (gram × ayar × buying price)
  altinKuru?: number;       // Gold price used (TL/gram)
  altinAlisKuru?: number;   // Gold buying price used (TL/gram)
  ayarKatsayisi?: number;   // Ayar ratio used for calculation
  iscilik?: number;         // Labor cost (milyem)
  formula: string;
  breakdown: {
    productType: ProductType;  // NEW: Include product type in breakdown
    uzunluk?: number;
    sira: number;              // NEW: Always include sira
    birimCmTel?: number;       // Optional: only for Kolye/Bilezik
    digerAgirliklar?: number;  // Optional: only for Kolye/Bilezik
    kesilenParca?: number;     // Optional: only for Kolye/Bilezik
  };
}
