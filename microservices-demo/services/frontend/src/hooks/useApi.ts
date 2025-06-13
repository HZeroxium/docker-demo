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
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => userApi.getUser(id),
    enabled: !!id,
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ["userStats"],
    queryFn: userApi.getUserStats,
    staleTime: 60000, // 1 minute
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
export const useTodos = (page = 1, limit = 10, userId?: string) => {
  return useQuery({
    queryKey: ["todos", page, limit, userId],
    queryFn: () => todoApi.getTodos(page, limit, userId),
    staleTime: 30000, // 30 seconds
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
          userHealth.status === "fulfilled" ? userHealth.value : null,
        todoService:
          todoHealth.status === "fulfilled" ? todoHealth.value : null,
      };
    },
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 10000, // 10 seconds
  });
};
