import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi, todoApi, healthApi } from "@/lib/api";
import {
  CreateUserInput,
  UpdateUserInput,
  CreateTodoInput,
  UpdateTodoInput,
} from "@/types";

// User hooks
export const useUsers = (page = 1, limit = 10, search?: string) => {
  return useQuery({
    queryKey: ["users", page, limit, search],
    queryFn: () => userApi.getUsers(page, limit, search),
    staleTime: 30000, // 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    select: (data) => {
      console.log("Raw user data received:", data);
      return {
        items: data?.items || [],
        total: data?.total || 0,
        page: data?.page || page,
        limit: data?.limit || limit,
      };
    },
    meta: {
      errorBoundary: false, // Don't throw errors to error boundary
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => userApi.getUser(id),
    enabled: !!id,
    retry: 3,
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ["userStats"],
    queryFn: userApi.getUserStats,
    staleTime: 60000, // 1 minute
    retry: 2, // Reduce retries for stats
    select: (data) => {
      console.log("Raw user stats received:", data);
      return {
        ...data,
        total: data?.total || 0,
        active: data?.active || 0,
        inactive: data?.inactive || 0,
        byRole: {
          admin: data?.byRole?.admin || 0,
          user: data?.byRole?.user || 0,
          moderator: data?.byRole?.moderator || 0,
          ...data?.byRole,
        },
      };
    },
    meta: {
      errorBoundary: false,
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserInput) => userApi.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: UpdateUserInput }) =>
      userApi.updateUser(id, userData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
};

// Todo hooks
export const useTodos = (page = 1, limit = 10, user_id?: string) => {
  return useQuery({
    queryKey: ["todos", page, limit, user_id],
    queryFn: () => todoApi.getTodos(page, limit, user_id),
    staleTime: 30000, // 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    select: (data) => ({
      items: data?.items || [],
      total: data?.total || 0,
      page: data?.page || page,
      limit: data?.limit || limit,
    }),
  });
};

export const useTodo = (id: string) => {
  return useQuery({
    queryKey: ["todo", id],
    queryFn: () => todoApi.getTodo(id),
    enabled: !!id,
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todoData: CreateTodoInput) => todoApi.createTodo(todoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, todoData }: { id: string; todoData: UpdateTodoInput }) =>
      todoApi.updateTodo(id, todoData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["todo", variables.id] });
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => todoApi.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export const useToggleTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => todoApi.toggleTodo(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["todo", id] });
    },
  });
};

// Health check hooks
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ["healthCheck"],
    queryFn: async () => {
      const [userHealth, todoHealth] = await Promise.allSettled([
        healthApi.checkUserService(),
        healthApi.checkTodoService(),
      ]);

      return {
        userService:
          userHealth.status === "fulfilled"
            ? {
                status: userHealth.value.status || "unknown",
                service: userHealth.value.service || "user-service",
              }
            : { status: "unhealthy", service: "user-service" },
        todoService:
          todoHealth.status === "fulfilled"
            ? {
                status: todoHealth.value.status || "unknown",
                service: todoHealth.value.service || "todo-service",
              }
            : { status: "unhealthy", service: "todo-service" },
      };
    },
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 10000, // 10 seconds
    retry: 1, // Don't retry health checks too aggressively
  });
};
