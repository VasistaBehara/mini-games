export default function ScoreBar({ x, o, draws, turn, onlineInfo, mode }: { x: number; o: number; draws: number; turn?: 'X' | 'O' | null; onlineInfo?: string; mode: 'single' | 'local' | 'online' }) {
  const xLabel = mode === 'single' ? 'Player' : mode === 'local' ? 'Player 1 (X)' : 'X';
  const oLabel = mode === 'single' ? 'AI' : mode === 'local' ? 'Player 2 (O)' : 'O';
  const turnLabel = turn
    ? mode === 'single'
      ? turn === 'X'
        ? 'Player'
        : 'AI'
      : mode === 'local'
        ? turn === 'X'
          ? 'Player 1 (X)'
          : 'Player 2 (O)'
        : turn
    : '-';
  return (
    <div className="scorebar">
      <div className="pill">{xLabel}: {x}</div>
      <div className="pill">{oLabel}: {o}</div>
      <div className="pill">Draws: {draws}</div>
      <div className="pill">Turn: {turnLabel}</div>
      {onlineInfo ? <div className="pill">{onlineInfo}</div> : null}
    </div>
  );
}
