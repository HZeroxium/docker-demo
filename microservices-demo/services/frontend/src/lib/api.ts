import axios from "axios";
import {
  User,
  Todo,
  CreateUserInput,
  UpdateUserInput,
  CreateTodoInput,
  UpdateTodoInput,
  ApiResponse,
  PaginatedResponse,
  UserStats,
} from "@/types";

// API Gateway base URL - connects through Kong
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("❌ API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(
      "❌ API Response Error:",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

// User API methods (via API Gateway)
export const userApi = {
  // Get all users with pagination
  getUsers: async (
    page = 1,
    limit = 10,
    search?: string
  ): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
      `/users?${params}`
    );
    return response.data.data;
  },

  // Get user by ID
  getUser: async (id: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  // Create new user
  createUser: async (userData: CreateUserInput): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      "/users",
      userData
    );
    return response.data.data;
  },

  // Update user
  updateUser: async (id: string, userData: UpdateUserInput): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `/users/${id}`,
      userData
    );
    return response.data.data;
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // Validate user credentials
  validateUser: async (
    email: string,
    password: string
  ): Promise<{ isValid: boolean; user?: User }> => {
    const response = await apiClient.post<
      ApiResponse<{ isValid: boolean; user?: User }>
    >("/users/validate", { email, password });
    return response.data.data;
  },

  // Get user statistics
  getUserStats: async (): Promise<UserStats> => {
    const response = await apiClient.get<ApiResponse<UserStats>>(
      "/users/stats/overview"
    );
    return response.data.data;
  },
};

// Todo API methods (via API Gateway)
export const todoApi = {
  // Get all todos with pagination
  getTodos: async (
    page = 1,
    limit = 10,
    userId?: string
  ): Promise<PaginatedResponse<Todo>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(userId && { userId }),
    });

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Todo>>>(
      `/todos?${params}`
    );
    return response.data.data;
  },

  // Get todo by ID
  getTodo: async (id: string): Promise<Todo> => {
    const response = await apiClient.get<ApiResponse<Todo>>(`/todos/${id}`);
    return response.data.data;
  },

  // Create new todo
  createTodo: async (todoData: CreateTodoInput): Promise<Todo> => {
    const response = await apiClient.post<ApiResponse<Todo>>(
      "/todos",
      todoData
    );
    return response.data.data;
  },

  // Update todo
  updateTodo: async (id: string, todoData: UpdateTodoInput): Promise<Todo> => {
    const response = await apiClient.put<ApiResponse<Todo>>(
      `/todos/${id}`,
      todoData
    );
    return response.data.data;
  },

  // Delete todo
  deleteTodo: async (id: string): Promise<void> => {
    await apiClient.delete(`/todos/${id}`);
  },

  // Toggle todo completion
  toggleTodo: async (id: string): Promise<Todo> => {
    const response = await apiClient.patch<ApiResponse<Todo>>(
      `/todos/${id}/toggle`
    );
    return response.data.data;
  },
};

// Health check API
export const healthApi = {
  checkUserService: async (): Promise<{ status: string; service: string }> => {
    const response = await apiClient.get("/users/health");
    return response.data;
  },

  checkTodoService: async (): Promise<{ status: string; service: string }> => {
    const response = await apiClient.get("/todos/health");
    return response.data;
  },
};

export default apiClient;
