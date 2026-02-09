export type UserRole = 'admin' | 'manager' | 'representative';

export interface User {
  _id?: string; // For backward compatibility
  id?: string;  // DynamoDB uses id
  username: string;
  password: string; // In production, this should be hashed
  location?: string; // Optional for backend compatibility
  role: UserRole;
  isActive?: boolean; // Backend field
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
