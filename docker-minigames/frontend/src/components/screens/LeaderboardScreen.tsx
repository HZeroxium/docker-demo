import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Typography,
  Box,
  Button,
  Container,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Alert,
} from "@mui/material";
import { EmojiEvents, Refresh, Home, Person } from "@mui/icons-material";
import { useGame } from "../../contexts/GameContext";
import { gameApi } from "../../services/api";

const LeaderboardScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError("");
      const leaderboard = await gameApi.getLeaderboard();
      dispatch({ type: "UPDATE_LEADERBOARD", payload: leaderboard });
    } catch (err: any) {
      setError(err.message || "Failed to load leaderboard");
      console.error("Load leaderboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `#${index + 1}`;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "#ffd700";
      case 1:
        return "#c0c0c0";
      case 2:
        return "#cd7f32";
      default:
        return "text.secondary";
    }
  };

  const currentPlayerRank = state.currentPlayer
    ? state.players.findIndex((p) => p.id === state.currentPlayer?.id) + 1
    : 0;

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Paper className="glass-card slide-up" sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <EmojiEvents
            sx={{
              fontSize: 64,
              color: "#ffd700",
              mb: 2,
              filter: "drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))",
            }}
          />
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(45deg, #ffd700, #ff6b35)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Leaderboard
          </Typography>

          {state.currentPlayer && (
            <Box sx={{ mb: 2 }}>
              <Chip
                label={`Your Score: ${state.currentPlayer.score} points`}
                color="primary"
                variant="filled"
                sx={{ mr: 1 }}
              />
              {currentPlayerRank > 0 && (
                <Chip
                  label={`Rank: ${getRankIcon(currentPlayerRank - 1)}`}
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button onClick={loadLeaderboard} size="small" sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        )}

        {/* Leaderboard List */}
        {state.players.length > 0 ? (
          <List sx={{ mb: 3 }}>
            {state.players.map((player, index) => (
              <ListItem
                key={player.id}
                className={
                  player.id === state.currentPlayer?.id ? "pulse" : "fade-in"
                }
                sx={{
                  mb: 2,
                  backgroundColor:
                    player.id === state.currentPlayer?.id
                      ? "rgba(0, 212, 255, 0.1)"
                      : "rgba(255, 255, 255, 0.05)",
                  borderRadius: 2,
                  border:
                    player.id === state.currentPlayer?.id
                      ? "2px solid #00d4ff"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "all 0.3s ease",
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      backgroundColor: getRankColor(index),
                      color: index < 3 ? "#000" : "#fff",
                      fontWeight: "bold",
                      fontSize: index < 3 ? "1.2rem" : "1rem",
                    }}
                  >
                    {index < 3 ? getRankIcon(index) : <Person />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="h6"
                        component="span"
                        sx={{ fontWeight: "bold" }}
                      >
                        {player.name}
                      </Typography>
                      {player.id === state.currentPlayer?.id && (
                        <Chip
                          label="You"
                          size="small"
                          color="primary"
                          variant="filled"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Rank #{index + 1}
                      {player.joined_at && (
                        <>
                          {" "}
                          • Joined{" "}
                          {new Date(player.joined_at).toLocaleTimeString()}
                        </>
                      )}
                    </Typography>
                  }
                />
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      color: getRankColor(index),
                    }}
                  >
                    {player.score}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    points
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No players yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to join the game!
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadLeaderboard}
            disabled={loading}
            className="glass-button"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>

          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate("/")}
            className="glass-button"
            sx={{
              background: "linear-gradient(45deg, #00d4ff, #ff6b35)",
              "&:hover": {
                background: "linear-gradient(45deg, #00b8e6, #e55a2b)",
              },
            }}
          >
            New Game
          </Button>
        </Box>

        {/* Live Updates Info */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            🔴 Live updates • Leaderboard refreshes automatically
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LeaderboardScreen;
