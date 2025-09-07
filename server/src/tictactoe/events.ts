import type { Server, Namespace, Socket } from 'socket.io';
import { createRoom, getRoom, joinRoom, leaveRoomsOf, makeMove, restartGame } from './rooms';

export function registerTicTacToeNamespace(io: Server) {
  const nsp = io.of('/tictactoe');

  nsp.on('connection', (socket: Socket) => {
    socket.on('create_room', () => {
      const room = createRoom(socket.id);
      socket.join(room.code);
      socket.emit('room_created', { roomCode: room.code });
      socket.emit('joined', {
        roomCode: room.code,
        symbol: 'X',
        board: room.board,
        turn: room.turn,
        status: room.status
      });
      nsp.to(room.code).emit('state', { board: room.board, turn: room.turn, status: room.status });
    });

    socket.on('join_room', (roomCode: string) => {
      const result = joinRoom(roomCode, socket.id);
      if (!result.room) {
        socket.emit('error_msg', { message: result.error || 'UNKNOWN' });
        return;
      }
      if (result.error) {
        socket.emit('error_msg', { message: result.error });
        return;
      }
      socket.join(result.room.code);
      socket.emit('joined', {
        roomCode: result.room.code,
        symbol: result.symbol,
        board: result.room.board,
        turn: result.room.turn,
        status: result.room.status
      });
      nsp.to(result.room.code).emit('state', { board: result.room.board, turn: result.room.turn, status: result.room.status });
    });

    socket.on('make_move', ({ roomCode, index }: { roomCode: string; index: number }) => {
      const room = getRoom(roomCode);
      if (!room) {
        socket.emit('error_msg', { message: 'ROOM_NOT_FOUND' });
        return;
      }
      const result = makeMove(roomCode, socket.id, index);
      if (result.error || !result.room) {
        socket.emit('error_msg', { message: result.error || 'UNKNOWN' });
        return;
      }
      const r = result.room;
      nsp.to(r.code).emit('state', { board: r.board, turn: r.turn, status: r.status, winningLine: r.winningLine });
      if (result.gameOver) {
        nsp.to(r.code).emit('game_over', { result: r.winner, winningLine: r.winningLine });
      }
    });

    socket.on('restart', (roomCode: string) => {
      const res = restartGame(roomCode);
      if ('error' in res) {
        socket.emit('error_msg', { message: res.error });
        return;
      }
      const r = res.room;
      nsp.to(r.code).emit('state', { board: r.board, turn: r.turn, status: r.status });
    });

    socket.on('disconnecting', () => {
      const affected = leaveRoomsOf(socket.id);
      for (const { code } of affected) {
        nsp.to(code).emit('opponent_left');
      }
    });
  });
}
