import { Ayar } from './product.model';

export interface CalculationHistory {
  id: string;
  modelTipi: string;
  modelId: string;
  ayar: Ayar;
  sira: number;
  uzunluk: number;
  birimCmTel: number;
  digerAgirliklar: number;
  kesilenParca: number;
  sonuc: number;
  fiyat?: number;           // Calculated price in TL
  bozmaFiyati?: number;     // Scrap price in TL
  altinKuru?: number;       // Gold price used for calculation (TL/gram)
  altinAlisKuru?: number;   // Gold buying price used (TL/gram)
  calculatedAt: Date;
}

export interface CalculationInput {
  modelId: string;
  ayar: Ayar;
  sira: number;
  uzunluk: number;
}

export interface CalculationResult {
  sonuc: number;
  gram: number;             // Same as sonuc, for backward compatibility
  fiyat?: number;           // Price in TL
  bozmaFiyati?: number;     // Scrap price in TL (gram × ayar × buying price)
  altinKuru?: number;       // Gold price used (TL/gram)
  altinAlisKuru?: number;   // Gold buying price used (TL/gram)
  ayarKatsayisi?: number;   // Ayar ratio used for calculation
  formula: string;
  breakdown: {
    uzunluk: number;
    birimCmTel: number;
    digerAgirliklar: number;
    kesilenParca: number;
  };
}
