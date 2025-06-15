import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Chip,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import type { Question } from "../../contexts/GameContext";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (selectedOption: number) => void;
  disabled?: boolean;
  showResult?: {
    isCorrect: boolean;
    correctAnswer?: number;
  };
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  disabled = false,
  showResult,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleSubmit = () => {
    if (selectedOption !== null) {
      onAnswer(selectedOption);
    }
  };

  const getOptionColor = (index: number) => {
    if (!showResult) return "default";
    if (showResult.correctAnswer === index) return "success";
    if (selectedOption === index && !showResult.isCorrect) return "error";
    return "default";
  };

  const getOptionIcon = (index: number) => {
    if (!showResult) return null;
    if (showResult.correctAnswer === index) return <CheckCircle />;
    if (selectedOption === index && !showResult.isCorrect) return <Cancel />;
    return null;
  };

  return (
    <Paper
      className="glass-card slide-up"
      sx={{ p: 4, maxWidth: 800, mx: "auto" }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Chip
          label={`Question ${questionNumber} of ${totalQuestions}`}
          color="primary"
          variant="outlined"
        />
        {showResult && (
          <Chip
            icon={showResult.isCorrect ? <CheckCircle /> : <Cancel />}
            label={showResult.isCorrect ? "Correct!" : "Wrong!"}
            color={showResult.isCorrect ? "success" : "error"}
            className={showResult.isCorrect ? "correct-answer" : "wrong-answer"}
          />
        )}
      </Box>

      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ mb: 4, fontWeight: 600 }}
      >
        {question.question}
      </Typography>

      <FormControl component="fieldset" fullWidth disabled={disabled}>
        <RadioGroup
          value={selectedOption}
          onChange={(e) => setSelectedOption(Number(e.target.value))}
        >
          {question.options.map((option, index) => (
            <FormControlLabel
              key={index}
              value={index}
              control={<Radio />}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography>{option}</Typography>
                  {getOptionIcon(index)}
                </Box>
              }
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 2,
                border: "1px solid transparent",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                },
                ...(showResult && {
                  backgroundColor:
                    getOptionColor(index) === "success"
                      ? "rgba(76, 175, 80, 0.2)"
                      : getOptionColor(index) === "error"
                      ? "rgba(244, 67, 54, 0.2)"
                      : "rgba(255, 255, 255, 0.05)",
                }),
              }}
            />
          ))}
        </RadioGroup>
      </FormControl>

      {!showResult && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={selectedOption === null || disabled}
            className="glass-button"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              background: "linear-gradient(45deg, #00d4ff, #ff6b35)",
            }}
          >
            Submit Answer
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default QuestionCard;
