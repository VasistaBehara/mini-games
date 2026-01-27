/**
 * Tic-Tac-Toe Game
 * Features:
 * - Minimax AI algorithm (unbeatable)
 * - Score tracking with localStorage
 * - Winner detection and celebration
 * - Quick restart functionality
 */

class TicTacToe {
    constructor() {
        // Game state
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X'; // X = Player, O = AI
        this.gameActive = true;
        this.winningCombination = null;

        // Winning combinations
        this.winPatterns = [
            [0, 1, 2], // Top row
            [3, 4, 5], // Middle row
            [6, 7, 8], // Bottom row
            [0, 3, 6], // Left column
            [1, 4, 7], // Middle column
            [2, 5, 8], // Right column
            [0, 4, 8], // Diagonal
            [2, 4, 6]  // Anti-diagonal
        ];

        // Scores
        this.scores = this.loadScores();

        // DOM Elements
        this.cells = document.querySelectorAll('.ttt-cell');
        this.turnIndicator = document.getElementById('turn-indicator');
        this.playerScoreEl = document.getElementById('player-score');
        this.aiScoreEl = document.getElementById('ai-score');
        this.drawsScoreEl = document.getElementById('draws-score');
        this.winnerOverlay = document.getElementById('winner-overlay');
        this.winnerIcon = document.getElementById('winner-icon');
        this.winnerTitle = document.getElementById('winner-title');
        this.winnerMessage = document.getElementById('winner-message');
        this.restartBtn = document.getElementById('restart-btn');
        this.resetScoresBtn = document.getElementById('reset-scores-btn');
        this.playAgainBtn = document.getElementById('play-again-btn');

        // Initialize
        this.init();
    }

    init() {
        // Add event listeners
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });

        this.restartBtn.addEventListener('click', () => this.resetGame());
        this.resetScoresBtn.addEventListener('click', () => this.resetScores());
        this.playAgainBtn.addEventListener('click', () => this.closeOverlayAndRestart());

        // Update score display
        this.updateScoreDisplay();
    }

    handleCellClick(e) {
        const index = parseInt(e.target.dataset.index);

        // Check if valid move
        if (!this.gameActive || this.board[index] || this.currentPlayer !== 'X') {
            return;
        }

        // Make player move
        this.makeMove(index, 'X');

        // Check for game end
        if (this.checkGameEnd()) return;

        // AI's turn
        this.currentPlayer = 'O';
        this.updateTurnIndicator();

        // AI makes move after a short delay
        setTimeout(() => {
            if (this.gameActive) {
                this.aiMove();
            }
        }, 500);
    }

    makeMove(index, player) {
        this.board[index] = player;
        const cell = this.cells[index];
        cell.textContent = player;
        cell.classList.add(player.toLowerCase(), 'taken', 'animate');
    }

    aiMove() {
        const bestMove = this.minimax(this.board, 'O').index;
        this.makeMove(bestMove, 'O');

        if (!this.checkGameEnd()) {
            this.currentPlayer = 'X';
            this.updateTurnIndicator();
        }
    }

    // Minimax algorithm for unbeatable AI
    minimax(board, player) {
        const availableMoves = this.getAvailableMoves(board);

        // Check terminal states
        if (this.checkWinner(board, 'X')) {
            return { score: -10 };
        } else if (this.checkWinner(board, 'O')) {
            return { score: 10 };
        } else if (availableMoves.length === 0) {
            return { score: 0 };
        }

        const moves = [];

        for (let i = 0; i < availableMoves.length; i++) {
            const move = {};
            move.index = availableMoves[i];

            // Make the move
            board[availableMoves[i]] = player;

            // Get the score from the opponent's perspective
            if (player === 'O') {
                const result = this.minimax(board, 'X');
                move.score = result.score;
            } else {
                const result = this.minimax(board, 'O');
                move.score = result.score;
            }

            // Undo the move
            board[availableMoves[i]] = null;

            moves.push(move);
        }

        // Find the best move
        let bestMove;
        if (player === 'O') {
            let bestScore = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        return moves[bestMove];
    }

    getAvailableMoves(board) {
        const moves = [];
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                moves.push(i);
            }
        }
        return moves;
    }

    checkWinner(board, player) {
        for (const pattern of this.winPatterns) {
            if (
                board[pattern[0]] === player &&
                board[pattern[1]] === player &&
                board[pattern[2]] === player
            ) {
                return pattern;
            }
        }
        return null;
    }

    checkGameEnd() {
        // Check for winner
        const xWins = this.checkWinner(this.board, 'X');
        const oWins = this.checkWinner(this.board, 'O');

        if (xWins) {
            this.winningCombination = xWins;
            this.endGame('win');
            return true;
        }

        if (oWins) {
            this.winningCombination = oWins;
            this.endGame('lose');
            return true;
        }

        // Check for draw
        if (!this.board.includes(null)) {
            this.endGame('draw');
            return true;
        }

        return false;
    }

    endGame(result) {
        this.gameActive = false;

        // Highlight winning cells
        if (this.winningCombination) {
            this.winningCombination.forEach(index => {
                this.cells[index].classList.add('winning');
            });
        }

        // Update scores
        if (result === 'win') {
            this.scores.player++;
        } else if (result === 'lose') {
            this.scores.ai++;
        } else {
            this.scores.draws++;
        }

        this.saveScores();
        this.updateScoreDisplay();

        // Show winner overlay after animation
        setTimeout(() => {
            this.showWinnerOverlay(result);
        }, 800);
    }

    showWinnerOverlay(result) {
        const config = {
            win: {
                icon: '🎉',
                title: 'You Win!',
                message: 'Amazing! You beat the AI!',
                titleClass: 'win'
            },
            lose: {
                icon: '🤖',
                title: 'AI Wins!',
                message: 'The AI got the better of you this time.',
                titleClass: 'lose'
            },
            draw: {
                icon: '🤝',
                title: "It's a Draw!",
                message: 'Great minds think alike!',
                titleClass: 'draw'
            }
        };

        const { icon, title, message, titleClass } = config[result];

        this.winnerIcon.textContent = icon;
        this.winnerTitle.textContent = title;
        this.winnerTitle.className = 'winner-title ' + titleClass;
        this.winnerMessage.textContent = message;
        this.winnerOverlay.classList.add('active');
    }

    closeOverlayAndRestart() {
        this.winnerOverlay.classList.remove('active');
        setTimeout(() => this.resetGame(), 300);
    }

    resetGame() {
        // Reset state
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.winningCombination = null;

        // Reset UI
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'ttt-cell';
        });

        this.updateTurnIndicator();
        this.winnerOverlay.classList.remove('active');
    }

    resetScores() {
        this.scores = { player: 0, ai: 0, draws: 0 };
        this.saveScores();
        this.updateScoreDisplay();
    }

    updateTurnIndicator() {
        if (this.currentPlayer === 'X') {
            this.turnIndicator.textContent = 'Your Turn';
            this.turnIndicator.className = 'turn-indicator player-turn';
        } else {
            this.turnIndicator.textContent = "AI's Turn";
            this.turnIndicator.className = 'turn-indicator ai-turn';
        }
    }

    updateScoreDisplay() {
        this.playerScoreEl.textContent = this.scores.player;
        this.aiScoreEl.textContent = this.scores.ai;
        this.drawsScoreEl.textContent = this.scores.draws;
    }

    loadScores() {
        const saved = localStorage.getItem('tictactoe-scores');
        return saved ? JSON.parse(saved) : { player: 0, ai: 0, draws: 0 };
    }

    saveScores() {
        localStorage.setItem('tictactoe-scores', JSON.stringify(this.scores));
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
