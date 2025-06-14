import React, { useState } from "react";
import { Box, MenuItem, Alert } from "@mui/material";
import { useCreateTodo, useUpdateTodo, useUsers } from "@/hooks/useApi";
import {
  Todo,
  CreateTodoInput,
  UpdateTodoInput,
  TodoPriority,
  MutationError,
} from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface CreateTodoModalProps {
  open: boolean;
  onClose: () => void;
  todo?: Todo; // If provided, this is an edit operation
}

export const CreateTodoModal: React.FC<CreateTodoModalProps> = ({
  open,
  onClose,
  todo,
}) => {
  const [formData, setFormData] = useState({
    title: todo?.title || "",
    description: todo?.description || "",
    priority: todo?.priority || ("medium" as const),
    due_date: todo?.due_date ? todo.due_date.split("T")[0] : "", // Changed from dueDate to due_date
    user_id: todo?.user_id || "", // Changed from userId to user_id
    completed: todo?.completed || false,
  });
  const [error, setError] = useState<string | null>(null);

  const { data: usersData } = useUsers(1, 100); // Get users for selection
  const createTodoMutation = useCreateTodo();
  const updateTodoMutation = useUpdateTodo();

  const isEditing = !!todo;
  const mutation = isEditing ? updateTodoMutation : createTodoMutation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.user_id) {
      // Changed from userId to user_id
      setError("Please select a user");
      return;
    }

    try {
      if (isEditing) {
        const updateData: UpdateTodoInput = {
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          due_date: formData.due_date || undefined, // Changed from dueDate to due_date
          completed: formData.completed,
        };
        await updateTodoMutation.mutateAsync({
          id: todo.id,
          todoData: updateData,
        });
      } else {
        const createData: CreateTodoInput = {
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          due_date: formData.due_date || undefined, // Changed from dueDate to due_date
          user_id: formData.user_id, // Changed from userId to user_id
        };
        await createTodoMutation.mutateAsync(createData);
      }

      handleClose();
    } catch (err) {
      const error = err as MutationError;
      setError(
        error.response?.data?.message || error.message || "An error occurred"
      );
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      due_date: "", // Changed from dueDate to due_date
      user_id: "", // Changed from userId to user_id
      completed: false,
    });
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? "Edit Todo" : "Create New Todo"}
      actions={
        <Box display="flex" gap={2}>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            loading={mutation.isPending}
            loadingText={isEditing ? "Updating..." : "Creating..."}
          >
            {isEditing ? "Update Todo" : "Create Todo"}
          </Button>
        </Box>
      }
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          fullWidth
        />

        <Input
          label="Description"
          multiline
          rows={3}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          fullWidth
        />

        <Input
          label="Priority"
          select
          value={formData.priority}
          onChange={(e) =>
            setFormData({
              ...formData,
              priority: e.target.value as TodoPriority,
            })
          }
          fullWidth
        >
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
        </Input>

        <Input
          label="Due Date"
          type="date"
          value={formData.due_date} // Changed from dueDate to due_date
          onChange={
            (e) => setFormData({ ...formData, due_date: e.target.value }) // Changed from dueDate to due_date
          }
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        {!isEditing && (
          <Input
            label="Assign to User"
            select
            value={formData.user_id} // Changed from userId to user_id
            onChange={
              (e) => setFormData({ ...formData, user_id: e.target.value }) // Changed from userId to user_id
            }
            required
            fullWidth
          >
            {usersData?.items.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name} ({user.email})
              </MenuItem>
            ))}
          </Input>
        )}

        {isEditing && (
          <Input
            label="Status"
            select
            value={formData.completed}
            onChange={(e) =>
              setFormData({ ...formData, completed: e.target.value === "true" })
            }
            fullWidth
          >
            <MenuItem value="false">Pending</MenuItem>
            <MenuItem value="true">Completed</MenuItem>
          </Input>
        )}
      </Box>
    </Modal>
  );
};
