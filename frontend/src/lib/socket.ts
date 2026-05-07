"use client";

import { io, type Socket } from "socket.io-client";
import { config } from "./config";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(config.backendWsUrl, {
      transports: ["websocket"],
      autoConnect: true
    });
  }
  return socket;
}

