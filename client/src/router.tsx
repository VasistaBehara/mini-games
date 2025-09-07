import { useRoutes } from 'react-router-dom';
import Menu from './components/Menu';
import TicTacToePage from './games/tictactoe/TicTacToePage';
import Lobby from './games/tictactoe/online/Lobby';
import Room from './games/tictactoe/online/Room';

export default function Router() {
  const element = useRoutes([
    { path: '/', element: <Menu /> },
    { path: '/tictactoe', element: <TicTacToePage /> },
    { path: '/tictactoe/online', element: <Lobby /> },
    { path: '/tictactoe/online/room/:code', element: <Room /> }
  ]);
  return element;
}

