import GameCard from './GameCard';

export default function Menu() {
  return (
    <div className="games">
      <GameCard title="TicTacToe" description="Play classic TicTacToe: single, local, or online" to="/tictactoe" />
      <GameCard title="Bingo" description="Multiplayer Bingo" disabled />
      <GameCard title="Connect-the-Dots" description="Connect dots to win" disabled />
    </div>
  );
}

