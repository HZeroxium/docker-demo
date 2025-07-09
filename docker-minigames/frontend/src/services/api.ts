import axios from "axios";
import { type Player, type Question } from "../contexts/GameContext";

// Runtime configuration fallback function
const getRuntimeConfig = () => {
  // Check for runtime configuration injected by Docker
  if (typeof window !== "undefined" && (window as any).__RUNTIME_CONFIG__) {
    return (window as any).__RUNTIME_CONFIG__;
  }
  return {};
};

// Get backend URL with runtime configuration support
const getBackendUrl = (): string => {
  const runtimeConfig = getRuntimeConfig();

  // Priority: Runtime config > Build-time env > Default
  return (
    runtimeConfig.VITE_BACKEND_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:8000"
  );
};

// Use environment variable or fallback to localhost for development
const API_BASE_URL = `${getBackendUrl()}/api`;

console.log("🔧 API Configuration:", {
  backendUrl: getBackendUrl(),
  apiBaseUrl: API_BASE_URL,
  runtimeConfig: getRuntimeConfig(),
  buildTimeEnv: import.meta.env.VITE_BACKEND_URL,
});

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface JoinGameRequest {
  name: string;
}

export interface SubmitAnswerRequest {
  player_id: string;
  question_id: string;
  selected_option: number;
  time_taken: number; // Added: Time taken to answer
}

export interface AnswerResponse {
  is_correct: boolean;
  points_earned: number;
  new_score: number | null;
  time_taken: number;
  speed_bonus: number;
  message: string;
  correct_answer?: number; // Add this optional field
}

export const gameApi = {
  joinGame: async (data: JoinGameRequest): Promise<Player> => {
    const response = await api.post("/join", data);
    return response.data;
  },

  getQuestions: async (): Promise<Question[]> => {
    const response = await api.get("/questions");
    return response.data;
  },

  submitAnswer: async (data: SubmitAnswerRequest): Promise<AnswerResponse> => {
    const response = await api.post("/answer", data);
    return response.data;
  },

  getLeaderboard: async (): Promise<Player[]> => {
    const response = await api.get("/leaderboard");
    return response.data;
  },
};

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(
      "API Request:",
      config.method?.toUpperCase(),
      config.url,
      config.data
    );
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("API Error Details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.data?.detail) {
      // Handle FastAPI validation errors
      if (Array.isArray(error.response.data.detail)) {
        const validationErrors = error.response.data.detail
          .map((err: any) => `${err.loc?.join(".")} - ${err.msg}`)
          .join("; ");
        throw new Error(`Validation Error: ${validationErrors}`);
      } else if (typeof error.response.data.detail === "string") {
        throw new Error(error.response.data.detail);
      } else {
        throw new Error("Request validation failed");
      }
    }

    if (error.response?.status === 422) {
      throw new Error("Invalid request data. Please check your input.");
    }

    throw new Error(error.message || "An unexpected error occurred");
  }
);

export default api;
