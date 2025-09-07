export type SymbolXO = 'X' | 'O';
export type Cell = SymbolXO | null;

export interface Room {
  code: string;
  players: { X: string | null; O: string | null };
  board: Cell[];
  turn: SymbolXO;
  status: 'playing' | 'game_over';
  winner?: SymbolXO | 'draw';
  winningLine?: number[];
}

const rooms = new Map<string, Room>();

function randomCode(length = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < length; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function createRoom(ownerSocketId: string): Room {
  let code = randomCode();
  while (rooms.has(code)) code = randomCode();
  const room: Room = {
    code,
    players: { X: ownerSocketId, O: null },
    board: Array<Cell>(9).fill(null),
    turn: 'X',
    status: 'playing'
  };
  rooms.set(code, room);
  return room;
}

export function getRoom(code: string) {
  return rooms.get(code) || null;
}

export function joinRoom(code: string, socketId: string): { room: Room | null; symbol?: SymbolXO; error?: string } {
  const room = rooms.get(code);
  if (!room) return { room: null, error: 'ROOM_NOT_FOUND' };
  if (room.players.X === socketId || room.players.O === socketId) return { room, symbol: room.players.X === socketId ? 'X' : 'O' };
  if (room.players.X == null) {
    room.players.X = socketId;
    return { room, symbol: 'X' };
  }
  if (room.players.O == null) {
    room.players.O = socketId;
    return { room, symbol: 'O' };
  }
  return { room, error: 'ROOM_FULL' };
}

export function leaveRoomsOf(socketId: string): { code: string; room: Room }[] {
  const affected: { code: string; room: Room }[] = [];
  for (const [code, room] of rooms) {
    if (room.players.X === socketId) room.players.X = null;
    if (room.players.O === socketId) room.players.O = null;
    if (!room.players.X && !room.players.O) {
      rooms.delete(code);
    } else {
      affected.push({ code, room });
    }
  }
  return affected;
}

const LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function checkWinner(board: Cell[]): { winner: SymbolXO; line: number[] } | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as SymbolXO, line };
    }
  }
  return null;
}

function isDraw(board: Cell[]) {
  return board.every((c) => c !== null);
}

export function makeMove(code: string, socketId: string, index: number): { room?: Room; error?: string; gameOver?: boolean } {
  const room = rooms.get(code);
  if (!room) return { error: 'ROOM_NOT_FOUND' };
  if (room.status !== 'playing') return { error: 'NOT_PLAYING' };
  const playerSymbol: SymbolXO | null = room.players.X === socketId ? 'X' : room.players.O === socketId ? 'O' : null;
  if (!playerSymbol) return { error: 'NOT_IN_ROOM' };
  if (playerSymbol !== room.turn) return { error: 'NOT_YOUR_TURN' };
  if (index < 0 || index > 8) return { error: 'INVALID_INDEX' };
  if (room.board[index] !== null) return { error: 'CELL_TAKEN' };

  room.board[index] = playerSymbol;
  const win = checkWinner(room.board);
  if (win) {
    room.status = 'game_over';
    room.winner = win.winner;
    room.winningLine = win.line;
    return { room, gameOver: true };
  }
  if (isDraw(room.board)) {
    room.status = 'game_over';
    room.winner = 'draw';
    return { room, gameOver: true };
  }
  room.turn = room.turn === 'X' ? 'O' : 'X';
  return { room };
}

export function restartGame(code: string) {
  const room = rooms.get(code);
  if (!room) return { error: 'ROOM_NOT_FOUND' } as const;
  room.board = Array<Cell>(9).fill(null);
  room.turn = 'X';
  room.status = 'playing';
  room.winner = undefined;
  room.winningLine = undefined;
  return { room } as const;
}

