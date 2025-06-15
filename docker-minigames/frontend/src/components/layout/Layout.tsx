import React from "react";
import { Container, Box, Typography, Chip } from "@mui/material";
import { useSocket } from "../../contexts/SocketContext";
import { useGame } from "../../contexts/GameContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isConnected } = useSocket();
  const { state } = useGame();

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(45deg, #00d4ff, #ff6b35)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 30px rgba(0, 212, 255, 0.5)",
          }}
        >
          🐳 Docker Quiz Game
        </Typography>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Chip
            label={isConnected ? "Connected" : "Disconnected"}
            color={isConnected ? "success" : "error"}
            variant="outlined"
            size="small"
          />
          {state.currentPlayer && (
            <Chip
              label={`${state.currentPlayer.name} - ${state.currentPlayer.score} pts`}
              color="primary"
              variant="filled"
              size="small"
            />
          )}
        </Box>
      </Box>

      <Box className="fade-in">{children}</Box>
    </Container>
  );
};

export default Layout;
