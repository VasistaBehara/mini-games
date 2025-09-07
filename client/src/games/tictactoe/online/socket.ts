import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const url = import.meta.env.VITE_SERVER_URL || 'http://localhost:5174';
    socket = io(`${url}/tictactoe`, { autoConnect: true });
  }
  return socket;
}

