import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { Card } from "@/components/ui/Card";

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: "primary" | "secondary" | "success" | "warning" | "error";
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: "up" | "down";
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  color = "primary",
  icon,
  trend,
}) => {
  return (
    <Card>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color={`${color}.main`}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: `${color}.light`,
              color: `${color}.main`,
            }}
          >
            {icon}
          </Box>
        )}
      </Box>

      {trend && (
        <Box display="flex" alignItems="center" gap={1}>
          <Chip
            label={`${trend.direction === "up" ? "+" : "-"}${trend.value}%`}
            size="small"
            color={trend.direction === "up" ? "success" : "error"}
            variant="outlined"
          />
          <Typography variant="caption" color="text.secondary">
            {trend.label}
          </Typography>
        </Box>
      )}
    </Card>
  );
};
