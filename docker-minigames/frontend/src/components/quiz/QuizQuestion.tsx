import React from "react";
import { Typography } from "@mui/material";

interface QuizQuestionProps {
  question: string;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ question }) => {
  return (
    <Typography
      variant="h5"
      component="h2"
      gutterBottom
      sx={{ mb: 4, fontWeight: "bold" }}
    >
      {question}
    </Typography>
  );
};

export default QuizQuestion;
