import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket && typeof window !== "undefined") {
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
    socket = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};
