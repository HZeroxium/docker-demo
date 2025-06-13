import React, { useState } from "react";
import {
  Box,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
  GridPaginationModel,
} from "@mui/x-data-grid";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { useUsers, useDeleteUser } from "@/hooks/useApi";
import { User } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate, getRoleColor } from "@/lib/utils";

interface UserListProps {
  onCreateUser: () => void;
  onEditUser: (user: User) => void;
}

export const UserList: React.FC<UserListProps> = ({
  onCreateUser,
  onEditUser,
}) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useUsers(
    paginationModel.page + 1,
    paginationModel.pageSize,
    search
  );
  const deleteUserMutation = useDeleteUser();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUserMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "role",
      headerName: "Role",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: getRoleColor(params.value),
            color: "white",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Active" : "Inactive"}
          size="small"
          color={params.value ? "success" : "default"}
          variant="outlined"
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 180,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => onEditUser(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.row.id)}
        />,
      ],
    },
  ];

  if (error) {
    return (
      <Alert severity="error">
        Failed to load users. Please check if the backend services are running.
      </Alert>
    );
  }

  return (
    <Card
      title="User Management"
      subtitle="Manage users through the API Gateway"
      actions={
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={onCreateUser}
        >
          Add User
        </Button>
      }
    >
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={data?.items || []}
          columns={columns}
          loading={isLoading}
          rowCount={data?.total || 0}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
          slots={{
            loadingOverlay: () => <CircularProgress />,
          }}
        />
      </Box>
    </Card>
  );
};
