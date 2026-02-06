export type UserRole = 'admin' | 'manager' | 'representative';

export interface User {
  id: string;
  username: string;
  password: string; // In production, this should be hashed
  location: string;
  role: UserRole;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateUserDto {
  username: string;
  password: string;
  location: string;
  role: UserRole;
}

export interface UpdateUserDto {
  username?: string;
  password?: string;
  location?: string;
  role?: UserRole;
}
