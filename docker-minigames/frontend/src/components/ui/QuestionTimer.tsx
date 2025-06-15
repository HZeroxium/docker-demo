import React, { memo } from "react";
import { Box, Typography, LinearProgress, Alert, Chip } from "@mui/material";
import { AccessTime, Warning, PlayArrow, Pause } from "@mui/icons-material";

interface QuestionTimerProps {
  timeRemaining: number;
  totalTime: number;
  isActive: boolean;
  progress: number;
}

const QuestionTimer: React.FC<QuestionTimerProps> = memo(
  ({ timeRemaining, totalTime, isActive, progress }) => {
    const isLowTime = timeRemaining <= 10;
    const isCriticalTime = timeRemaining <= 5;

    const getTimerColor = () => {
      if (isCriticalTime) return "error";
      if (isLowTime) return "warning";
      return "primary";
    };

    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return mins > 0
        ? `${mins}:${secs.toString().padStart(2, "0")}`
        : `${secs}`;
    };

    return (
      <Box sx={{ mb: 3 }}>
        {/* Timer Display with Status Indicator */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <AccessTime
            color={getTimerColor()}
            sx={{
              fontSize: "1.2rem",
              animation:
                isCriticalTime && isActive ? "pulse 1s infinite" : "none",
            }}
          />
          <Typography
            variant="h6"
            color={getTimerColor()}
            sx={{
              fontWeight: "bold",
              minWidth: "60px",
              textAlign: "center",
              animation:
                isCriticalTime && isActive ? "pulse 1s infinite" : "none",
              "@keyframes pulse": {
                "0%": { opacity: 1 },
                "50%": { opacity: 0.5 },
                "100%": { opacity: 1 },
              },
            }}
          >
            {formatTime(timeRemaining)}
          </Typography>

          {/* Enhanced Status Indicator */}
          <Chip
            icon={isActive ? <PlayArrow /> : <Pause />}
            label={isActive ? "Active" : "Paused"}
            size="small"
            color={isActive ? "success" : "default"}
            variant={isActive ? "filled" : "outlined"}
            sx={{
              fontSize: "0.7rem",
              height: "20px",
              "& .MuiChip-icon": {
                fontSize: "0.8rem",
              },
            }}
          />
        </Box>

        {/* Enhanced Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={Math.min(progress, 100)}
          color={getTimerColor()}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              transition: isActive ? "transform 1s linear" : "none",
              background: isActive
                ? `linear-gradient(45deg, ${
                    isCriticalTime
                      ? "#f44336, #ff9800"
                      : isLowTime
                      ? "#ff9800, #ffc107"
                      : "#4caf50, #2196f3"
                  })`
                : "rgba(158, 158, 158, 0.6)",
            },
            opacity: isActive ? 1 : 0.6,
          }}
        />

        {/* Timer Status Info */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {Math.round(((totalTime - timeRemaining) / totalTime) * 100)}%
            elapsed
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {totalTime}s total
          </Typography>
        </Box>

        {/* Low Time Warning */}
        {isLowTime && isActive && timeRemaining > 0 && (
          <Alert
            severity={isCriticalTime ? "error" : "warning"}
            icon={<Warning />}
            sx={{
              mt: 2,
              backgroundColor: isCriticalTime
                ? "rgba(244, 67, 54, 0.1)"
                : "rgba(255, 193, 7, 0.1)",
              border: isCriticalTime
                ? "1px solid rgba(244, 67, 54, 0.3)"
                : "1px solid rgba(255, 193, 7, 0.3)",
              "& .MuiAlert-icon": {
                animation: "pulse 1s infinite",
              },
            }}
          >
            <Typography variant="body2">
              {isCriticalTime
                ? "⚠️ Last chance! Submit your answer now!"
                : "⏰ Time is running out!"}
            </Typography>
          </Alert>
        )}

        {/* Timer Inactive Warning */}
        {!isActive && timeRemaining > 0 && (
          <Alert severity="info" sx={{ mt: 1 }}>
            <Typography variant="body2">
              ⏸️ Timer is paused - waiting for question to load
            </Typography>
          </Alert>
        )}
      </Box>
    );
  }
);

QuestionTimer.displayName = "QuestionTimer";

export default QuestionTimer;
