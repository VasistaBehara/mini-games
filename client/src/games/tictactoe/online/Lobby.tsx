import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from './socket';

export default function Lobby() {
  const socket = getSocket();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onCreated = ({ roomCode }: { roomCode: string }) => {
      navigate(`/tictactoe/online/room/${roomCode}`);
    };
    const onError = ({ message }: { message: string }) => setError(message);
    socket.on('room_created', onCreated);
    socket.on('error_msg', onError);
    return () => {
      socket.off('room_created', onCreated);
      socket.off('error_msg', onError);
    };
  }, [socket, navigate]);

  const createRoom = () => {
    setError(null);
    socket.emit('create_room');
  };

  const joinRoom = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code.trim()) return;
    socket.emit('join_room', code.trim().toUpperCase());
    navigate(`/tictactoe/online/room/${code.trim().toUpperCase()}`);
  };

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <a className="btn" href="/tictactoe">Back</a>
        <button className="btn primary" onClick={createRoom}>Create room</button>
      </div>
      <div style={{ height: 12 }} />
      <form onSubmit={joinRoom} className="row" style={{ gap: 8 }}>
        <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter room code" />
        <button className="btn" type="submit">Join</button>
      </form>
      {error ? <div className="subtitle" style={{ color: '#ef4444', marginTop: 8 }}>{error}</div> : null}
    </div>
  );
}

