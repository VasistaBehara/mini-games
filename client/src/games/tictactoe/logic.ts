export type SymbolXO = 'X' | 'O';
export type Cell = SymbolXO | null;

export const LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

export function checkWinner(board: Cell[]): { winner: SymbolXO; line: number[] } | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return { winner: board[a] as SymbolXO, line };
  }
  return null;
}

export function isDraw(board: Cell[]) {
  return board.every((c) => c !== null);
}

export function applyMove(board: Cell[], index: number, symbol: SymbolXO): Cell[] {
  const next = board.slice();
  next[index] = symbol;
  return next;
}

export function emptyIndices(board: Cell[]) {
  const arr: number[] = [];
  board.forEach((c, i) => {
    if (c === null) arr.push(i);
  });
  return arr;
}

export function findWinningMove(board: Cell[], symbol: SymbolXO): number | -1 {
  for (const i of emptyIndices(board)) {
    const b = applyMove(board, i, symbol);
    const w = checkWinner(b);
    if (w && w.winner === symbol) return i;
  }
  return -1;
}

