/**
 * Bingo Game
 * Features:
 * - Random card generation (B:1-15, I:16-30, N:31-45, G:46-60, O:61-75)
 * - Number calling system
 * - AI opponent with automatic marking
 * - Bingo detection (rows, columns, diagonals, four corners)
 * - Score tracking with localStorage
 */

class BingoGame {
    constructor() {
        // Game configuration
        this.columns = {
            B: { min: 1, max: 15 },
            I: { min: 16, max: 30 },
            N: { min: 31, max: 45 },
            G: { min: 46, max: 60 },
            O: { min: 61, max: 75 }
        };
        this.columnOrder = ['B', 'I', 'N', 'G', 'O'];

        // Game state
        this.playerCard = [];
        this.aiCard = [];
        this.calledNumbers = [];
        this.availableNumbers = [];
        this.playerMarked = new Set();
        this.aiMarked = new Set();
        this.gameActive = true;
        this.currentNumber = null;

        // Scores
        this.scores = this.loadScores();

        // DOM Elements
        this.playerCardEl = document.getElementById('player-card');
        this.aiCardEl = document.getElementById('ai-card');
        this.currentCallEl = document.getElementById('current-call');
        this.calledListEl = document.getElementById('called-list');
        this.callBtn = document.getElementById('call-btn');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.resetScoresBtn = document.getElementById('reset-scores-btn');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.winnerOverlay = document.getElementById('winner-overlay');
        this.winnerIcon = document.getElementById('winner-icon');
        this.winnerTitle = document.getElementById('winner-title');
        this.winnerMessage = document.getElementById('winner-message');
        this.playerScoreEl = document.getElementById('player-score');
        this.aiScoreEl = document.getElementById('ai-score');

        // Initialize
        this.init();
    }

    init() {
        // Generate initial cards
        this.startNewGame();

        // Event listeners
        this.callBtn.addEventListener('click', () => this.callNumber());
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.resetScoresBtn.addEventListener('click', () => this.resetScores());
        this.playAgainBtn.addEventListener('click', () => this.closeOverlayAndRestart());

        // Update display
        this.updateScoreDisplay();
    }

    startNewGame() {
        // Reset state
        this.calledNumbers = [];
        this.playerMarked = new Set();
        this.aiMarked = new Set();
        this.gameActive = true;
        this.currentNumber = null;

        // Generate all available numbers (1-75)
        this.availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
        this.shuffleArray(this.availableNumbers);

        // Generate new cards
        this.playerCard = this.generateCard();
        this.aiCard = this.generateCard();

        // Mark free space
        this.playerMarked.add('FREE');
        this.aiMarked.add('FREE');

        // Render cards
        this.renderCard(this.playerCardEl, this.playerCard, true);
        this.renderCard(this.aiCardEl, this.aiCard, false);

        // Reset display
        this.currentCallEl.innerHTML = '<span class="number">--</span>';
        this.calledListEl.innerHTML = '';
        this.callBtn.disabled = false;
        this.winnerOverlay.classList.remove('active');
    }

    generateCard() {
        const card = [];

        for (let col = 0; col < 5; col++) {
            const column = this.columnOrder[col];
            const { min, max } = this.columns[column];
            const columnNumbers = [];

            // Generate numbers for this column
            const available = [];
            for (let n = min; n <= max; n++) {
                available.push(n);
            }
            this.shuffleArray(available);

            // Pick 5 numbers for this column
            for (let row = 0; row < 5; row++) {
                if (col === 2 && row === 2) {
                    // Center is FREE space
                    columnNumbers.push('FREE');
                } else {
                    columnNumbers.push(available.pop());
                }
            }

            card.push(columnNumbers);
        }

        return card;
    }

    renderCard(container, card, isPlayer) {
        container.innerHTML = '';

        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                const value = card[col][row];
                const cell = document.createElement('button');
                cell.className = 'bingo-cell';
                cell.dataset.col = col;
                cell.dataset.row = row;
                cell.dataset.value = value;

                if (value === 'FREE') {
                    cell.classList.add('free', 'marked');
                    cell.textContent = 'FREE';
                } else {
                    cell.textContent = value;
                }

                if (isPlayer) {
                    cell.addEventListener('click', (e) => this.handleCellClick(e));
                }

                container.appendChild(cell);
            }
        }
    }

    handleCellClick(e) {
        if (!this.gameActive) return;

        const cell = e.target;
        const value = cell.dataset.value;

        // Check if this number has been called
        if (value !== 'FREE' && !this.calledNumbers.includes(parseInt(value))) {
            // Number hasn't been called yet - shake animation or feedback
            cell.style.animation = 'none';
            cell.offsetHeight; // Trigger reflow
            cell.style.animation = 'pulse 0.3s ease';
            return;
        }

        // Mark the cell
        if (!cell.classList.contains('marked')) {
            cell.classList.add('marked');
            this.playerMarked.add(value === 'FREE' ? 'FREE' : parseInt(value));

            // Check for bingo
            if (this.checkBingo(this.playerCard, this.playerMarked)) {
                this.endGame('player');
            }
        }
    }

    callNumber() {
        if (!this.gameActive || this.availableNumbers.length === 0) return;

        // Get next number
        const number = this.availableNumbers.pop();
        this.currentNumber = number;
        this.calledNumbers.push(number);

        // Determine column letter
        const letter = this.getColumnLetter(number);

        // Update display
        this.currentCallEl.innerHTML = `
      <span class="letter">${letter}</span>
      <span class="number">${number}</span>
    `;

        // Add to called list
        const calledEl = document.createElement('span');
        calledEl.className = 'called-number';
        calledEl.textContent = `${letter}${number}`;
        this.calledListEl.appendChild(calledEl);

        // AI marks automatically after a delay
        setTimeout(() => {
            this.aiMarkNumber(number);
        }, 300);

        // Check if all numbers called
        if (this.availableNumbers.length === 0) {
            this.callBtn.disabled = true;
        }
    }

    aiMarkNumber(number) {
        if (!this.gameActive) return;

        // Check if AI's card has this number
        const col = this.getColumnIndex(number);

        for (let row = 0; row < 5; row++) {
            if (this.aiCard[col][row] === number) {
                // Mark on AI's card
                this.aiMarked.add(number);

                // Update UI
                const cells = this.aiCardEl.querySelectorAll('.bingo-cell');
                const cellIndex = row * 5 + col;
                cells[cellIndex].classList.add('marked');

                // Check for AI bingo
                if (this.checkBingo(this.aiCard, this.aiMarked)) {
                    this.endGame('ai');
                }

                break;
            }
        }
    }

    getColumnLetter(number) {
        if (number <= 15) return 'B';
        if (number <= 30) return 'I';
        if (number <= 45) return 'N';
        if (number <= 60) return 'G';
        return 'O';
    }

    getColumnIndex(number) {
        if (number <= 15) return 0;
        if (number <= 30) return 1;
        if (number <= 45) return 2;
        if (number <= 60) return 3;
        return 4;
    }

    checkBingo(card, marked) {
        // Check rows
        for (let row = 0; row < 5; row++) {
            let complete = true;
            for (let col = 0; col < 5; col++) {
                const value = card[col][row];
                if (!this.isMarked(value, marked)) {
                    complete = false;
                    break;
                }
            }
            if (complete) return true;
        }

        // Check columns
        for (let col = 0; col < 5; col++) {
            let complete = true;
            for (let row = 0; row < 5; row++) {
                const value = card[col][row];
                if (!this.isMarked(value, marked)) {
                    complete = false;
                    break;
                }
            }
            if (complete) return true;
        }

        // Check main diagonal
        let diagonal1 = true;
        for (let i = 0; i < 5; i++) {
            const value = card[i][i];
            if (!this.isMarked(value, marked)) {
                diagonal1 = false;
                break;
            }
        }
        if (diagonal1) return true;

        // Check anti-diagonal
        let diagonal2 = true;
        for (let i = 0; i < 5; i++) {
            const value = card[i][4 - i];
            if (!this.isMarked(value, marked)) {
                diagonal2 = false;
                break;
            }
        }
        if (diagonal2) return true;

        // Check four corners
        const corners = [
            card[0][0],
            card[4][0],
            card[0][4],
            card[4][4]
        ];
        if (corners.every(v => this.isMarked(v, marked))) {
            return true;
        }

        return false;
    }

    isMarked(value, marked) {
        if (value === 'FREE') return true;
        return marked.has(value);
    }

    endGame(winner) {
        this.gameActive = false;
        this.callBtn.disabled = true;

        // Update scores
        if (winner === 'player') {
            this.scores.player++;
        } else {
            this.scores.ai++;
        }
        this.saveScores();
        this.updateScoreDisplay();

        // Show winner overlay
        setTimeout(() => {
            this.showWinnerOverlay(winner);
        }, 500);
    }

    showWinnerOverlay(winner) {
        if (winner === 'player') {
            this.winnerIcon.textContent = '🎉';
            this.winnerTitle.textContent = 'BINGO!';
            this.winnerTitle.className = 'winner-title win';
            this.winnerMessage.textContent = 'You got Bingo first! Congratulations!';
        } else {
            this.winnerIcon.textContent = '🤖';
            this.winnerTitle.textContent = 'AI Wins!';
            this.winnerTitle.className = 'winner-title lose';
            this.winnerMessage.textContent = 'The AI got Bingo first. Try again!';
        }

        this.winnerOverlay.classList.add('active');
    }

    closeOverlayAndRestart() {
        this.winnerOverlay.classList.remove('active');
        setTimeout(() => this.startNewGame(), 300);
    }

    resetScores() {
        this.scores = { player: 0, ai: 0 };
        this.saveScores();
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        this.playerScoreEl.textContent = this.scores.player;
        this.aiScoreEl.textContent = this.scores.ai;
    }

    loadScores() {
        const saved = localStorage.getItem('bingo-scores');
        return saved ? JSON.parse(saved) : { player: 0, ai: 0 };
    }

    saveScores() {
        localStorage.setItem('bingo-scores', JSON.stringify(this.scores));
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BingoGame();
});
