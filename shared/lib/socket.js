import { io } from "socket.io-client";
import { getBackendServerBase } from "./api-client";

let socket = null;

export const getSocket = () => {
  if (!socket && typeof window !== "undefined") {
    const SERVER_URL = getBackendServerBase();
    socket = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};
