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
  user_id: string; // Changed from userId to user_id
  priority: "low" | "medium" | "high";
  due_date?: string; // Changed from dueDate to due_date
  created_at: string; // Changed from createdAt to created_at
  updated_at: string; // Changed from updatedAt to updated_at
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
  due_date?: string; // Changed from dueDate to due_date
  user_id: string; // Changed from userId to user_id
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: "low" | "medium" | "high";
  due_date?: string; // Changed from dueDate to due_date
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

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

export interface MutationError {
  response?: {
    data?: ApiError;
  };
  message?: string;
}

export type UserRole = "admin" | "user" | "moderator";
export type TodoPriority = "low" | "medium" | "high";
