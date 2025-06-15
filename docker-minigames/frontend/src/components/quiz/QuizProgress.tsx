import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";

interface QuizProgressProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  playerScore: number;
  progress: number;
}

const QuizProgress: React.FC<QuizProgressProps> = ({
  currentQuestionIndex,
  totalQuestions,
  playerScore,
  progress,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </Typography>
        <Typography
          variant="body2"
          color="primary"
          fontWeight="bold"
        >{`Score: ${playerScore}`}</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          "& .MuiLinearProgress-bar": {
            background: "linear-gradient(45deg, #00d4ff, #ff6b35)",
          },
        }}
      />
    </Box>
  );
};

export default QuizProgress;
