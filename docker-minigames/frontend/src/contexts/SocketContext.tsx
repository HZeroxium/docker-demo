import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
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

    const backendUrl = getBackendUrl();

    console.log("🔌 Socket Configuration:", {
      backendUrl,
      runtimeConfig: getRuntimeConfig(),
      buildTimeEnv: import.meta.env.VITE_BACKEND_URL,
    });

    const socketInstance = io(backendUrl, {
      transports: ["websocket"],
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
