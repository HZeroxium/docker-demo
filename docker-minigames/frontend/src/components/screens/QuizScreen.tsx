import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { useQuestionTimer } from "../../hooks/useQuestionTimer";
import QuestionTimer from "../ui/QuestionTimer";
import ScoreAnimation from "../ui/ScoreAnimation";

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
  const [showScoreAnimation, setShowScoreAnimation] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null
  );
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(
    null
  );

  const currentQuestion = state.questions[state.currentQuestionIndex];

  const progress = useMemo(
    () => ((state.currentQuestionIndex + 1) / state.questions.length) * 100,
    [state.currentQuestionIndex, state.questions.length]
  );

  // Handle time up callback - FIXED to prevent double submission
  const handleTimeUp = useCallback(async () => {
    if (feedback.show || isSubmitting) {
      console.log("⏰ Time up ignored - already processing");
      return;
    }

    console.log("⏰ Time's up! Auto-submitting...");
    const optionToSubmit = selectedOption !== null ? selectedOption : 0;
    await handleSubmitAnswer(true, optionToSubmit);
  }, [feedback.show, isSubmitting, selectedOption]);

  // Handle tick callback for warnings
  const handleTick = useCallback((remaining: number) => {
    if (remaining === 10) {
      console.log("⏰ 10 seconds remaining!");
    } else if (remaining === 5) {
      console.log("⚠️ 5 seconds remaining!");
    }
  }, []);

  // Timer hook with FIXED autoStart configuration
  const {
    timeRemaining,
    isActive,
    isTimeUp,
    progress: timerProgress,
    stop: stopTimer,
    reset: resetTimer,
    getElapsedTime,
  } = useQuestionTimer({
    totalTime: currentQuestion?.time_limit || 30,
    onTimeUp: handleTimeUp,
    onTick: handleTick,
    autoStart: true, // Enable auto-start for proper timer functionality
  });

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

  // FIXED: Simplified question change effect with proper timer management
  useEffect(() => {
    if (currentQuestion && currentQuestion.id !== currentQuestionId) {
      console.log(`📝 New question loaded: ${currentQuestion.id}`);

      // Reset all question-related state
      setCurrentQuestionId(currentQuestion.id);
      setSelectedOption(null);
      setFeedback({ show: false, correct: false });
      setError("");
      setIsSubmitting(false);

      // Set question start time for manual tracking
      const startTime = Date.now();
      setQuestionStartTime(startTime);
      console.log(`📍 Question start time set: ${startTime}`);

      // Reset timer with new time - auto-start will handle the starting
      const timeLimit = currentQuestion.time_limit || 30;
      console.log(
        `⏰ Resetting timer to ${timeLimit}s with auto-start enabled`
      );
      resetTimer(timeLimit);
    }
  }, [currentQuestion?.id, resetTimer]);

  // Handle score animation display
  useEffect(() => {
    if (state.lastScoreUpdate && feedback.show) {
      setShowScoreAnimation(true);
    }
  }, [state.lastScoreUpdate, feedback.show]);

  const handleOptionSelect = useCallback(
    (optionIndex: number) => {
      if (!feedback.show && !isSubmitting && !isTimeUp) {
        console.log(`✅ Option selected: ${optionIndex}`);
        setSelectedOption(optionIndex);
      }
    },
    [feedback.show, isSubmitting, isTimeUp]
  );

  // FIXED: Submit answer with proper timing calculation
  const handleSubmitAnswer = useCallback(
    async (isTimeout: boolean = false, optionOverride?: number) => {
      const optionToSubmit = optionOverride ?? selectedOption;

      if (optionToSubmit === null || !state.currentPlayer || !currentQuestion) {
        console.error("Cannot submit: missing data", {
          optionToSubmit,
          currentPlayer: !!state.currentPlayer,
          currentQuestion: !!currentQuestion,
        });
        return;
      }

      // Prevent double submission
      if (isSubmitting) {
        console.log("🚫 Already submitting, ignoring duplicate request");
        return;
      }

      // Stop timer FIRST, then get elapsed time
      stopTimer();

      // Calculate time taken with fallback methods
      let timeTaken: number;

      if (questionStartTime) {
        // Primary method: Use question start time
        timeTaken = (Date.now() - questionStartTime) / 1000;
        console.log(`⏱️ Time calculation (manual): ${timeTaken}s`);
      } else {
        // Fallback: Use timer's elapsed time
        timeTaken = getElapsedTime();
        console.log(`⏱️ Time calculation (timer): ${timeTaken}s`);
      }

      // Ensure realistic minimum and maximum bounds
      timeTaken = Math.max(
        0.5,
        Math.min(timeTaken, (currentQuestion.time_limit || 30) + 1)
      );

      // Round to reasonable precision
      timeTaken = Math.round(timeTaken * 10) / 10;

      console.log(`⏱️ Final time taken: ${timeTaken}s`);

      setIsSubmitting(true);
      setError("");

      try {
        console.log("📤 Submitting answer:", {
          player_id: state.currentPlayer.id,
          question_id: currentQuestion.id,
          selected_option: optionToSubmit,
          time_taken: timeTaken,
          isTimeout,
        });

        const response = await gameApi.submitAnswer({
          player_id: state.currentPlayer.id,
          question_id: currentQuestion.id,
          selected_option: optionToSubmit,
          time_taken: timeTaken,
        });

        console.log("✅ Answer response:", response);

        setFeedback({
          show: true,
          correct: response.is_correct,
          correctAnswer: response.correct_answer,
          message: isTimeout ? "⏰ Time's up!" : response.message,
        });

        // Update local score
        if (response.new_score !== null && response.new_score !== undefined) {
          dispatch({
            type: "UPDATE_PLAYER_SCORE",
            payload: {
              playerId: state.currentPlayer.id,
              newScore: response.new_score,
            },
          });

          // Set score update for animation
          if (response.points_earned > 0) {
            dispatch({
              type: "SET_SCORE_UPDATE",
              payload: {
                points: response.points_earned,
                speedBonus: response.speed_bonus,
                timeTaken: timeTaken,
              },
            });
          }
        }
      } catch (err: any) {
        console.error("❌ Submit answer error:", err);
        setError(err.message || "Failed to submit answer. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      selectedOption,
      state.currentPlayer,
      currentQuestion,
      stopTimer,
      getElapsedTime,
      dispatch,
      isSubmitting,
      questionStartTime,
    ]
  );

  const handleNextQuestion = useCallback(() => {
    // Clear score animation and update
    setShowScoreAnimation(false);
    dispatch({ type: "CLEAR_SCORE_UPDATE" });

    // Clear question start time
    setQuestionStartTime(null);

    if (state.currentQuestionIndex < state.questions.length - 1) {
      dispatch({ type: "NEXT_QUESTION" });
      // State will be reset by the question change effect
    } else {
      // Quiz finished, go to leaderboard
      navigate("/leaderboard");
    }
  }, [state.currentQuestionIndex, state.questions.length, dispatch, navigate]);

  const handleScoreAnimationComplete = useCallback(() => {
    setShowScoreAnimation(false);
    dispatch({ type: "CLEAR_SCORE_UPDATE" });
  }, [dispatch]);

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

        {/* Timer Component with enhanced debug info */}
        <QuestionTimer
          timeRemaining={timeRemaining}
          totalTime={currentQuestion?.time_limit || 30}
          isActive={isActive && !feedback.show}
          progress={timerProgress}
        />

        {/* Enhanced Debug Timer Info */}
        {process.env.NODE_ENV === "development" && (
          <Box
            sx={{
              mb: 2,
              p: 1,
              bgcolor: isActive
                ? "rgba(76, 175, 80, 0.1)"
                : "rgba(244, 67, 54, 0.1)",
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
              Feedback Showing: <strong>{feedback.show ? "Yes" : "No"}</strong>{" "}
              | Time Up: <strong>{isTimeUp ? "Yes" : "No"}</strong>
            </Typography>
          </Box>
        )}

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
                cursor:
                  feedback.show || isSubmitting || isTimeUp
                    ? "default"
                    : "pointer",
                backgroundColor: feedback.show
                  ? feedback.correctAnswer === index
                    ? "rgba(76, 175, 80, 0.3)"
                    : selectedOption === index && !feedback.correct
                    ? "rgba(244, 67, 54, 0.3)"
                    : "rgba(255, 255, 255, 0.05)"
                  : selectedOption === index
                  ? "rgba(0, 212, 255, 0.2)"
                  : "rgba(255, 255, 255, 0.1)",
                border: feedback.show
                  ? feedback.correctAnswer === index
                    ? "2px solid #4caf50"
                    : selectedOption === index && !feedback.correct
                    ? "2px solid #f44336"
                    : "1px solid rgba(255, 255, 255, 0.2)"
                  : selectedOption === index
                  ? "2px solid #00d4ff"
                  : "1px solid rgba(255, 255, 255, 0.2)",
                transition: "all 0.3s ease",
                opacity: isTimeUp && !feedback.show ? 0.6 : 1,
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
                      backgroundColor: feedback.show
                        ? feedback.correctAnswer === index
                          ? "#4caf50"
                          : selectedOption === index && !feedback.correct
                          ? "#f44336"
                          : "rgba(255, 255, 255, 0.2)"
                        : selectedOption === index
                        ? "#00d4ff"
                        : "rgba(255, 255, 255, 0.2)",
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
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              {feedback.correct ? "🎉 Correct! Great job!" : "❌ Incorrect!"}
            </Typography>
            {feedback.message && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {feedback.message}
              </Typography>
            )}
            {!feedback.correct && feedback.correctAnswer !== undefined && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
                The correct answer was:{" "}
                {String.fromCharCode(65 + feedback.correctAnswer)}){" "}
                {currentQuestion.options[feedback.correctAnswer]}
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
              onClick={() => handleSubmitAnswer()}
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

      {/* Score Animation Overlay */}
      {showScoreAnimation && state.lastScoreUpdate && (
        <ScoreAnimation
          points={state.lastScoreUpdate.points}
          speedBonus={state.lastScoreUpdate.speedBonus}
          timeTaken={state.lastScoreUpdate.timeTaken}
          onAnimationComplete={handleScoreAnimationComplete}
        />
      )}
    </Container>
  );
};

export default QuizScreen;
