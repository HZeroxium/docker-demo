import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
} from "@mui/x-data-grid";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useTodos, useDeleteTodo, useToggleTodo } from "@/hooks/useApi";
import { Todo } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate, getPriorityColor } from "@/lib/utils";

interface TodoListProps {
  onCreateTodo: () => void;
  onEditTodo: (todo: Todo) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  onCreateTodo,
  onEditTodo,
}) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, error } = useTodos(page + 1, pageSize);
  const deleteTodoMutation = useDeleteTodo();
  const toggleTodoMutation = useToggleTodo();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this todo?")) {
      try {
        await deleteTodoMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete todo:", error);
      }
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleTodoMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to toggle todo:", error);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "completed",
      headerName: "Done",
      width: 80,
      renderCell: (params) => (
        <Checkbox
          checked={params.value}
          onChange={() => handleToggle(params.row.id)}
          color="primary"
        />
      ),
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography
          sx={{
            textDecoration: params.row.completed ? "line-through" : "none",
            opacity: params.row.completed ? 0.6 : 1,
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || "No description"}
        </Typography>
      ),
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: getPriorityColor(params.value),
            color: "white",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      width: 180,
      renderCell: (params) =>
        params.value ? formatDate(params.value) : "No due date",
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
          onClick={() => onEditTodo(params.row)}
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
        Failed to load todos. Please check if the backend services are running.
      </Alert>
    );
  }

  return (
    <Card
      title="Todo Management"
      subtitle="Manage todos through the API Gateway"
      actions={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateTodo}
        >
          Add Todo
        </Button>
      }
    >
      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={data?.items || []}
          columns={columns}
          loading={isLoading}
          rowCount={data?.total || 0}
          page={page}
          pageSize={pageSize}
          paginationMode="server"
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
          loadingOverlay={CircularProgress}
        />
      </Box>
    </Card>
  );
};
