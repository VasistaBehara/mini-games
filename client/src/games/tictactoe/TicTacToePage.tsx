import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Board from './Board';
import ScoreBar from './ScoreBar';
import ModeSelect from './ModeSelect';
import type { Cell, SymbolXO } from './logic';
import { applyMove, checkWinner, isDraw } from './logic';
import { pickMoveEasy } from './ai';
import { setNumber } from '../../lib/storage';

type Mode = 'single' | 'local' | 'online';

export default function TicTacToePage() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [board, setBoard] = useState<Cell[]>(Array<Cell>(9).fill(null));
  const [turn, setTurn] = useState<SymbolXO>('X');
  const [winnerLine, setWinnerLine] = useState<number[] | undefined>(undefined);
  const [status, setStatus] = useState<'playing' | 'game_over'>('playing');
  const [message, setMessage] = useState<string | null>(null);
  const [x, setX] = useState(0);
  const [o, setO] = useState(0);
  const [d, setD] = useState(0);
  const navigate = useNavigate();

  const reset = () => {
    setBoard(Array<Cell>(9).fill(null));
    setTurn('X');
    setStatus('playing');
    setWinnerLine(undefined);
    setMessage(null);
  };

  useEffect(() => {
    setNumber('ttt_x', 0);
    setNumber('ttt_o', 0);
    setNumber('ttt_draws', 0);
    setX(0); setO(0); setD(0);
  }, []);
  useEffect(() => { setNumber('ttt_x', x); }, [x]);
  useEffect(() => { setNumber('ttt_o', o); }, [o]);
  useEffect(() => { setNumber('ttt_draws', d); }, [d]);

  useEffect(() => {
    if (mode !== 'single') return;
    const w = checkWinner(board);
    if (w) {
      setStatus('game_over');
      setWinnerLine(w.line);
      if (w.winner === 'X') setX((v) => v + 1);
      else setO((v) => v + 1);
      setMessage(`${w.winner} wins`);
      return;
    }
    if (isDraw(board)) {
      setStatus('game_over');
      setD((v) => v + 1);
      setMessage('Draw');
      return;
    }
    if (turn === 'O' && mode === 'single' && status === 'playing') {
      const aiIndex = pickMoveEasy(board, 'O', 'X');
      const nb = applyMove(board, aiIndex, 'O');
      setBoard(nb);
      setTurn('X');
    }
  }, [board, mode, turn, status]);

  const handleClick = (i: number) => {
    if (status !== 'playing' || board[i] !== null) return;
    if (mode === 'single') {
      if (turn !== 'X') return;
      const nb = applyMove(board, i, 'X');
      setBoard(nb);
      setTurn('O');
      return;
    }
    if (mode === 'local') {
      const nb = applyMove(board, i, turn);
      const w = checkWinner(nb);
      if (w) {
        setBoard(nb);
        setStatus('game_over');
        setWinnerLine(w.line);
        if (w.winner === 'X') setX((v) => v + 1);
        else setO((v) => v + 1);
        setMessage(`${w.winner} wins`);
        return;
      }
      if (isDraw(nb)) {
        setBoard(nb);
        setStatus('game_over');
        setD((v) => v + 1);
        setMessage('Draw');
        return;
      }
      setBoard(nb);
      setTurn(turn === 'X' ? 'O' : 'X');
    }
  };

  const toOnline = () => navigate('/tictactoe/online');

  const disabled = useMemo(() => status !== 'playing', [status]);

  const themeClass = status === 'playing' ? (turn === 'X' ? 'theme-x' : 'theme-o') : '';
  return (
    <div className={themeClass}>
      {!mode && <ModeSelect onPick={(m) => (m === 'online' ? toOnline() : setMode(m))} />}

      {mode && mode !== 'online' && (
        <div>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 12 }}>
            <button className="btn" onClick={() => setMode(null)}>Back</button>
            <button className="btn" onClick={reset}>Play Again</button>
          </div>
          <ScoreBar x={x} o={o} draws={d} turn={turn} mode={mode} />
          <Board board={board} onCellClick={handleClick} disabled={disabled} winningLine={winnerLine} />
          {message ? (
            <div className={["banner", message === 'Draw' ? 'draw' : 'win'].join(' ')}>{message}</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
