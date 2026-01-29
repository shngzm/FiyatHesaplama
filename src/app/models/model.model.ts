export type KesimTipi = 'Dinamik' | 'Statik';

export interface Model {
  id: string;
  modelTipi: string;
  kesimTipi: KesimTipi;
  pay: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateModelDto {
  modelTipi: string;
  kesimTipi: KesimTipi;
  pay: number;
}

export interface UpdateModelDto {
  modelTipi?: string;
  kesimTipi?: KesimTipi;
  pay?: number;
}
