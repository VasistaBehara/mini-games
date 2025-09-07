import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Board from '../Board';
import ScoreBar from '../ScoreBar';
import type { Cell, SymbolXO } from '../logic';
import { getSocket } from './socket';

export default function Room() {
  const { code = '' } = useParams();
  const socket = getSocket();
  const navigate = useNavigate();
  const [symbol, setSymbol] = useState<SymbolXO | null>(null);
  const [board, setBoard] = useState<Cell[]>(Array<Cell>(9).fill(null));
  const [turn, setTurn] = useState<SymbolXO | null>('X');
  const [status, setStatus] = useState<'playing' | 'game_over'>('playing');
  const [message, setMessage] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | undefined>(undefined);

  useEffect(() => {
    const onJoined = (p: { symbol: SymbolXO; board: Cell[]; turn: SymbolXO; status: 'playing' | 'game_over' }) => {
      setSymbol(p.symbol);
      setBoard(p.board);
      setTurn(p.turn);
      setStatus(p.status);
    };
    const onState = (p: { board: Cell[]; turn: SymbolXO; status: 'playing' | 'game_over'; winningLine?: number[] }) => {
      setBoard(p.board);
      setTurn(p.turn);
      setStatus(p.status);
      setWinningLine(p.winningLine);
    };
    const onOver = (p: { result: SymbolXO | 'draw'; winningLine?: number[] }) => {
      setStatus('game_over');
      setWinningLine(p.winningLine);
      if (p.result === 'draw') setMessage('Draw');
      else setMessage(`${p.result} wins`);
    };
    const onError = ({ message }: { message: string }) => setMessage(message);
    const onLeft = () => {
      setMessage('Opponent disconnected');
      setTimeout(() => navigate('/tictactoe/online'), 1500);
    };

    socket.on('joined', onJoined);
    socket.on('state', onState);
    socket.on('game_over', onOver);
    socket.on('error_msg', onError);
    socket.on('opponent_left', onLeft);

    if (code) socket.emit('join_room', code);

    return () => {
      socket.off('joined', onJoined);
      socket.off('state', onState);
      socket.off('game_over', onOver);
      socket.off('error_msg', onError);
      socket.off('opponent_left', onLeft);
    };
  }, [socket, code]);

  const myTurn = symbol && turn === symbol && status === 'playing';
  const onlineInfo = symbol ? `You are ${symbol}` : 'Joining...';

  const onCellClick = (i: number) => {
    if (!myTurn || board[i] !== null || !code) return;
    socket.emit('make_move', { roomCode: code, index: i });
  };

  const restart = () => {
    if (code) socket.emit('restart', code);
    setMessage(null);
    setWinningLine(undefined);
  };

  const disabled = useMemo(() => status !== 'playing' || !myTurn, [status, myTurn]);

  const themeClass = status === 'playing' && turn ? (turn === 'X' ? 'theme-x' : 'theme-o') : '';
  return (
    <div className={themeClass}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <button className="btn" onClick={() => navigate('/tictactoe/online')}>Back</button>
        <div className="pill">Room: {code}</div>
        <button className="btn" onClick={restart}>Restart</button>
      </div>
      <div style={{ height: 12 }} />
      <ScoreBar x={0} o={0} draws={0} turn={turn ?? null} onlineInfo={onlineInfo} mode="online" />
      <Board board={board} onCellClick={onCellClick} disabled={disabled} winningLine={winningLine} />
      {message ? <div className={["banner", message === 'Draw' ? 'draw' : 'win'].join(' ')}>{message}</div> : null}
      {!myTurn && status === 'playing' ? <div className="center subtitle">Waiting for opponent...</div> : null}
    </div>
  );
}
