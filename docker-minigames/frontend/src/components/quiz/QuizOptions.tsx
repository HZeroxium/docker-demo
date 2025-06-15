import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";

interface QuizOptionsProps {
  options: string[];
  selectedOption: number | null;
  feedbackShow: boolean;
  feedbackCorrect: boolean;
  correctAnswer?: number;
  isSubmitting: boolean;
  isTimeUp: boolean;
  onOptionSelect: (index: number) => void;
}

const QuizOptions: React.FC<QuizOptionsProps> = ({
  options,
  selectedOption,
  feedbackShow,
  feedbackCorrect,
  correctAnswer,
  isSubmitting,
  isTimeUp,
  onOptionSelect,
}) => {
  const getOptionStyle = (index: number) => {
    if (feedbackShow) {
      if (correctAnswer === index) {
        return {
          backgroundColor: "rgba(76, 175, 80, 0.3)",
          border: "2px solid #4caf50",
        };
      }
      if (selectedOption === index && !feedbackCorrect) {
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
      if (selectedOption === index) {
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

  const getOptionClass = (index: number) => {
    if (feedbackShow) {
      if (correctAnswer === index) return "correct-answer";
      if (selectedOption === index && !feedbackCorrect) return "wrong-answer";
      return "";
    } else {
      return selectedOption === index ? "pulse" : "";
    }
  };

  const getCircleStyle = (index: number) => {
    if (feedbackShow) {
      if (correctAnswer === index) return "#4caf50";
      if (selectedOption === index && !feedbackCorrect) return "#f44336";
      return "rgba(255, 255, 255, 0.2)";
    } else {
      return selectedOption === index ? "#00d4ff" : "rgba(255, 255, 255, 0.2)";
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      {options.map((option, index) => (
        <Card
          key={index}
          className={`glass-button ${getOptionClass(index)}`}
          sx={{
            mb: 2,
            cursor:
              feedbackShow || isSubmitting || isTimeUp ? "default" : "pointer",
            ...getOptionStyle(index),
            transition: "all 0.3s ease",
            opacity: isTimeUp && !feedbackShow ? 0.6 : 1,
          }}
          onClick={() => onOptionSelect(index)}
        >
          <CardContent sx={{ py: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                sx={{
                  minWidth: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: getCircleStyle(index),
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                  mr: 2,
                }}
              >
                {String.fromCharCode(65 + index)}
              </Typography>
              <Typography variant="body1" sx={{ flexGrow: 1 }}>
                {option}
              </Typography>
              {feedbackShow && correctAnswer === index && (
                <CheckCircle sx={{ color: "#4caf50", ml: 1 }} />
              )}
              {feedbackShow &&
                selectedOption === index &&
                !feedbackCorrect &&
                correctAnswer !== index && (
                  <Cancel sx={{ color: "#f44336", ml: 1 }} />
                )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default QuizOptions;
