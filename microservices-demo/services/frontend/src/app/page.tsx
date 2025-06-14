"use client";

import React, { useState } from "react";
import { Box, Typography, Chip, Paper, Alert, Button } from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";

import { useUserStats, useHealthCheck } from "@/hooks/useApi";
import { User, Todo } from "@/types";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UserList } from "@/components/users/UserList";
import { CreateUserModal } from "@/components/users/CreateUserModal";
import { TodoList } from "@/components/todos/TodoList";
import { CreateTodoModal } from "@/components/todos/CreateTodoModal";

export default function Dashboard() {
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [todoModalOpen, setTodoModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();

  const {
    data: userStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useUserStats();
  const { data: healthData, refetch: refetchHealth } = useHealthCheck();

  // Debug logging
  React.useEffect(() => {
    console.log("Dashboard - userStats:", userStats);
    console.log("Dashboard - healthData:", healthData);
  }, [userStats, healthData]);

  const handleCreateUser = () => {
    setEditingUser(undefined);
    setUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserModalOpen(true);
  };

  const handleCreateTodo = () => {
    setEditingTodo(undefined);
    setTodoModalOpen(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setTodoModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setUserModalOpen(false);
    setEditingUser(undefined);
  };

  const handleCloseTodoModal = () => {
    setTodoModalOpen(false);
    setEditingTodo(undefined);
  };

  // Safe access to health data with fallbacks
  const userServiceHealth = healthData?.userService || {
    status: "unknown",
    service: "user-service",
  };
  const todoServiceHealth = healthData?.todoService || {
    status: "unknown",
    service: "todo-service",
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Microservices Demo Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Demonstrating NestJS (TypeScript) + FastAPI (Python) microservices
          with Docker, GraphQL, gRPC, and RabbitMQ messaging
        </Typography>
      </Box>

      {/* Health Status */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">Service Health Status</Typography>
              <Button size="small" onClick={() => refetchHealth()}>
                Refresh
              </Button>
            </Box>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Chip
                icon={
                  userServiceHealth?.status === "healthy" ? (
                    <CheckCircleIcon />
                  ) : (
                    <ErrorIcon />
                  )
                }
                label={`User Service: ${
                  userServiceHealth?.status || "Disconnected"
                }`}
                color={
                  userServiceHealth?.status === "healthy" ? "success" : "error"
                }
                variant="outlined"
              />
              <Chip
                icon={
                  todoServiceHealth?.status === "healthy" ? (
                    <CheckCircleIcon />
                  ) : (
                    <ErrorIcon />
                  )
                }
                label={`Todo Service: ${
                  todoServiceHealth?.status || "Disconnected"
                }`}
                color={
                  todoServiceHealth?.status === "healthy" ? "success" : "error"
                }
                variant="outlined"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Total Users"
            value={statsLoading ? "..." : userStats?.total || 0}
            subtitle="Registered users"
            color="primary"
            icon={<PeopleIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Active Users"
            value={statsLoading ? "..." : userStats?.active || 0}
            subtitle="Currently active"
            color="success"
            icon={<CheckCircleIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Inactive Users"
            value={statsLoading ? "..." : userStats?.inactive || 0}
            subtitle="Inactive accounts"
            color="warning"
            icon={<ErrorIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Admin Users"
            value={statsLoading ? "..." : userStats?.byRole?.admin || 0}
            subtitle="System administrators"
            color="error"
            icon={<PeopleIcon />}
          />
        </Grid>
      </Grid>

      {/* Show error if stats failed to load */}
      {statsError && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12 }}>
            <Alert
              severity="warning"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => refetchStats()}
                >
                  Retry
                </Button>
              }
            >
              Unable to load user statistics. The user service may be
              unavailable.
              {process.env.NODE_ENV === "development" && (
                <details style={{ marginTop: "8px" }}>
                  <summary>Error Details</summary>
                  <pre style={{ fontSize: "12px" }}>
                    {statsError instanceof Error
                      ? statsError.message
                      : String(statsError)}
                  </pre>
                </details>
              )}
            </Alert>
          </Grid>
        </Grid>
      )}

      {/* User Management */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <UserList
            onCreateUser={handleCreateUser}
            onEditUser={handleEditUser}
          />
        </Grid>
      </Grid>

      {/* Todo Management */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <TodoList
            onCreateTodo={handleCreateTodo}
            onEditTodo={handleEditTodo}
          />
        </Grid>
      </Grid>

      {/* Modals */}
      <CreateUserModal
        open={userModalOpen}
        onClose={handleCloseUserModal}
        user={editingUser}
      />

      <CreateTodoModal
        open={todoModalOpen}
        onClose={handleCloseTodoModal}
        todo={editingTodo}
      />
    </Box>
  );
}
