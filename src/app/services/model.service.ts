import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Model, CreateModelDto, UpdateModelDto } from '../models/model.model';

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  private readonly STORAGE_KEY = 'elizi_goldtool_models';
  private modelsSubject = new BehaviorSubject<Model[]>([]);
  public models$ = this.modelsSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadFromStorage();
    this.initializeDummyData();
  }

  private loadFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          const models = JSON.parse(stored).map((m: any) => ({
            ...m,
            createdAt: new Date(m.createdAt),
            updatedAt: m.updatedAt ? new Date(m.updatedAt) : undefined
          }));
          this.modelsSubject.next(models);
        } catch (error) {
          console.error('Failed to load models from storage:', error);
        }
      }
    }
  }

  private initializeDummyData(): void {
    if (isPlatformBrowser(this.platformId) && this.modelsSubject.value.length === 0) {
      console.log('Initializing sample model...');
      const sampleModel: CreateModelDto = { 
        modelTipi: 'Klasik Hasır', 
        kesimTipi: 'Dinamik', 
        pay: 10 
      };
      
      this.create(sampleModel);
      console.log('Sample model initialized:', this.modelsSubject.value.length);
    }
  }

  private saveToStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.modelsSubject.value));
    }
  }

  getAll(): Observable<Model[]> {
    return this.models$;
  }

  getById(id: string): Model | undefined {
    return this.modelsSubject.value.find(m => m.id === id);
  }

  create(dto: CreateModelDto): Model {
    // Check if model type already exists
    const exists = this.modelsSubject.value.some(
      m => m.modelTipi.toLowerCase() === dto.modelTipi.toLowerCase()
    );
    
    if (exists) {
      throw new Error('Bu model tipi zaten mevcut');
    }

    const newModel: Model = {
      id: this.generateId(),
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const current = this.modelsSubject.value;
    this.modelsSubject.next([...current, newModel]);
    this.saveToStorage();
    
    return newModel;
  }

  update(id: string, dto: UpdateModelDto): Model {
    const current = this.modelsSubject.value;
    const index = current.findIndex(m => m.id === id);
    
    if (index === -1) {
      throw new Error('Model bulunamadı');
    }

    // Check for duplicate model type if updating modelTipi
    if (dto.modelTipi) {
      const duplicate = current.some(
        m => m.id !== id && m.modelTipi.toLowerCase() === dto.modelTipi!.toLowerCase()
      );
      if (duplicate) {
        throw new Error('Bu model tipi zaten mevcut');
      }
    }

    const updated: Model = {
      ...current[index],
      ...dto,
      updatedAt: new Date()
    };

    current[index] = updated;
    this.modelsSubject.next([...current]);
    this.saveToStorage();
    
    return updated;
  }

  delete(id: string): void {
    const current = this.modelsSubject.value;
    const filtered = current.filter(m => m.id !== id);
    this.modelsSubject.next(filtered);
    this.saveToStorage();
  }

  setModels(models: Model[]): void {
    this.modelsSubject.next(models);
    this.saveToStorage();
  }

  private generateId(): string {
    return `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
