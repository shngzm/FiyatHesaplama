import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom, combineLatest, map } from 'rxjs';
import { Product, CreateProductDto, UpdateProductDto, ProductWithModel } from '../models/product.model';
import { ModelService } from './model.service';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private modelService = inject(ModelService);
  private apiUrl = `${environment.apiUrl}/products`;
  
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  // Products with model information
  public productsWithModel$: Observable<ProductWithModel[]>;

  constructor() {
    this.loadProducts();
    
    // Combine products with model data
    this.productsWithModel$ = combineLatest([
      this.products$,
      this.modelService.models$
    ]).pipe(
      map(([products, models]) => {
        return products.map(product => {
          // If modelId is already populated (from backend), use it
          if (typeof product.modelId === 'object' && product.modelId !== null && 'modelTipi' in product.modelId) {
            return {
              ...product,
              modelTipi: (product.modelId as any).modelTipi
            } as ProductWithModel;
          }
          
          // Otherwise find model from local cache
          const model = models.find(m => m.id === product.modelId);
          return {
            ...product,
            modelTipi: model?.modelTipi || 'Unknown'
          } as ProductWithModel;
        });
      })
    );
  }

  private async loadProducts(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Product[]>>(this.apiUrl)
      );
      
      if (response.success && response.data) {
        const products = response.data.map(p => this.normalizeProduct(p));
        this.productsSubject.next(products);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }

  private normalizeProduct(p: any): Product {
    return {
      ...p,
      modelId: typeof p.modelId === 'object' ? p.modelId.id : p.modelId,
      createdAt: new Date(p.createdAt),
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined
    };
  }

  getAll(): Observable<Product[]> {
    return this.products$;
  }

  getById(id: string): Product | undefined {
    return this.productsSubject.value.find(p => p.id === id);
  }

  getByModelAyarSira(modelId: string, ayar: number, sira: number): Product | undefined {
    return this.productsSubject.value.find(
      p => p.modelId === modelId && p.ayar === ayar && p.sira === sira
    );
  }

  async create(dto: CreateProductDto): Promise<Product> {
    try {
      console.log('Sending product data to API:', dto);
      console.log('API URL:', this.apiUrl);
      
      const response = await firstValueFrom(
        this.http.post<ApiResponse<Product>>(this.apiUrl, dto)
      );
      
      console.log('API response:', response);
      
      if (response.success && response.data) {
        const newProduct = this.normalizeProduct(response.data);
        const current = this.productsSubject.value;
        this.productsSubject.next([...current, newProduct]);
        return newProduct;
      } else {
        throw new Error(response.message || 'Ürün oluşturulamadı');
      }
    } catch (error: any) {
      console.error('Failed to create product:', error);
      console.error('Error details:', {
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        error: error.error
      });
      throw error;
    }
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, dto)
      );
      
      if (response.success && response.data) {
        const updatedProduct = this.normalizeProduct(response.data);
        const current = this.productsSubject.value;
        const index = current.findIndex(p => p.id === id);
        if (index !== -1) {
          current[index] = updatedProduct;
          this.productsSubject.next([...current]);
        }
        return updatedProduct;
      } else {
        throw new Error(response.message || 'Ürün güncellenemedi');
      }
    } catch (error: any) {
      console.error('Failed to update product:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      );
      
      if (response.success) {
        const current = this.productsSubject.value;
        this.productsSubject.next(current.filter(p => p.id !== id));
      } else {
        throw new Error(response.message || 'Ürün silinemedi');
      }
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  }

  isProductExists(modelId: string, ayar: number, sira: number): boolean {
    return this.productsSubject.value.some(
      p => p.modelId === modelId && p.ayar === ayar && p.sira === sira
    );
  }

  // Helper methods for components
  getByModel(modelId: string): Product[] {
    return this.productsSubject.value.filter(p => p.modelId === modelId);
  }

  getAyarsForModel(modelId: string): number[] {
    const products = this.getByModel(modelId);
    const ayars = [...new Set(products.map(p => p.ayar))];
    return ayars.sort((a, b) => a - b);
  }

  getSirasForModelAndAyar(modelId: string, ayar: number): number[] {
    const products = this.productsSubject.value.filter(
      p => p.modelId === modelId && p.ayar === ayar
    );
    const siras = products.map(p => p.sira);
    return siras.sort((a, b) => a - b);
  }

  async deleteByModel(modelId: string): Promise<void> {
    const productsToDelete = this.getByModel(modelId);
    for (const product of productsToDelete) {
      await this.delete(product.id!);
    }
  }
}
