import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { Product, CreateProductDto, UpdateProductDto, ProductWithModel, Ayar } from '../models/product.model';
import { ModelService } from './model.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly STORAGE_KEY = 'elizi_goldtool_products_v5'; // v5 - sadece 14 ve 22 ayar
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  // Products with model information
  public productsWithModel$: Observable<ProductWithModel[]>;

  constructor(
    private modelService: ModelService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadFromStorage();
    
    // Combine products with model data
    this.productsWithModel$ = combineLatest([
      this.products$,
      this.modelService.models$
    ]).pipe(
      map(([products, models]) => {
        return products.map(product => {
          const model = models.find(m => m.id === product.modelId);
          return {
            ...product,
            modelTipi: model?.modelTipi || 'Unknown'
          } as ProductWithModel;
        });
      })
    );
    
    // Initialize with dummy data after models are loaded
    this.modelService.models$.subscribe(models => {
      if (models.length > 0 && this.productsSubject.value.length === 0) {
        console.log('Models loaded, initializing dummy products for', models.length, 'models');
        this.initializeDummyData(models);
      }
    });
  }

  private initializeDummyData(models: any[]): void {
    if (isPlatformBrowser(this.platformId) && this.productsSubject.value.length === 0) {
      console.log('Creating sample products for Klasik Hasır...');
      console.log('Available models:', models.length, models);
      
      if (models.length > 0) {
        const modelId = models[0]?.id;
        console.log('Using model ID:', modelId);
        
        const klasikHasirProducts: CreateProductDto[] = [
          // Klasik Hasır - 14 Ayar
          { modelId: models[0]?.id || '', ayar: 14, sira: 5, birimCmTel: 0.60, kesilenParca: 0.8, digerAgirliklar: 6.5, iscilik: 250 },
          { modelId: models[0]?.id || '', ayar: 14, sira: 7, birimCmTel: 0.90, kesilenParca: 0.8, digerAgirliklar: 9.5, iscilik: 250 },
          { modelId: models[0]?.id || '', ayar: 14, sira: 9, birimCmTel: 1.2, kesilenParca: 0.8, digerAgirliklar: 9.2, iscilik: 250 },
          { modelId: models[0]?.id || '', ayar: 14, sira: 11, birimCmTel: 1.5, kesilenParca: 0.8, digerAgirliklar: 10.55, iscilik: 250 },
          { modelId: models[0]?.id || '', ayar: 14, sira: 13, birimCmTel: 1.8, kesilenParca: 0.8, digerAgirliklar: 12, iscilik: 250 },
          
          // Klasik Hasır - 22 Ayar
          { modelId: models[0]?.id || '', ayar: 22, sira: 5, birimCmTel: 0.70, kesilenParca: 0.8, digerAgirliklar: 9.4, iscilik: 250 },
          { modelId: models[0]?.id || '', ayar: 22, sira: 7, birimCmTel: 1.11, kesilenParca: 0.8, digerAgirliklar: 12, iscilik: 250 },
          { modelId: models[0]?.id || '', ayar: 22, sira: 9, birimCmTel: 1.40, kesilenParca: 0.8, digerAgirliklar: 11.7, iscilik: 250 },
          { modelId: models[0]?.id || '', ayar: 22, sira: 11, birimCmTel: 1.75, kesilenParca: 0.8, digerAgirliklar: 14.4, iscilik: 250 },
          { modelId: models[0]?.id || '', ayar: 22, sira: 13, birimCmTel: 2.19, kesilenParca: 0.8, digerAgirliklar: 16.2, iscilik: 250 },
        ];

        klasikHasirProducts.forEach(dto => {
          if (dto.modelId) {
            try {
              this.create(dto);
            } catch (error) {
              console.log('Dummy product already exists, skipping');
            }
          }
        });
        console.log('Dummy products initialized:', this.productsSubject.value.length, '(14 and 22 ayar only)');
      }
    }
  }

  private loadFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          const products = JSON.parse(stored).map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined
          }));
          this.productsSubject.next(products);
        } catch (error) {
          console.error('Failed to load products from storage:', error);
        }
      }
    }
  }

  private saveToStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.productsSubject.value));
    }
  }

  getAll(): Observable<Product[]> {
    return this.products$;
  }

  getById(id: string): Product | undefined {
    return this.productsSubject.value.find(p => p.id === id);
  }

  getByModelAyarSira(modelId: string, ayar: Ayar, sira: number): Product | undefined {
    console.log('getByModelAyarSira called with:', { modelId, ayar, ayarType: typeof ayar, sira, siraType: typeof sira });
    const result = this.productsSubject.value.find(
      p => {
        const match = p.modelId === modelId && p.ayar === ayar && p.sira === sira;
        if (!match) {
          console.log('Product not matching:', { pModelId: p.modelId, pAyar: p.ayar, pAyarType: typeof p.ayar, pSira: p.sira, pSiraType: typeof p.sira });
        }
        return match;
      }
    );
    console.log('getByModelAyarSira result:', result ? 'Found' : 'Not found');
    return result;
  }

  getByModel(modelId: string): Product[] {
    return this.productsSubject.value.filter(p => p.modelId === modelId);
  }

  getAyarsForModel(modelId: string): Ayar[] {
    const products = this.getByModel(modelId);
    const ayars = [...new Set(products.map(p => p.ayar))];
    return ayars.sort();
  }

  getSirasForModelAndAyar(modelId: string, ayar: Ayar): number[] {
    const allProducts = this.productsSubject.value;
    console.log('All products:', allProducts);
    console.log('Filtering for modelId:', modelId, 'ayar:', ayar, 'ayar type:', typeof ayar);
    
    const products = allProducts.filter(
      p => {
        const match = p.modelId === modelId && p.ayar === ayar;
        console.log('Product:', { id: p.id, modelId: p.modelId, ayar: p.ayar, ayarType: typeof p.ayar, sira: p.sira, match });
        return match;
      }
    );
    console.log('getSirasForModelAndAyar:', { modelId, ayar, products: products.length, allProducts: allProducts.length });
    const siras = [...new Set(products.map(p => p.sira))];
    return siras.sort((a, b) => a - b);
  }

  create(dto: CreateProductDto): Product {
    // Check if combination already exists
    const exists = this.productsSubject.value.some(
      p => p.modelId === dto.modelId && p.ayar === dto.ayar && p.sira === dto.sira
    );
    
    if (exists) {
      throw new Error('Bu kombinasyon zaten mevcut');
    }

    const newProduct: Product = {
      id: this.generateId(),
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const current = this.productsSubject.value;
    this.productsSubject.next([...current, newProduct]);
    this.saveToStorage();
    
    return newProduct;
  }

  createMany(dtos: CreateProductDto[]): Product[] {
    const newProducts: Product[] = [];
    const current = this.productsSubject.value;
    const allProducts = [...current];

    for (const dto of dtos) {
      // Check if combination already exists
      const exists = allProducts.some(
        p => p.modelId === dto.modelId && p.ayar === dto.ayar && p.sira === dto.sira
      );
      
      if (exists) {
        throw new Error(`Kombinasyon zaten mevcut: Ayar ${dto.ayar}, Sıra ${dto.sira}`);
      }

      const newProduct: Product = {
        id: this.generateId(),
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      newProducts.push(newProduct);
      allProducts.push(newProduct);
    }

    this.productsSubject.next(allProducts);
    this.saveToStorage();
    return newProducts;
  }

  update(id: string, dto: UpdateProductDto): Product {
    const current = this.productsSubject.value;
    const index = current.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Ürün bulunamadı');
    }

    // Check for duplicate if updating key fields
    if (dto.modelId !== undefined || dto.ayar !== undefined || dto.sira !== undefined) {
      const product = current[index];
      const newModelId = dto.modelId ?? product.modelId;
      const newAyar = dto.ayar ?? product.ayar;
      const newSira = dto.sira ?? product.sira;

      const duplicate = current.some(
        p => p.id !== id && 
             p.modelId === newModelId && 
             p.ayar === newAyar && 
             p.sira === newSira
      );
      
      if (duplicate) {
        throw new Error('Bu kombinasyon zaten mevcut');
      }
    }

    const updated: Product = {
      ...current[index],
      ...dto,
      updatedAt: new Date()
    };

    current[index] = updated;
    this.productsSubject.next([...current]);
    this.saveToStorage();
    
    return updated;
  }

  delete(id: string): void {
    const current = this.productsSubject.value;
    const filtered = current.filter(p => p.id !== id);
    this.productsSubject.next(filtered);
    this.saveToStorage();
  }

  deleteByModel(modelId: string): number {
    const current = this.productsSubject.value;
    const filtered = current.filter(p => p.modelId !== modelId);
    const deletedCount = current.length - filtered.length;
    this.productsSubject.next(filtered);
    this.saveToStorage();
    return deletedCount;
  }

  setProducts(products: Product[]): void {
    this.productsSubject.next(products);
    this.saveToStorage();
  }

  private generateId(): string {
    return `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
