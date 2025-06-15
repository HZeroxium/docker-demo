import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import { SocketProvider } from "./contexts/SocketContext";
import { GameProvider } from "./contexts/GameContext";
import JoinScreen from "./components/screens/JoinScreen";
import QuizScreen from "./components/screens/QuizScreen";
import LeaderboardScreen from "./components/screens/LeaderboardScreen";
import Layout from "./components/layout/Layout";
import "./App.css";

function App() {
  return (
    <SocketProvider>
      <GameProvider>
        <Box className="app-container">
          <Layout>
            <Routes>
              <Route path="/" element={<JoinScreen />} />
              <Route path="/quiz" element={<QuizScreen />} />
              <Route path="/leaderboard" element={<LeaderboardScreen />} />
            </Routes>
          </Layout>
        </Box>
      </GameProvider>
    </SocketProvider>
  );
}

export default App;
