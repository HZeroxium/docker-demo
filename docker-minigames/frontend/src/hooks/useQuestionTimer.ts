import { useState, useEffect, useRef, useCallback } from "react";

interface UseQuestionTimerProps {
  totalTime: number;
  onTimeUp?: () => void;
  onTick?: (remaining: number) => void;
  autoStart?: boolean;
}

interface UseQuestionTimerReturn {
  timeRemaining: number;
  isActive: boolean;
  isTimeUp: boolean;
  progress: number;
  start: () => void;
  pause: () => void;
  stop: () => void;
  reset: (newTime?: number) => void;
  getElapsedTime: () => number;
}

export const useQuestionTimer = ({
  totalTime,
  onTimeUp,
  onTick,
  autoStart = false,
}: UseQuestionTimerProps): UseQuestionTimerReturn => {
  const [timeRemaining, setTimeRemaining] = useState(totalTime);
  const [isActive, setIsActive] = useState(false);

  // Use refs to track timing accurately
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const totalTimeRef = useRef(totalTime);
  const timeUpCalledRef = useRef(false);
  const lastTickTimeRef = useRef<number | null>(null);
  const autoStartRef = useRef(autoStart);

  // Update refs when props change
  useEffect(() => {
    totalTimeRef.current = totalTime;
    autoStartRef.current = autoStart;
  }, [totalTime, autoStart]);

  // Calculate progress percentage
  const progress =
    totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
  const isTimeUp = timeRemaining <= 0;

  // Clear interval helper
  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Get elapsed time in seconds
  const getElapsedTime = useCallback((): number => {
    if (startTimeRef.current === null) {
      console.log("⚠️ Timer never started, returning 0.1s");
      return 0.1;
    }

    const now = Date.now();
    const totalElapsed = (now - startTimeRef.current) / 1000;
    const actualElapsed = totalElapsed - pausedTimeRef.current;
    const finalElapsed = Math.max(0.1, Math.round(actualElapsed * 10) / 10);

    console.log(`⏱️ Timer calculation:`, {
      startTime: startTimeRef.current,
      now,
      totalElapsed,
      pausedTime: pausedTimeRef.current,
      actualElapsed,
      finalElapsed,
    });

    return finalElapsed;
  }, []);

  // Start timer - FIXED with proper state management
  const start = useCallback(() => {
    console.log(
      `🚀 Attempting to start timer: ${timeRemaining}s remaining, isActive: ${isActive}`
    );

    if (timeRemaining <= 0) {
      console.log("⚠️ Cannot start timer - no time remaining");
      return;
    }

    if (isActive && intervalRef.current) {
      console.log("⚠️ Timer already active");
      return;
    }

    console.log(`✅ Starting timer: ${timeRemaining}s remaining`);

    // Set start time only if not already set (first start)
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      console.log(`⏰ Timer start time set: ${startTimeRef.current}`);
    } else {
      console.log(`▶️ Resuming timer from pause`);
    }

    setIsActive(true);
    timeUpCalledRef.current = false;
    lastTickTimeRef.current = Date.now();

    // Clear any existing interval
    clearCurrentInterval();

    // Start countdown with precise timing
    intervalRef.current = setInterval(() => {
      const now = Date.now();

      setTimeRemaining((prevTime) => {
        const newTime = Math.max(0, prevTime - 1);
        console.log(`⏲️ Timer tick: ${newTime}s remaining`);

        // Call onTick callback
        if (onTick && newTime > 0) {
          try {
            onTick(newTime);
          } catch (error) {
            console.error("Timer onTick callback error:", error);
          }
        }

        // Handle time up
        if (newTime === 0 && !timeUpCalledRef.current) {
          timeUpCalledRef.current = true;
          console.log("⏰ Timer finished - calling onTimeUp");

          // Stop the interval
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          setIsActive(false);

          // Call onTimeUp with a small delay to ensure state updates
          setTimeout(() => {
            if (onTimeUp) {
              try {
                onTimeUp();
              } catch (error) {
                console.error("Timer onTimeUp callback error:", error);
              }
            }
          }, 50);
        }

        lastTickTimeRef.current = now;
        return newTime;
      });
    }, 1000);
  }, [timeRemaining, isActive, onTick, onTimeUp, clearCurrentInterval]);

  // Pause timer
  const pause = useCallback(() => {
    console.log("⏸️ Pausing timer");
    if (
      isActive &&
      startTimeRef.current !== null &&
      lastTickTimeRef.current !== null
    ) {
      const pauseStartTime = Date.now();
      pausedTimeRef.current +=
        (pauseStartTime - lastTickTimeRef.current) / 1000;
      console.log(`⏸️ Paused time accumulated: ${pausedTimeRef.current}s`);
    }

    setIsActive(false);
    clearCurrentInterval();
  }, [isActive, clearCurrentInterval]);

  // Stop timer
  const stop = useCallback(() => {
    console.log("⏹️ Stopping timer");
    setIsActive(false);
    clearCurrentInterval();
    timeUpCalledRef.current = true;
  }, [clearCurrentInterval]);

  // Reset timer - FIXED to properly initialize
  const reset = useCallback(
    (newTime?: number) => {
      const resetTime = newTime ?? totalTimeRef.current;
      console.log(`🔄 Resetting timer to: ${resetTime}s`);

      clearCurrentInterval();

      // Reset all state and refs
      setTimeRemaining(resetTime);
      setIsActive(false);
      startTimeRef.current = null;
      pausedTimeRef.current = 0;
      timeUpCalledRef.current = false;
      lastTickTimeRef.current = null;

      console.log("🔄 Timer reset complete - all refs cleared");
    },
    [clearCurrentInterval]
  );

  // FIXED: Simplified auto-start effect with proper trigger
  useEffect(() => {
    if (
      autoStartRef.current &&
      timeRemaining > 0 &&
      !isActive &&
      !timeUpCalledRef.current
    ) {
      console.log("🎬 Auto-starting timer after reset");

      // Use a longer timeout to ensure all state updates are complete
      const timeoutId = setTimeout(() => {
        console.log("🎬 Executing auto-start");
        start();
      }, 500); // Increased timeout for stability

      return () => {
        console.log("🧹 Clearing auto-start timeout");
        clearTimeout(timeoutId);
      };
    }
  }, [timeRemaining, isActive]); // Removed complex dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 Cleaning up timer on unmount");
      clearCurrentInterval();
    };
  }, [clearCurrentInterval]);

  // Reset when totalTime changes significantly
  useEffect(() => {
    if (Math.abs(totalTime - totalTimeRef.current) > 0.5) {
      console.log(
        `📏 Total time changed: ${totalTimeRef.current} → ${totalTime}`
      );
      reset(totalTime);
    }
  }, [totalTime, reset]);

  return {
    timeRemaining,
    isActive,
    isTimeUp,
    progress,
    start,
    pause,
    stop,
    reset,
    getElapsedTime,
  };
};
