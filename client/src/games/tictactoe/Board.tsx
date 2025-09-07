import type { Cell } from './logic';

export default function Board({ board, onCellClick, disabled, winningLine }: { board: Cell[]; onCellClick: (i: number) => void; disabled?: boolean; winningLine?: number[] }) {
  return (
    <div className="board">
      {board.map((c, i) => {
        const isWin = winningLine?.includes(i);
        return (
          <div
            key={i}
            className={["cell", disabled || c !== null ? 'disabled' : '', isWin ? 'win' : ''].filter(Boolean).join(' ')}
            onClick={() => {
              if (!disabled && c === null) onCellClick(i);
            }}
          >
            {c}
          </div>
        );
      })}
    </div>
  );
}

