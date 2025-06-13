import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Divider,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: theme.spacing(2),
    minWidth: 400,
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
}) => {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      {title && (
        <>
          <StyledDialogTitle>
            <Typography variant="h6" component="h2" fontWeight={600}>
              {title}
            </Typography>
            <IconButton onClick={onClose} size="small" sx={{ ml: 2 }}>
              <CloseIcon />
            </IconButton>
          </StyledDialogTitle>
          <Divider />
        </>
      )}

      <DialogContent sx={{ p: 3 }}>{children}</DialogContent>

      {actions && (
        <>
          <Divider />
          <DialogActions sx={{ p: 3, pt: 2 }}>{actions}</DialogActions>
        </>
      )}
    </StyledDialog>
  );
};
