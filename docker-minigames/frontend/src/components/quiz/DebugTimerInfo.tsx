import React from "react";
import { Box, Typography } from "@mui/material";

interface DebugTimerInfoProps {
  isActive: boolean;
  timeRemaining: number;
  timerProgress: number;
  questionStartTime: number | null;
  feedbackShow: boolean;
  isTimeUp: boolean;
}

const DebugTimerInfo: React.FC<DebugTimerInfoProps> = ({
  isActive,
  timeRemaining,
  timerProgress,
  questionStartTime,
  feedbackShow,
  isTimeUp,
}) => {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Box
      sx={{
        mb: 2,
        p: 1,
        bgcolor: isActive ? "rgba(76, 175, 80, 0.1)" : "rgba(244, 67, 54, 0.1)",
        borderRadius: 1,
        border: isActive ? "1px solid #4caf50" : "1px solid #f44336",
      }}
    >
      <Typography variant="caption" display="block">
        <strong>Debug Timer Status:</strong>
      </Typography>
      <Typography variant="caption" display="block">
        Active: <strong>{isActive ? "✅ YES" : "❌ NO"}</strong> | Time:{" "}
        <strong>{timeRemaining}s</strong> | Progress:{" "}
        <strong>{Math.round(timerProgress)}%</strong>
      </Typography>
      <Typography variant="caption" display="block">
        Question Start:{" "}
        <strong>
          {questionStartTime
            ? new Date(questionStartTime).toLocaleTimeString()
            : "Not Set"}
        </strong>
      </Typography>
      <Typography variant="caption" display="block">
        Feedback Showing: <strong>{feedbackShow ? "Yes" : "No"}</strong> | Time
        Up: <strong>{isTimeUp ? "Yes" : "No"}</strong>
      </Typography>
    </Box>
  );
};

export default DebugTimerInfo;
