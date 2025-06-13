import React from "react";
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";

interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
  loadingText?: string;
}

const StyledButton = styled(MuiButton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  textTransform: "none",
  fontWeight: 600,
  minHeight: 40,
  position: "relative",
}));

export const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  loadingText = "Loading...",
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      {...props}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} /> : props.startIcon}
    >
      {loading ? loadingText : children}
    </StyledButton>
  );
};
