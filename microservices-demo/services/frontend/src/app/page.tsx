"use client";

import React, { useState } from "react";
import { Box, Grid, Typography, Alert, Chip, Paper } from "@mui/material";
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
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

  const { data: userStats, isLoading: statsLoading } = useUserStats();
  const { data: healthData } = useHealthCheck();

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
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Service Health Status
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Chip
                icon={
                  healthData?.userService ? <CheckCircleIcon /> : <ErrorIcon />
                }
                label={`User Service: ${
                  healthData?.userService?.status || "Disconnected"
                }`}
                color={healthData?.userService ? "success" : "error"}
                variant="outlined"
              />
              <Chip
                icon={
                  healthData?.todoService ? <CheckCircleIcon /> : <ErrorIcon />
                }
                label={`Todo Service: ${
                  healthData?.todoService?.status || "Disconnected"
                }`}
                color={healthData?.todoService ? "success" : "error"}
                variant="outlined"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Statistics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Users"
            value={userStats?.total || 0}
            subtitle="Registered users"
            color="primary"
            icon={<PeopleIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Users"
            value={userStats?.active || 0}
            subtitle="Currently active"
            color="success"
            icon={<CheckCircleIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Inactive Users"
            value={userStats?.inactive || 0}
            subtitle="Inactive accounts"
            color="warning"
            icon={<ErrorIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Admin Users"
            value={userStats?.byRole?.admin || 0}
            subtitle="System administrators"
            color="error"
            icon={<PeopleIcon />}
          />
        </Grid>
      </Grid>

      {/* User Management */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <UserList
            onCreateUser={handleCreateUser}
            onEditUser={handleEditUser}
          />
        </Grid>
      </Grid>

      {/* Todo Management */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
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
