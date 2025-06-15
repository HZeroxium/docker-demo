import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Container,
} from "@mui/material";
import { PlayArrow, Person } from "@mui/icons-material";
import { useGame } from "../../contexts/GameContext";
import { gameApi } from "../../services/api";

const JoinScreen: React.FC = () => {
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { dispatch } = useGame();
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (playerName.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const player = await gameApi.joinGame({ name: playerName.trim() });
      dispatch({ type: "SET_PLAYER", payload: player });
      dispatch({ type: "SET_GAME_STATUS", payload: "playing" });
      navigate("/quiz");
    } catch (err) {
      setError("Failed to join the game. Please try again.");
      console.error("Join game error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper className="glass-card slide-up" sx={{ p: 4, textAlign: "center" }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(45deg, #00d4ff, #ff6b35)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome! 🚀
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Test your Docker knowledge and compete with others in real-time!
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleJoin} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            variant="outlined"
            autoFocus
            disabled={loading}
            InputProps={{
              startAdornment: (
                <Person sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
              },
            }}
          />

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2, backgroundColor: "rgba(244, 67, 54, 0.1)" }}
            >
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !playerName.trim()}
            startIcon={<PlayArrow />}
            className="glass-button pulse"
            sx={{
              py: 1.5,
              px: 4,
              fontSize: "1.1rem",
              fontWeight: "bold",
              background: "linear-gradient(45deg, #00d4ff, #ff6b35)",
              "&:hover": {
                background: "linear-gradient(45deg, #00b8e6, #e55a2b)",
              },
            }}
          >
            {loading ? "Joining..." : "Start Quiz"}
          </Button>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 3, opacity: 0.7 }}
        >
          Real-time leaderboard • Multiple choice questions • Instant feedback
        </Typography>
      </Paper>
    </Container>
  );
};

export default JoinScreen;
