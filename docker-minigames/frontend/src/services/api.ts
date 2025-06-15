import axios from "axios";
import { type Player, type Question } from "../contexts/GameContext";

const API_BASE_URL = "http://localhost:8000/api";

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
  player_id: string; // Fixed: Match backend field name
  question_id: string; // Fixed: Match backend field name
  selected_option: number; // Fixed: Should be number, not string
}

export interface SubmitAnswerResponse {
  is_correct: boolean; // Fixed: Match backend field name
  new_score: number | null; // Fixed: Match backend field name
  correct_answer: number | null; // Fixed: Match backend field name
  message: string;
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

  submitAnswer: async (
    data: SubmitAnswerRequest
  ): Promise<SubmitAnswerResponse> => {
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
    console.error("API Error:", error.response?.data || error.message);
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw error;
  }
);

export default api;
