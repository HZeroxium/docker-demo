import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Container,
  Alert,
  LinearProgress,
  Typography,
  Button,
} from "@mui/material";
import { useGame } from "../../contexts/GameContext";
import { gameApi } from "../../services/api";
import { useQuestionTimer } from "../../hooks/useQuestionTimer";
import QuestionTimer from "../ui/QuestionTimer";
import ScoreAnimation from "../ui/ScoreAnimation";

// Import new quiz components
import QuizProgress from "../quiz/QuizProgress";
import QuizQuestion from "../quiz/QuizQuestion";
import QuizOptions from "../quiz/QuizOptions";
import QuizFeedback from "../quiz/QuizFeedback";
import QuizActions from "../quiz/QuizActions";

// Import shuffling utilities
import {
  createShuffleMapping,
  mapShuffledToOriginal,
  type ShuffleMapping,
} from "../../utils/shuffleUtils";

const QuizScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<number | null>(null); // SHUFFLED index
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    correct: boolean;
    correctAnswer?: number; // ORIGINAL index from backend
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

  // NEW: Shuffle mapping state
  const [shuffleMapping, setShuffleMapping] = useState<ShuffleMapping | null>(
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
    const optionToSubmit = selectedOption !== null ? selectedOption : 0; // This is shuffled index
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
    autoStart: true,
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

  // ENHANCED: Question change effect with shuffle mapping generation
  useEffect(() => {
    if (currentQuestion && currentQuestion.id !== currentQuestionId) {
      console.log(`📝 New question loaded: ${currentQuestion.id}`);

      // Generate shuffle mapping for this question
      const newShuffleMapping = createShuffleMapping(
        currentQuestion.options,
        currentQuestion.id
      );

      console.log(
        `🔀 Generated shuffle mapping for question ${currentQuestion.id}:`,
        {
          original: currentQuestion.options,
          shuffled: newShuffleMapping.shuffledOptions.map((opt) => opt.text),
        }
      );

      // Reset all question-related state
      setCurrentQuestionId(currentQuestion.id);
      setShuffleMapping(newShuffleMapping);
      setSelectedOption(null); // This will be shuffled index
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
    (shuffledIndex: number) => {
      if (!feedback.show && !isSubmitting && !isTimeUp) {
        console.log(`✅ Shuffled option selected: ${shuffledIndex}`);
        setSelectedOption(shuffledIndex); // Store shuffled index
      }
    },
    [feedback.show, isSubmitting, isTimeUp]
  );

  // ENHANCED: Submit answer with shuffle mapping conversion
  const handleSubmitAnswer = useCallback(
    async (isTimeout: boolean = false, shuffledOptionOverride?: number) => {
      const shuffledOption = shuffledOptionOverride ?? selectedOption;

      if (
        shuffledOption === null ||
        !state.currentPlayer ||
        !currentQuestion ||
        !shuffleMapping
      ) {
        console.error("Cannot submit: missing data", {
          shuffledOption,
          currentPlayer: !!state.currentPlayer,
          currentQuestion: !!currentQuestion,
          shuffleMapping: !!shuffleMapping,
        });
        return;
      }

      // Convert shuffled index to original index for backend
      const originalOption = mapShuffledToOriginal(
        shuffledOption,
        shuffleMapping
      );

      console.log(
        `🔄 Converting shuffled option ${shuffledOption} to original option ${originalOption}`
      );

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
          selected_option: originalOption, // Send ORIGINAL index to backend
          shuffled_option: shuffledOption, // For debugging
          time_taken: timeTaken,
          isTimeout,
        });

        const response = await gameApi.submitAnswer({
          player_id: state.currentPlayer.id,
          question_id: currentQuestion.id,
          selected_option: originalOption, // Backend expects original index
          time_taken: timeTaken,
        });

        console.log("✅ Answer response:", response);

        setFeedback({
          show: true,
          correct: response.is_correct,
          correctAnswer: response.correct_answer, // This is original index from backend
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
      shuffleMapping,
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

    // Clear question start time and shuffle mapping
    setQuestionStartTime(null);
    setShuffleMapping(null);

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

  if (!currentQuestion || !shuffleMapping) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper className="glass-card" sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="error">
            {!currentQuestion
              ? "No questions available"
              : "Loading question options..."}
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
        <QuizProgress
          currentQuestionIndex={state.currentQuestionIndex}
          totalQuestions={state.questions.length}
          playerScore={state.currentPlayer.score}
          progress={progress}
        />

        {/* Timer Component */}
        <QuestionTimer
          timeRemaining={timeRemaining}
          totalTime={currentQuestion?.time_limit || 30}
          isActive={isActive && !feedback.show}
          progress={timerProgress}
        />

        {/* Question */}
        <QuizQuestion question={currentQuestion.question} />

        {/* ENHANCED: Options with shuffle mapping */}
        <QuizOptions
          options={currentQuestion.options}
          selectedOption={selectedOption} // Shuffled index
          feedbackShow={feedback.show}
          feedbackCorrect={feedback.correct}
          correctAnswer={feedback.correctAnswer} // Original index from backend
          isSubmitting={isSubmitting}
          isTimeUp={isTimeUp}
          shuffleMapping={shuffleMapping} // Pass shuffle mapping
          onOptionSelect={handleOptionSelect} // Receives shuffled index
        />

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Feedback */}
        <QuizFeedback
          show={feedback.show}
          correct={feedback.correct}
          message={feedback.message}
          showCorrectAnswer={false}
          correctAnswer={feedback.correctAnswer}
          options={currentQuestion.options}
        />

        {/* Action Buttons */}
        <QuizActions
          feedbackShow={feedback.show}
          selectedOption={selectedOption}
          isSubmitting={isSubmitting}
          isTimeUp={isTimeUp}
          currentQuestionIndex={state.currentQuestionIndex}
          totalQuestions={state.questions.length}
          onSubmitAnswer={() => handleSubmitAnswer()}
          onNextQuestion={handleNextQuestion}
        />
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
