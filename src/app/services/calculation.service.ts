import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import { CalculationHistory, CalculationInput, CalculationResult } from '../models/calculation.model';
import { ProductService } from './product.service';
import { ModelService } from './model.service';
import { GoldPriceService } from './gold-price.service';
import { Ayar } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CalculationService {
  private readonly MAX_HISTORY = 5;
  private historySubject = new BehaviorSubject<CalculationHistory[]>([]);
  public history$ = this.historySubject.asObservable();

  constructor(
    private productService: ProductService,
    private modelService: ModelService,
    private goldPriceService: GoldPriceService
  ) {}

  calculate(input: CalculationInput): CalculationResult {
    // Get product
    const product = this.productService.getByModelAyarSira(
      input.modelId,
      input.ayar,
      input.sira
    );

    if (!product) {
      throw new Error('Ürün bulunamadı');
    }

    // Get model
    const model = this.modelService.getById(input.modelId);
    if (!model) {
      throw new Error('Model bulunamadı');
    }

    // Calculate weight based on product type
    let sonuc: number;
    let formula: string;
    
    if (input.productType === 'Kolye/Bilezik') {
      // Original formula: ((Uzunluk - Kesilen Parça) * Birim CM Tel) + Diğer Ağırlıklar
      if (!input.uzunluk || input.uzunluk <= 0) {
        throw new Error('Uzunluk alanı Kolye/Bilezik için zorunludur');
      }
      sonuc = this.calculateKolyeBilezik(
        input.uzunluk,
        product.birimCmTel,
        product.digerAgirliklar,
        product.kesilenParca
      );
      formula = `((${input.uzunluk} - ${product.kesilenParca}) * ${product.birimCmTel}) + ${product.digerAgirliklar}`;
    } else {
      // Yüzük/Küpe formula: (Sıra * 1cm Tel) + Diğer Ağırlıklar
      sonuc = this.calculateYuzukKupe(
        input.sira,
        product.birimCmTel,
        product.digerAgirliklar
      );
      formula = `(${input.sira} * ${product.birimCmTel}) + ${product.digerAgirliklar}`;
    }

    const result: CalculationResult = {
      sonuc: this.roundToTwoDecimals(sonuc),
      gram: this.roundToTwoDecimals(sonuc),
      formula,
      breakdown: {
        productType: input.productType,
        uzunluk: input.uzunluk,
        sira: input.sira,
        birimCmTel: product.birimCmTel,
        digerAgirliklar: product.digerAgirliklar,
        kesilenParca: product.kesilenParca
      }
    };

    // Add to history (without price - will be added separately)
    this.addToHistory({
      id: this.generateId(),
      modelTipi: model.modelTipi,
      modelId: input.modelId,
      productType: input.productType,
      ayar: input.ayar,
      sira: input.sira,
      uzunluk: input.uzunluk,
      birimCmTel: product.birimCmTel,
      digerAgirliklar: product.digerAgirliklar,
      kesilenParca: product.kesilenParca,
      sonuc: result.sonuc,
      calculatedAt: new Date()
    });

    return result;
  }

  /**
   * Calculate with price (async version)
   * Returns Observable with weight and price
   */
  calculateWithPrice(input: CalculationInput): Observable<CalculationResult> {
    try {
      // First calculate weight
      const weightResult = this.calculate(input);
      
      // Get product to access işçilik
      const product = this.productService.getByModelAyarSira(
        input.modelId,
        input.ayar,
        input.sira
      );

      if (!product) {
        throw new Error('Ürün bulunamadı');
      }
      
      // Ayar oranları (Tüm ürünler Elizi ürünüdür)
      const ayarRatios: { [key: number]: number } = {
        8: 0.333,
        10: 0.417,
        14: 0.585,
        18: 0.750,
        21: 0.875,
        22: 0.916
      };

      const ayarKatsayisi = ayarRatios[input.ayar] || (input.ayar / 24);

      console.log('Calculation with ayar ratio:', {
        ayar: input.ayar,
        ayarKatsayisi
      });
      
      // Calculate price with işçilik
      const priceData = this.goldPriceService.calculatePrice(
        weightResult.sonuc, 
        input.ayar, 
        product.iscilik
      );

      // Calculate bozma fiyatı: gram × ayar katsayısı × alış fiyatı
      const bozmaFiyati = weightResult.sonuc * ayarKatsayisi * priceData.goldPrice.buying;

      const resultWithPrice: CalculationResult = {
        ...weightResult,
        fiyat: priceData.price,
        bozmaFiyati: bozmaFiyati,
        altinKuru: priceData.goldPrice.selling,
        altinAlisKuru: priceData.goldPrice.buying,
        ayarKatsayisi: ayarKatsayisi,
        iscilik: product.iscilik
      };

      // Update history with price and bozma fiyatı
      this.updateLastHistoryWithPrice(priceData.price, priceData.goldPrice.selling, bozmaFiyati, priceData.goldPrice.buying);

      return of(resultWithPrice);
    } catch (error) {
      throw error;
    }
  }

  calculateWeight(
    uzunluk: number,
    birimCmTel: number,
    digerAgirliklar: number,
    kesilenParcaCm: number
  ): number {
    return ((uzunluk - kesilenParcaCm) * birimCmTel) + digerAgirliklar;
  }

  /**
   * Calculate weight for Kolye/Bilezik type products
   * Formula: ((Uzunluk - Kesilen Parça) * Birim CM Tel) + Diğer Ağırlıklar
   */
  private calculateKolyeBilezik(
    uzunluk: number,
    birimCmTel: number,
    digerAgirliklar: number,
    kesilenParcaCm: number
  ): number {
    return ((uzunluk - kesilenParcaCm) * birimCmTel) + digerAgirliklar;
  }

  /**
   * Calculate weight for Yüzük/Küpe type products
   * Formula: (Sıra * 1cm Tel) + Diğer Ağırlıklar
   */
  private calculateYuzukKupe(
    sira: number,
    birimCmTel: number,
    digerAgirliklar: number
  ): number {
    return (sira * birimCmTel) + digerAgirliklar;
  }

  getHistory(): Observable<CalculationHistory[]> {
    return this.history$;
  }

  clearHistory(): void {
    this.historySubject.next([]);
  }

  private addToHistory(item: CalculationHistory): void {
    const current = this.historySubject.value;
    const updated = [item, ...current].slice(0, this.MAX_HISTORY);
    this.historySubject.next(updated);
  }

  private updateLastHistoryWithPrice(fiyat: number, altinKuru: number, bozmaFiyati?: number, altinAlisKuru?: number): void {
    const current = this.historySubject.value;
    if (current.length > 0) {
      const updated = [...current];
      updated[0] = {
        ...updated[0],
        fiyat,
        altinKuru,
        bozmaFiyati,
        altinAlisKuru
      };
      this.historySubject.next(updated);
    }
  }

  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private generateId(): string {
    return `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
