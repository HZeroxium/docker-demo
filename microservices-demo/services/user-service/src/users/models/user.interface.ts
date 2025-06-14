// users/models/user.interface.ts

export interface IUser {
  id?: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserFilterInput {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface PaginationInput {
  page?: number;
  limit?: number;
}
