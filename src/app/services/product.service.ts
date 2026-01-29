import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { Product, CreateProductDto, UpdateProductDto, ProductWithModel, Ayar } from '../models/product.model';
import { ModelService } from './model.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly STORAGE_KEY = 'elizi_goldtool_products';
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
            modelTipi: model?.modelTipi || 'Unknown',
            kesimTipi: model?.kesimTipi || 'Dinamik',
            pay: model?.pay || 0
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
      console.log('Creating dummy products...');
      
      if (models.length > 0) {
        const dummyProducts: CreateProductDto[] = [
          // Trabzon Hasır 1mm products
          { modelId: models[0]?.id || '', ayar: 14, sira: 1, birimCmTel: 0.15, kesilenParca: 2, digerAgirliklar: 0.05, iscilik: 250 },
          { modelId: models[0]?.id || '', ayar: 22, sira: 1, birimCmTel: 0.18, kesilenParca: 2, digerAgirliklar: 0.06, iscilik: 300 },
          
          // Trabzon Hasır 1.5mm products
          { modelId: models[1]?.id || '', ayar: 14, sira: 1, birimCmTel: 0.20, kesilenParca: 2.5, digerAgirliklar: 0.07, iscilik: 280 },
          { modelId: models[1]?.id || '', ayar: 22, sira: 1, birimCmTel: 0.23, kesilenParca: 2.5, digerAgirliklar: 0.08, iscilik: 320 },
          
          // Trabzon Hasır 2mm products
          { modelId: models[2]?.id || '', ayar: 14, sira: 1, birimCmTel: 0.25, kesilenParca: 3, digerAgirliklar: 0.10, iscilik: 300 },
          { modelId: models[2]?.id || '', ayar: 22, sira: 1, birimCmTel: 0.28, kesilenParca: 3, digerAgirliklar: 0.12, iscilik: 350 },
          
          // Zincir Model A products
          { modelId: models[3]?.id || '', ayar: 14, sira: 1, birimCmTel: 0.30, kesilenParca: 3.5, digerAgirliklar: 0.15, iscilik: 320 },
          { modelId: models[3]?.id || '', ayar: 22, sira: 1, birimCmTel: 0.35, kesilenParca: 3.5, digerAgirliklar: 0.18, iscilik: 380 },
          
          // Zincir Model B products
          { modelId: models[4]?.id || '', ayar: 14, sira: 1, birimCmTel: 0.35, kesilenParca: 4, digerAgirliklar: 0.20, iscilik: 350 },
          { modelId: models[4]?.id || '', ayar: 22, sira: 1, birimCmTel: 0.40, kesilenParca: 4, digerAgirliklar: 0.25, iscilik: 400 },
        ];

        dummyProducts.forEach(dto => {
          if (dto.modelId) {
            try {
              this.create(dto);
            } catch (error) {
              console.log('Dummy product already exists, skipping');
            }
          }
        });
        console.log('Dummy products initialized:', this.productsSubject.value.length);
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
    return this.productsSubject.value.find(
      p => p.modelId === modelId && p.ayar === ayar && p.sira === sira
    );
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
    const products = this.productsSubject.value.filter(
      p => p.modelId === modelId && p.ayar === ayar
    );
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
