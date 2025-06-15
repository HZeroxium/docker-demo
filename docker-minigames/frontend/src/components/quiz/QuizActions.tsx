import React from "react";
import { Box, Button } from "@mui/material";
import { NavigateNext } from "@mui/icons-material";

interface QuizActionsProps {
  feedbackShow: boolean;
  selectedOption: number | null;
  isSubmitting: boolean;
  isTimeUp: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
}

const QuizActions: React.FC<QuizActionsProps> = ({
  feedbackShow,
  selectedOption,
  isSubmitting,
  isTimeUp,
  currentQuestionIndex,
  totalQuestions,
  onSubmitAnswer,
  onNextQuestion,
}) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
      {!feedbackShow ? (
        <Button
          variant="contained"
          size="large"
          onClick={onSubmitAnswer}
          disabled={selectedOption === null || isSubmitting || isTimeUp}
          className="glass-button"
          sx={{
            py: 1.5,
            px: 4,
            background: isTimeUp
              ? "rgba(158, 158, 158, 0.6)"
              : "linear-gradient(45deg, #00d4ff, #ff6b35)",
            "&:hover": {
              background: isTimeUp
                ? "rgba(158, 158, 158, 0.6)"
                : "linear-gradient(45deg, #00b8e6, #e55a2b)",
            },
          }}
        >
          {isSubmitting
            ? "Submitting..."
            : isTimeUp
            ? "Time's Up!"
            : "Submit Answer"}
        </Button>
      ) : (
        <Button
          variant="contained"
          size="large"
          onClick={onNextQuestion}
          endIcon={<NavigateNext />}
          className="glass-button"
          sx={{
            py: 1.5,
            px: 4,
            background: "linear-gradient(45deg, #00d4ff, #ff6b35)",
            "&:hover": {
              background: "linear-gradient(45deg, #00b8e6, #e55a2b)",
            },
          }}
        >
          {currentQuestionIndex < totalQuestions - 1
            ? "Next Question"
            : "View Results"}
        </Button>
      )}
    </Box>
  );
};

export default QuizActions;
