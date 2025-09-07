import type { Cell, SymbolXO } from './logic';
import { emptyIndices, findWinningMove } from './logic';

export function pickMoveEasy(board: Cell[], ai: SymbolXO, human: SymbolXO): number {
  const win = findWinningMove(board, ai);
  if (win !== -1) return win;
  const block = findWinningMove(board, human);
  if (block !== -1) return block;
  const empties = emptyIndices(board);
  return empties[Math.floor(Math.random() * empties.length)];
}

