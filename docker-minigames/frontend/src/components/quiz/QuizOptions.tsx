import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import type { ShuffleMapping } from "../../utils/shuffleUtils";

interface QuizOptionsProps {
  options: string[];
  selectedOption: number | null; // This is the SHUFFLED index
  feedbackShow: boolean;
  feedbackCorrect: boolean;
  correctAnswer?: number; // This is the ORIGINAL index from backend
  isSubmitting: boolean;
  isTimeUp: boolean;
  shuffleMapping: ShuffleMapping;
  onOptionSelect: (shuffledIndex: number) => void; // Callback expects shuffled index
}

const QuizOptions: React.FC<QuizOptionsProps> = ({
  // options,
  selectedOption,
  feedbackShow,
  feedbackCorrect,
  correctAnswer,
  isSubmitting,
  isTimeUp,
  shuffleMapping,
  onOptionSelect,
}) => {
  const getOptionStyle = (shuffledIndex: number) => {
    if (feedbackShow && correctAnswer !== undefined) {
      // Map correct answer from original to shuffled index for display
      const correctAnswerShuffledIndex =
        shuffleMapping.originalToShuffled.get(correctAnswer);

      if (correctAnswerShuffledIndex === shuffledIndex) {
        return {
          backgroundColor: "rgba(76, 175, 80, 0.3)",
          border: "2px solid #4caf50",
        };
      }
      if (selectedOption === shuffledIndex && !feedbackCorrect) {
        return {
          backgroundColor: "rgba(244, 67, 54, 0.3)",
          border: "2px solid #f44336",
        };
      }
      return {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      };
    } else {
      if (selectedOption === shuffledIndex) {
        return {
          backgroundColor: "rgba(0, 212, 255, 0.2)",
          border: "2px solid #00d4ff",
        };
      }
      return {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      };
    }
  };

  const getOptionClass = (shuffledIndex: number) => {
    if (feedbackShow && correctAnswer !== undefined) {
      const correctAnswerShuffledIndex =
        shuffleMapping.originalToShuffled.get(correctAnswer);

      if (correctAnswerShuffledIndex === shuffledIndex) return "correct-answer";
      if (selectedOption === shuffledIndex && !feedbackCorrect)
        return "wrong-answer";
      return "";
    } else {
      return selectedOption === shuffledIndex ? "pulse" : "";
    }
  };

  const getCircleStyle = (shuffledIndex: number) => {
    if (feedbackShow && correctAnswer !== undefined) {
      const correctAnswerShuffledIndex =
        shuffleMapping.originalToShuffled.get(correctAnswer);

      if (correctAnswerShuffledIndex === shuffledIndex) return "#4caf50";
      if (selectedOption === shuffledIndex && !feedbackCorrect)
        return "#f44336";
      return "rgba(255, 255, 255, 0.2)";
    } else {
      return selectedOption === shuffledIndex
        ? "#00d4ff"
        : "rgba(255, 255, 255, 0.2)";
    }
  };

  const getOptionIcon = (shuffledIndex: number) => {
    if (!feedbackShow || correctAnswer === undefined) return null;

    const correctAnswerShuffledIndex =
      shuffleMapping.originalToShuffled.get(correctAnswer);

    if (correctAnswerShuffledIndex === shuffledIndex) return <CheckCircle />;
    if (selectedOption === shuffledIndex && !feedbackCorrect) return <Cancel />;
    return null;
  };

  return (
    <Box sx={{ mb: 4 }}>
      {shuffleMapping.shuffledOptions.map((shuffledOption) => (
        <Card
          key={shuffledOption.shuffledIndex}
          className={`glass-button ${getOptionClass(
            shuffledOption.shuffledIndex
          )}`}
          sx={{
            mb: 2,
            cursor:
              feedbackShow || isSubmitting || isTimeUp ? "default" : "pointer",
            ...getOptionStyle(shuffledOption.shuffledIndex),
            transition: "all 0.3s ease",
            opacity: isTimeUp && !feedbackShow ? 0.6 : 1,
          }}
          onClick={() => onOptionSelect(shuffledOption.shuffledIndex)}
        >
          <CardContent sx={{ py: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                sx={{
                  minWidth: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: getCircleStyle(shuffledOption.shuffledIndex),
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                  mr: 2,
                }}
              >
                {String.fromCharCode(65 + shuffledOption.shuffledIndex)}
              </Typography>
              <Typography variant="body1" sx={{ flexGrow: 1 }}>
                {shuffledOption.text}
              </Typography>
              {getOptionIcon(shuffledOption.shuffledIndex)}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default QuizOptions;
