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
const API_BASE_URL = "http://localhost:8000";

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

    // Better error handling for network/CORS issues
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      console.error(
        "🚨 Network Error - Check if API Gateway is running and CORS is configured"
      );
    }

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

    const response = await apiClient.get<
      ApiResponse<{
        users: User[];
        total: number;
        page: number;
        limit: number;
      }>
    >(`/users?${params}`);

    // Handle the actual API response structure
    const responseData = response.data.data;

    // The API returns { users: [...], total, page, limit }
    if (responseData && responseData.users) {
      return {
        items: responseData.users,
        total: responseData.total || 0,
        page: responseData.page || page,
        limit: responseData.limit || limit,
      };
    }

    // Fallback for other possible structures
    if (Array.isArray(responseData)) {
      return {
        items: responseData,
        total: responseData.length,
        page: page,
        limit: limit,
      };
    }

    // Handle case where responseData might already have items
    return {
      items: responseData?.users || [],
      total: responseData?.total || 0,
      page: responseData?.page || page,
      limit: responseData?.limit || limit,
    };
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
    try {
      const response = await apiClient.get<ApiResponse<UserStats>>(
        "/users/stats/overview"
      );

      // Ensure all required properties exist with defaults
      const stats = response.data.data;
      return {
        total: stats?.total || 0,
        active: stats?.active || 0,
        inactive: stats?.inactive || 0,
        byRole: {
          admin: stats?.byRole?.admin || 0,
          user: stats?.byRole?.user || 0,
          moderator: stats?.byRole?.moderator || 0,
          ...stats?.byRole,
        },
      };
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
      // Return safe defaults when stats endpoint fails
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byRole: {
          admin: 0,
          user: 0,
          moderator: 0,
        },
      };
    }
  },
};

// Todo API methods (via API Gateway)
export const todoApi = {
  // Get all todos with pagination
  getTodos: async (
    page = 1,
    limit = 10,
    user_id?: string // Changed from userId to user_id
  ): Promise<PaginatedResponse<Todo>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(user_id && { user_id }), // Changed from userId to user_id
    });

    try {
      const response = await apiClient.get<{
        todos: Todo[];
        total: number;
        page: number;
        limit: number;
      }>(`/todos?${params}`);

      console.log("Todo API Response:", response.data);

      // Handle direct response format from todo service
      const responseData = response.data;

      return {
        items: responseData.todos || [],
        total: responseData.total || 0,
        page: responseData.page || page,
        limit: responseData.limit || limit,
      };
    } catch (error) {
      console.error("Error fetching todos:", error);
      // Return safe default structure
      return {
        items: [],
        total: 0,
        page: page,
        limit: limit,
      };
    }
  },

  // Get todo by ID
  getTodo: async (id: string): Promise<Todo> => {
    const response = await apiClient.get<Todo>(`/todos/${id}`);
    return response.data;
  },

  // Create new todo
  createTodo: async (todoData: CreateTodoInput): Promise<Todo> => {
    const response = await apiClient.post<Todo>("/todos", todoData);
    return response.data;
  },

  // Update todo
  updateTodo: async (id: string, todoData: UpdateTodoInput): Promise<Todo> => {
    const response = await apiClient.put<Todo>(`/todos/${id}`, todoData);
    return response.data;
  },

  // Delete todo
  deleteTodo: async (id: string): Promise<void> => {
    await apiClient.delete(`/todos/${id}`);
  },

  // Toggle todo completion
  toggleTodo: async (id: string): Promise<Todo> => {
    const response = await apiClient.patch<Todo>(`/todos/${id}/toggle`);
    return response.data;
  },
};

// Health check API
export const healthApi = {
  checkUserService: async (): Promise<{ status: string; service: string }> => {
    try {
      const response = await apiClient.get("/users/health");
      // Handle both direct response and wrapped response
      const data = response.data.data || response.data;
      return {
        status: data.status || "healthy",
        service: data.service || "user-service",
      };
    } catch (error) {
      console.error("User service health check failed:", error);
      return {
        status: "unhealthy",
        service: "user-service",
      };
    }
  },

  checkTodoService: async (): Promise<{ status: string; service: string }> => {
    try {
      const response = await apiClient.get("/todos/health");
      // Handle both direct response and wrapped response
      const data = response.data.data || response.data;
      return {
        status: data.status || "healthy",
        service: data.service || "todo-service",
      };
    } catch (error) {
      console.error("Todo service health check failed:", error);
      return {
        status: "unhealthy",
        service: "todo-service",
      };
    }
  },
};

export default apiClient;
