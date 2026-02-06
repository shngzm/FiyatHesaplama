export interface Model {
  id: string;
  modelTipi: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateModelDto {
  modelTipi: string;
}

export interface UpdateModelDto {
  modelTipi?: string;
}
