import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  color?: "primary" | "secondary" | "success" | "warning";
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label,
  color = "primary",
}) => {
  const percentage = (current / total) * 100;

  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      {label && (
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {current}/{total}
          </Typography>
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={color}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          "& .MuiLinearProgress-bar": {
            borderRadius: 4,
            background:
              color === "primary"
                ? "linear-gradient(45deg, #00d4ff, #ff6b35)"
                : undefined,
          },
        }}
      />
    </Box>
  );
};

export default ProgressBar;
