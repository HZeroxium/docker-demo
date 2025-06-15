import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useSocket } from "./SocketContext";

export interface Player {
  id: string;
  name: string;
  score: number;
  joined_at?: string; // Added: Match backend response
}

export interface Question {
  id: string;
  question: string;
  options: string[];
}

export interface GameState {
  currentPlayer: Player | null;
  players: Player[];
  questions: Question[];
  currentQuestionIndex: number;
  gameStatus: "waiting" | "playing" | "finished";
  loading: boolean;
}

type GameAction =
  | { type: "SET_PLAYER"; payload: Player }
  | { type: "SET_QUESTIONS"; payload: Question[] }
  | { type: "UPDATE_LEADERBOARD"; payload: Player[] }
  | { type: "NEXT_QUESTION" }
  | { type: "SET_GAME_STATUS"; payload: GameState["gameStatus"] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "PLAYER_JOINED"; payload: Player }
  | {
      type: "UPDATE_PLAYER_SCORE";
      payload: { playerId: string; newScore: number };
    };

const initialState: GameState = {
  currentPlayer: null,
  players: [],
  questions: [],
  currentQuestionIndex: 0,
  gameStatus: "waiting",
  loading: false,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "SET_PLAYER":
      return { ...state, currentPlayer: action.payload };
    case "SET_QUESTIONS":
      return { ...state, questions: action.payload };
    case "UPDATE_LEADERBOARD":
      return { ...state, players: action.payload };
    case "NEXT_QUESTION":
      return {
        ...state,
        currentQuestionIndex: Math.min(
          state.currentQuestionIndex + 1,
          state.questions.length - 1
        ),
      };
    case "SET_GAME_STATUS":
      return { ...state, gameStatus: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "PLAYER_JOINED":
      return {
        ...state,
        players: [
          ...state.players.filter((p) => p.id !== action.payload.id),
          action.payload,
        ],
      };
    case "UPDATE_PLAYER_SCORE":
      return {
        ...state,
        currentPlayer:
          state.currentPlayer?.id === action.payload.playerId
            ? { ...state.currentPlayer, score: action.payload.newScore }
            : state.currentPlayer,
        players: state.players.map((p) =>
          p.id === action.payload.playerId
            ? { ...p, score: action.payload.newScore }
            : p
        ),
      };
    default:
      return state;
  }
};

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

interface GameProviderProps {
  children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("player_joined", (data: any) => {
      console.log("Player joined event:", data);
      const player: Player = {
        id: data.player_id,
        name: data.name,
        score: data.score,
      };
      dispatch({ type: "PLAYER_JOINED", payload: player });
    });

    socket.on("leaderboard_updated", (data: any) => {
      console.log("Leaderboard updated event:", data);
      if (data.leaderboard && Array.isArray(data.leaderboard)) {
        dispatch({ type: "UPDATE_LEADERBOARD", payload: data.leaderboard });
      }
    });

    socket.on("player_answered", (data: any) => {
      console.log("Player answered event:", data);
      if (data.new_score !== null && data.player_id) {
        dispatch({
          type: "UPDATE_PLAYER_SCORE",
          payload: { playerId: data.player_id, newScore: data.new_score },
        });
      }
    });

    return () => {
      socket.off("player_joined");
      socket.off("leaderboard_updated");
      socket.off("player_answered");
    };
  }, [socket]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};
