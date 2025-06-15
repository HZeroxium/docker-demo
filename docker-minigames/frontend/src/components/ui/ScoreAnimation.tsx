import React, { useEffect } from "react";
import { Box, Typography, Chip } from "@mui/material";
import { useSpring, animated, useChain, useSpringRef } from "@react-spring/web";
import {
  TrendingUp,
  Speed,
  CheckCircle,
  EmojiEvents,
} from "@mui/icons-material";

interface ScoreAnimationProps {
  points: number;
  speedBonus: number;
  timeTaken: number;
  onAnimationComplete?: () => void;
}

const AnimatedBox = animated(Box);
const AnimatedTypography = animated(Typography);

const ScoreAnimation: React.FC<ScoreAnimationProps> = ({
  points,
  speedBonus,
  timeTaken,
  onAnimationComplete,
}) => {
  const slideRef = useSpringRef();
  const scaleRef = useSpringRef();
  const fadeRef = useSpringRef();

  // Slide up animation
  const slideProps = useSpring({
    ref: slideRef,
    from: { transform: "translateY(50px)", opacity: 0 },
    to: { transform: "translateY(0px)", opacity: 1 },
  });

  // Scale animation for emphasis
  const scaleProps = useSpring({
    ref: scaleRef,
    from: { transform: "scale(0.8)" },
    to: { transform: "scale(1)" },
  });

  // Fade out animation
  const fadeProps = useSpring({
    ref: fadeRef,
    from: { opacity: 1 },
    to: { opacity: 0 },
  });

  // Chain animations
  useChain([slideRef, scaleRef, fadeRef], [0, 0.2, 2.5]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  const totalPoints = points + speedBonus;
  const isSpeedBonus = speedBonus > 0;

  return (
    <AnimatedBox
      style={{ ...slideProps, ...fadeProps }}
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <AnimatedBox
        style={scaleProps}
        sx={{
          background: "linear-gradient(135deg, #00d4ff, #ff6b35)",
          borderRadius: 4,
          p: 3,
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
          <CheckCircle sx={{ color: "#4caf50", fontSize: 32, mr: 1 }} />
          <AnimatedTypography
            variant="h4"
            sx={{
              color: "white",
              fontWeight: "bold",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
            }}
          >
            +{totalPoints}
          </AnimatedTypography>
          <EmojiEvents sx={{ color: "#ffd700", fontSize: 32, ml: 1 }} />
        </Box>

        <Box display="flex" gap={1} justifyContent="center" mb={2}>
          <Chip
            icon={<TrendingUp />}
            label={`Base: ${points}pts`}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              fontWeight: "bold",
            }}
          />
          {isSpeedBonus && (
            <Chip
              icon={<Speed />}
              label={`Speed: +${speedBonus}pts`}
              sx={{
                backgroundColor: "rgba(255, 215, 0, 0.3)",
                color: "white",
                fontWeight: "bold",
                animation: "pulse 1s infinite",
              }}
            />
          )}
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.8)",
            fontWeight: 500,
          }}
        >
          Answered in {timeTaken.toFixed(1)}s
          {isSpeedBonus && " - Lightning fast! ⚡"}
        </Typography>
      </AnimatedBox>
    </AnimatedBox>
  );
};

export default ScoreAnimation;
