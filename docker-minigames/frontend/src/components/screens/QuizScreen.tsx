import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Typography,
  Box,
  Button,
  LinearProgress,
  Container,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import { CheckCircle, Cancel, NavigateNext } from "@mui/icons-material";
import { useGame } from "../../contexts/GameContext";
import { gameApi } from "../../services/api";

const QuizScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    correct: boolean;
    correctAnswer?: number;
    message?: string;
  }>({
    show: false,
    correct: false,
  });
  const [error, setError] = useState("");

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const progress =
    ((state.currentQuestionIndex + 1) / state.questions.length) * 100;

  useEffect(() => {
    // Redirect if no player
    if (!state.currentPlayer) {
      navigate("/");
      return;
    }

    // Load questions if not loaded
    if (state.questions.length === 0) {
      loadQuestions();
    }
  }, [state.currentPlayer, navigate]);

  const loadQuestions = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const questions = await gameApi.getQuestions();
      dispatch({ type: "SET_QUESTIONS", payload: questions });
    } catch (err) {
      setError("Failed to load questions. Please try again.");
      console.error("Load questions error:", err);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (!feedback.show && !isSubmitting) {
      setSelectedOption(optionIndex);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !state.currentPlayer || !currentQuestion)
      return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await gameApi.submitAnswer({
        player_id: state.currentPlayer.id,
        question_id: currentQuestion.id,
        selected_option: selectedOption,
      });

      setFeedback({
        show: true,
        correct: response.is_correct,
        correctAnswer: response.correct_answer || undefined,
        message: response.message,
      });

      // Update player score locally if correct
      if (response.is_correct && response.new_score !== null) {
        dispatch({
          type: "UPDATE_PLAYER_SCORE",
          payload: {
            playerId: state.currentPlayer.id,
            newScore: response.new_score,
          },
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit answer. Please try again.");
      console.error("Submit answer error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      dispatch({ type: "NEXT_QUESTION" });
      setSelectedOption(null);
      setFeedback({ show: false, correct: false });
      setError("");
    } else {
      // Quiz finished, go to leaderboard
      navigate("/leaderboard");
    }
  };

  if (!state.currentPlayer) {
    return null; // Will redirect
  }

  if (state.loading || state.questions.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper className="glass-card" sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Loading Questions...
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </Paper>
      </Container>
    );
  }

  if (!currentQuestion) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper className="glass-card" sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="error">
            No questions available
          </Typography>
          <Button onClick={() => navigate("/")}>Back to Start</Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Paper className="glass-card slide-up" sx={{ p: 4 }}>
        {/* Progress Header */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Question {state.currentQuestionIndex + 1} of{" "}
              {state.questions.length}
            </Typography>
            <Typography
              variant="body2"
              color="primary"
              fontWeight="bold"
            >{`Score: ${state.currentPlayer.score}`}</Typography>
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

        {/* Question */}
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ mb: 4, fontWeight: "bold" }}
        >
          {currentQuestion.question}
        </Typography>

        {/* Options */}
        <Box sx={{ mb: 4 }}>
          {currentQuestion.options.map((option, index) => (
            <Card
              key={index}
              className={`glass-button ${
                feedback.show
                  ? feedback.correctAnswer === index
                    ? "correct-answer"
                    : selectedOption === index && !feedback.correct
                    ? "wrong-answer"
                    : ""
                  : selectedOption === index
                  ? "pulse"
                  : ""
              }`}
              sx={{
                mb: 2,
                cursor: feedback.show || isSubmitting ? "default" : "pointer",
                backgroundColor:
                  selectedOption === index
                    ? "rgba(0, 212, 255, 0.2)"
                    : "rgba(255, 255, 255, 0.1)",
                border:
                  selectedOption === index
                    ? "2px solid #00d4ff"
                    : "1px solid rgba(255, 255, 255, 0.2)",
                transition: "all 0.3s ease",
              }}
              onClick={() => handleOptionSelect(index)}
            >
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    sx={{
                      minWidth: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor:
                        selectedOption === index
                          ? "#00d4ff"
                          : "rgba(255, 255, 255, 0.2)",
                      color:
                        selectedOption === index ? "white" : "text.primary",
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
                  {feedback.show && feedback.correctAnswer === index && (
                    <CheckCircle sx={{ color: "#4caf50", ml: 1 }} />
                  )}
                  {feedback.show &&
                    selectedOption === index &&
                    !feedback.correct &&
                    feedback.correctAnswer !== index && (
                      <Cancel sx={{ color: "#f44336", ml: 1 }} />
                    )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Feedback */}
        {feedback.show && (
          <Alert
            severity={feedback.correct ? "success" : "error"}
            sx={{ mb: 3 }}
            icon={feedback.correct ? <CheckCircle /> : <Cancel />}
          >
            {feedback.correct
              ? "🎉 Correct! Great job!"
              : "❌ Incorrect. Better luck next time!"}
            {feedback.message && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {feedback.message}
              </Typography>
            )}
          </Alert>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          {!feedback.show ? (
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null || isSubmitting}
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
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              onClick={handleNextQuestion}
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
              {state.currentQuestionIndex < state.questions.length - 1
                ? "Next Question"
                : "View Results"}
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default QuizScreen;
