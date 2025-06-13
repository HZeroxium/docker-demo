import React from "react";
import {
  Card as MuiCard,
  CardProps as MuiCardProps,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

interface CardProps extends MuiCardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const StyledCard = styled(MuiCard)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
  transition: theme.transitions.create(["box-shadow"], {
    duration: theme.transitions.duration.short,
  }),
}));

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  children,
  ...props
}) => {
  return (
    <StyledCard {...props}>
      {(title || subtitle) && (
        <CardHeader
          title={
            title && (
              <Typography variant="h6" component="h2" fontWeight={600}>
                {title}
              </Typography>
            )
          }
          subheader={subtitle}
        />
      )}
      <CardContent>{children}</CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </StyledCard>
  );
};
