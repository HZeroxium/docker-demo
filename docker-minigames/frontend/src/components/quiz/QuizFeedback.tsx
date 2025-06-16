import React from "react";
import { Alert, Typography } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";

interface QuizFeedbackProps {
  show: boolean;
  correct: boolean;
  message?: string;
  showCorrectAnswer?: boolean; // Option to show correct answer (for future use)
  correctAnswer?: number;
  options?: string[];
}

const QuizFeedback: React.FC<QuizFeedbackProps> = ({
  show,
  correct,
  message,
}) => {
  if (!show) return null;

  const getEncouragingMessage = () => {
    const encouragingMessages = [
      "Don't worry, every expert was once a beginner! 💪",
      "Great effort! Learning comes from trying. 🌟",
      "Close one! You're getting better with each question. 🎯",
      "Nice try! Keep up the great work! 🚀",
      "Almost there! Practice makes perfect. ⭐",
    ];

    return encouragingMessages[
      Math.floor(Math.random() * encouragingMessages.length)
    ];
  };

  return (
    <Alert
      severity={correct ? "success" : "info"} // Changed from "error" to "info" for better UX
      sx={{ mb: 3 }}
      icon={correct ? <CheckCircle /> : <Cancel />}
    >
      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
        {correct ? "🎉 Excellent! Well done!" : "🤔 Not quite right this time"}
      </Typography>

      {/* Custom message or timeout message */}
      {message && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          {message}
        </Typography>
      )}

      {/* Encouraging message for incorrect answers */}
      {!correct && (
        <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
          {getEncouragingMessage()}
        </Typography>
      )}

      {/* Optional: Show correct answer (commented out for better UX) */}
      {/* {!correct && showCorrectAnswer && correctAnswer !== undefined && options && (
        <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
          The correct answer was:{" "}
          {String.fromCharCode(65 + correctAnswer)}) {options[correctAnswer]}
        </Typography>
      )} */}
    </Alert>
  );
};

export default QuizFeedback;
