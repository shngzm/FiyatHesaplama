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

    // Calculate: ((Uzunluk - Kesilen Parça + Pay) * Birim CM Tel) + Diğer Ağırlıklar
    // Kesilen parça cm cinsinden, uzunluktan çıkarılır
    const sonuc = this.calculateWeight(
      input.uzunluk,
      model.pay,
      product.birimCmTel,
      product.digerAgirliklar,
      product.kesilenParca
    );

    const result: CalculationResult = {
      sonuc: this.roundToTwoDecimals(sonuc),
      formula: `((${input.uzunluk} - ${product.kesilenParca} + ${model.pay}) * ${product.birimCmTel}) + ${product.digerAgirliklar}`,
      breakdown: {
        uzunluk: input.uzunluk,
        pay: model.pay,
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
      ayar: input.ayar,
      sira: input.sira,
      uzunluk: input.uzunluk,
      pay: model.pay,
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
      
      // Then calculate price with işçilik
      return this.goldPriceService.calculatePrice(
        weightResult.sonuc, 
        input.ayar, 
        product.iscilik
      ).pipe(
        map(priceData => {
          // Calculate bozma fiyatı: gram × ayar katsayısı × alış fiyatı
          const ayarKatsayisi = input.ayar === 14 ? 0.585 : 0.916;
          const bozmaFiyati = weightResult.sonuc * ayarKatsayisi * priceData.goldPrice.buying;

          const resultWithPrice: CalculationResult = {
            ...weightResult,
            fiyat: priceData.price,
            bozmaFiyati: bozmaFiyati,
            altinKuru: priceData.goldPrice.selling,
            altinAlisKuru: priceData.goldPrice.buying
          };

          // Update history with price and bozma fiyatı
          this.updateLastHistoryWithPrice(priceData.price, priceData.goldPrice.selling, bozmaFiyati, priceData.goldPrice.buying);

          return resultWithPrice;
        }),
        catchError(error => {
          console.error('Fiyat hesaplanamadı:', error);
          // Return weight result without price if price calculation fails
          return of(weightResult);
        })
      );
    } catch (error) {
      throw error;
    }
  }

  calculateWeight(
    uzunluk: number,
    pay: number,
    birimCmTel: number,
    digerAgirliklar: number,
    kesilenParcaCm: number
  ): number {
    return ((uzunluk - kesilenParcaCm + pay) * birimCmTel) + digerAgirliklar;
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
