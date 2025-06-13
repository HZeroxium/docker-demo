export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "moderator";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: "admin" | "user" | "moderator";
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: "admin" | "user" | "moderator";
  isActive?: boolean;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  userId: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
}
