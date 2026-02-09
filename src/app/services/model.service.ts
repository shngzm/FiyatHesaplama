import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Model, CreateModelDto, UpdateModelDto } from '../models/model.model';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/models`;
  
  private modelsSubject = new BehaviorSubject<Model[]>([]);
  public models$ = this.modelsSubject.asObservable();

  constructor() {
    this.loadModels();
  }

  private async loadModels(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Model[]>>(this.apiUrl)
      );
      
      if (response.success && response.data) {
        const models = response.data.map(m => ({
          ...m,
          createdAt: new Date(m.createdAt),
          updatedAt: m.updatedAt ? new Date(m.updatedAt) : undefined
        }));
        this.modelsSubject.next(models);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  }

  getAll(): Observable<Model[]> {
    return this.models$;
  }

  getById(id: string): Model | undefined {
    return this.modelsSubject.value.find(m => m.id === id);
  }

  async create(dto: CreateModelDto): Promise<Model> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<Model>>(this.apiUrl, dto)
      );
      
      if (response.success && response.data) {
        const newModel = {
          ...response.data,
          createdAt: new Date(response.data.createdAt),
          updatedAt: response.data.updatedAt ? new Date(response.data.updatedAt) : undefined
        };
        
        const current = this.modelsSubject.value;
        this.modelsSubject.next([...current, newModel]);
        return newModel;
      } else {
        throw new Error(response.message || 'Model oluşturulamadı');
      }
    } catch (error: any) {
      console.error('Failed to create model:', error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateModelDto): Promise<Model> {
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<Model>>(`${this.apiUrl}/${id}`, dto)
      );
      
      if (response.success && response.data) {
        const updatedModel = {
          ...response.data,
          createdAt: new Date(response.data.createdAt),
          updatedAt: response.data.updatedAt ? new Date(response.data.updatedAt) : undefined
        };
        
        const current = this.modelsSubject.value;
        const index = current.findIndex(m => m.id === id);
        if (index !== -1) {
          current[index] = updatedModel;
          this.modelsSubject.next([...current]);
        }
        return updatedModel;
      } else {
        throw new Error(response.message || 'Model güncellenemedi');
      }
    } catch (error: any) {
      console.error('Failed to update model:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      );
      
      if (response.success) {
        const current = this.modelsSubject.value;
        this.modelsSubject.next(current.filter(m => m.id !== id));
      } else {
        throw new Error(response.message || 'Model silinemedi');
      }
    } catch (error: any) {
      console.error('Failed to delete model:', error);
      throw error;
    }
  }
}
