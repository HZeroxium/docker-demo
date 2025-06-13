import React from "react";
import {
  TextField,
  TextFieldProps,
  FormControl,
  FormLabel,
  FormHelperText,
} from "@mui/material";
import { styled } from "@mui/material/styles";

interface InputProps extends Omit<TextFieldProps, "variant"> {
  label?: string;
  helperText?: string;
  error?: boolean;
}

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.spacing(1),
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
}));

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  ...props
}) => {
  return (
    <FormControl fullWidth error={error}>
      {label && (
        <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
          {label}
        </FormLabel>
      )}
      <StyledTextField variant="outlined" error={error} {...props} />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};
