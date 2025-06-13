import React, { useState } from "react";
import { Box, MenuItem, Alert } from "@mui/material";
import { useCreateUser, useUpdateUser } from "@/hooks/useApi";
import { User, CreateUserInput, UpdateUserInput } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  user?: User; // If provided, this is an edit operation
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  open,
  onClose,
  user,
}) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    role: user?.role || ("user" as const),
    isActive: user?.isActive ?? true,
  });
  const [error, setError] = useState<string | null>(null);

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const isEditing = !!user;
  const mutation = isEditing ? updateUserMutation : createUserMutation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isEditing) {
        const updateData: UpdateUserInput = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        };
        await updateUserMutation.mutateAsync({
          id: user.id,
          userData: updateData,
        });
      } else {
        if (!formData.password) {
          setError("Password is required for new users");
          return;
        }
        const createData: CreateUserInput = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };
        await createUserMutation.mutateAsync(createData);
      }

      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
      isActive: true,
    });
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? "Edit User" : "Create New User"}
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
            {isEditing ? "Update User" : "Create User"}
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
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          fullWidth
        />

        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          fullWidth
        />

        {!isEditing && (
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            fullWidth
            helperText="Minimum 6 characters"
          />
        )}

        <Input
          label="Role"
          select
          value={formData.role}
          onChange={(e) =>
            setFormData({ ...formData, role: e.target.value as any })
          }
          fullWidth
        >
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="moderator">Moderator</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Input>

        {isEditing && (
          <Input
            label="Status"
            select
            value={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.value === "true" })
            }
            fullWidth
          >
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </Input>
        )}
      </Box>
    </Modal>
  );
};
