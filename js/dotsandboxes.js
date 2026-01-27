/**
 * Dots and Boxes Game
 * Features:
 * - 2-4 players (human or AI)
 * - Configurable board sizes (3x3 to 6x6)
 * - Smart AI opponent
 * - Score tracking
 * - Auto-save game state
 */

class DotsAndBoxes {
    constructor() {
        // Game configuration
        this.boardSize = 3;
        this.players = [];
        this.currentPlayerIndex = 0;

        // Game state
        this.horizontalLines = []; // [row][col] - true if drawn
        this.verticalLines = [];   // [row][col] - true if drawn
        this.boxes = [];           // [row][col] - player index who claimed, or null
        this.scores = [];
        this.gameActive = false;
        this.totalBoxes = 0;
        this.claimedBoxes = 0;

        // DOM Elements
        this.setupScreen = document.getElementById('setup-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.boardEl = document.getElementById('board');
        this.scoreboardEl = document.getElementById('scoreboard');
        this.turnIndicatorEl = document.getElementById('turn-indicator');
        this.winnerOverlay = document.getElementById('winner-overlay');
        this.winnerTitle = document.getElementById('winner-title');
        this.winnerMessage = document.getElementById('winner-message');

        // Initialize
        this.init();
    }

    init() {
        // Setup screen event listeners
        document.querySelectorAll('.setup-option[data-size]').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectBoardSize(e));
        });

        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('menu-btn').addEventListener('click', () => this.showSetup());
        document.getElementById('play-again-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('new-game-btn').addEventListener('click', () => this.showSetup());

        // Check for saved game
        this.loadGame();
    }

    selectBoardSize(e) {
        document.querySelectorAll('.setup-option[data-size]').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        this.boardSize = parseInt(e.target.dataset.size);
    }

    startGame() {
        // Get player configuration
        this.players = [{ type: 'human', name: 'Player 1' }];

        const p2Type = document.getElementById('p2-type').value;
        if (p2Type !== 'none') {
            this.players.push({ type: p2Type, name: 'Player 2' });
        }

        const p3Type = document.getElementById('p3-type').value;
        if (p3Type !== 'none') {
            this.players.push({ type: p3Type, name: 'Player 3' });
        }

        const p4Type = document.getElementById('p4-type').value;
        if (p4Type !== 'none') {
            this.players.push({ type: p4Type, name: 'Player 4' });
        }

        // Need at least 2 players
        if (this.players.length < 2) {
            alert('Please add at least one opponent!');
            return;
        }

        // Initialize game state
        this.initializeGameState();

        // Switch screens
        this.setupScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');

        // Render
        this.renderBoard();
        this.renderScoreboard();
        this.updateTurnIndicator();

        this.gameActive = true;
        this.saveGame();

        // If first player is AI, make move
        if (this.players[0].type === 'ai') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    initializeGameState() {
        const size = this.boardSize;

        // Horizontal lines: (size+1) rows, size columns
        this.horizontalLines = Array(size + 1).fill(null).map(() => Array(size).fill(false));

        // Vertical lines: size rows, (size+1) columns
        this.verticalLines = Array(size).fill(null).map(() => Array(size + 1).fill(false));

        // Boxes: size x size grid
        this.boxes = Array(size).fill(null).map(() => Array(size).fill(null));

        // Scores
        this.scores = Array(this.players.length).fill(0);

        this.currentPlayerIndex = 0;
        this.totalBoxes = size * size;
        this.claimedBoxes = 0;
    }

    renderBoard() {
        const size = this.boardSize;
        this.boardEl.innerHTML = '';

        // Build the board row by row
        for (let row = 0; row <= size; row++) {
            // Dot row (dots + horizontal lines)
            const dotRow = document.createElement('div');
            dotRow.className = 'dab-row';

            for (let col = 0; col <= size; col++) {
                // Add dot
                const dot = document.createElement('div');
                dot.className = 'dab-dot';
                dotRow.appendChild(dot);

                // Add horizontal line (except after last dot)
                if (col < size) {
                    const hLine = document.createElement('div');
                    hLine.className = 'dab-line horizontal';
                    hLine.dataset.row = row;
                    hLine.dataset.col = col;
                    hLine.dataset.type = 'h';

                    if (this.horizontalLines[row][col]) {
                        hLine.classList.add('drawn');
                        // Find who drew it (we don't track this, so just use current styling)
                    }

                    hLine.addEventListener('click', () => this.handleLineClick('h', row, col));
                    dotRow.appendChild(hLine);
                }
            }

            this.boardEl.appendChild(dotRow);

            // Box row (vertical lines + boxes) - except after last dot row
            if (row < size) {
                const boxRow = document.createElement('div');
                boxRow.className = 'dab-row';

                for (let col = 0; col <= size; col++) {
                    // Add vertical line
                    const vLine = document.createElement('div');
                    vLine.className = 'dab-line vertical';
                    vLine.dataset.row = row;
                    vLine.dataset.col = col;
                    vLine.dataset.type = 'v';

                    if (this.verticalLines[row][col]) {
                        vLine.classList.add('drawn');
                    }

                    vLine.addEventListener('click', () => this.handleLineClick('v', row, col));
                    boxRow.appendChild(vLine);

                    // Add box (except after last vertical line)
                    if (col < size) {
                        const box = document.createElement('div');
                        box.className = 'dab-box';
                        box.dataset.row = row;
                        box.dataset.col = col;

                        if (this.boxes[row][col] !== null) {
                            const playerNum = this.boxes[row][col] + 1;
                            box.classList.add(`p${playerNum}`, 'claimed');
                            box.textContent = playerNum;
                        }

                        boxRow.appendChild(box);
                    }
                }

                this.boardEl.appendChild(boxRow);
            }
        }
    }

    renderScoreboard() {
        this.scoreboardEl.innerHTML = '';

        this.players.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = `dab-score-item${index === this.currentPlayerIndex ? ' active' : ''}`;
            item.id = `score-p${index + 1}`;

            item.innerHTML = `
        <span class="player-dot p${index + 1}"></span>
        <span class="name">${player.name}</span>
        <span class="score">${this.scores[index]}</span>
      `;

            this.scoreboardEl.appendChild(item);
        });
    }

    updateTurnIndicator() {
        const player = this.players[this.currentPlayerIndex];
        const isAI = player.type === 'ai';
        this.turnIndicatorEl.textContent = `${player.name}'s Turn${isAI ? ' (AI thinking...)' : ''}`;
        this.turnIndicatorEl.className = `turn-indicator p${this.currentPlayerIndex + 1}-turn`;
    }

    handleLineClick(type, row, col) {
        if (!this.gameActive) return;

        // Check if current player is human
        if (this.players[this.currentPlayerIndex].type !== 'human') return;

        // Check if line is already drawn
        if (type === 'h' && this.horizontalLines[row][col]) return;
        if (type === 'v' && this.verticalLines[row][col]) return;

        this.makeMove(type, row, col);
    }

    makeMove(type, row, col) {
        const currentPlayer = this.currentPlayerIndex;

        // Draw the line
        if (type === 'h') {
            this.horizontalLines[row][col] = true;
        } else {
            this.verticalLines[row][col] = true;
        }

        // Update DOM
        const lineEl = document.querySelector(`.dab-line[data-type="${type}"][data-row="${row}"][data-col="${col}"]`);
        if (lineEl) {
            lineEl.classList.add('drawn', `p${currentPlayer + 1}`);
        }

        // Check if any boxes were completed
        const completedBoxes = this.checkCompletedBoxes(type, row, col, currentPlayer);

        // Update scores
        if (completedBoxes.length > 0) {
            this.scores[currentPlayer] += completedBoxes.length;
            this.claimedBoxes += completedBoxes.length;

            // Mark boxes in DOM
            completedBoxes.forEach(([bRow, bCol]) => {
                const boxEl = document.querySelector(`.dab-box[data-row="${bRow}"][data-col="${bCol}"]`);
                if (boxEl) {
                    boxEl.classList.add(`p${currentPlayer + 1}`, 'claimed');
                    boxEl.textContent = currentPlayer + 1;
                }
            });

            this.renderScoreboard();
        }

        // Check for game end
        if (this.claimedBoxes >= this.totalBoxes) {
            this.endGame();
            return;
        }

        // If no box completed, switch player
        if (completedBoxes.length === 0) {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        }

        this.updateTurnIndicator();
        this.renderScoreboard();
        this.saveGame();

        // If next player is AI, trigger AI move
        if (this.gameActive && this.players[this.currentPlayerIndex].type === 'ai') {
            setTimeout(() => this.makeAIMove(), 600);
        }
    }

    checkCompletedBoxes(type, row, col, playerIndex) {
        const completed = [];
        const size = this.boardSize;

        if (type === 'h') {
            // Horizontal line - check box above and below
            // Box above (row-1, col)
            if (row > 0) {
                if (this.isBoxComplete(row - 1, col)) {
                    this.boxes[row - 1][col] = playerIndex;
                    completed.push([row - 1, col]);
                }
            }
            // Box below (row, col)
            if (row < size) {
                if (this.isBoxComplete(row, col)) {
                    this.boxes[row][col] = playerIndex;
                    completed.push([row, col]);
                }
            }
        } else {
            // Vertical line - check box left and right
            // Box left (row, col-1)
            if (col > 0) {
                if (this.isBoxComplete(row, col - 1)) {
                    this.boxes[row][col - 1] = playerIndex;
                    completed.push([row, col - 1]);
                }
            }
            // Box right (row, col)
            if (col < size) {
                if (this.isBoxComplete(row, col)) {
                    this.boxes[row][col] = playerIndex;
                    completed.push([row, col]);
                }
            }
        }

        return completed;
    }

    isBoxComplete(row, col) {
        if (this.boxes[row][col] !== null) return false; // Already claimed

        // Check all 4 sides
        const top = this.horizontalLines[row][col];
        const bottom = this.horizontalLines[row + 1][col];
        const left = this.verticalLines[row][col];
        const right = this.verticalLines[row][col + 1];

        return top && bottom && left && right;
    }

    // AI Logic
    makeAIMove() {
        if (!this.gameActive) return;

        const move = this.findBestMove();
        if (move) {
            this.makeMove(move.type, move.row, move.col);
        }
    }

    findBestMove() {
        const availableMoves = this.getAvailableMoves();
        if (availableMoves.length === 0) return null;

        // Priority 1: Complete a box
        for (const move of availableMoves) {
            const boxCount = this.countBoxesCompleted(move.type, move.row, move.col);
            if (boxCount > 0) {
                return move;
            }
        }

        // Priority 2: Avoid giving opponent a box (moves that leave 3 sides)
        const safeMoves = availableMoves.filter(move => !this.wouldGiveBox(move));

        if (safeMoves.length > 0) {
            // Pick random safe move
            return safeMoves[Math.floor(Math.random() * safeMoves.length)];
        }

        // No safe moves - pick random (forced to give boxes)
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    getAvailableMoves() {
        const moves = [];
        const size = this.boardSize;

        // Horizontal lines
        for (let row = 0; row <= size; row++) {
            for (let col = 0; col < size; col++) {
                if (!this.horizontalLines[row][col]) {
                    moves.push({ type: 'h', row, col });
                }
            }
        }

        // Vertical lines
        for (let row = 0; row < size; row++) {
            for (let col = 0; col <= size; col++) {
                if (!this.verticalLines[row][col]) {
                    moves.push({ type: 'v', row, col });
                }
            }
        }

        return moves;
    }

    countBoxesCompleted(type, row, col) {
        let count = 0;
        const size = this.boardSize;

        // Temporarily draw line
        if (type === 'h') {
            this.horizontalLines[row][col] = true;
        } else {
            this.verticalLines[row][col] = true;
        }

        // Check adjacent boxes
        if (type === 'h') {
            if (row > 0 && this.boxes[row - 1][col] === null && this.isBoxCompleteCheck(row - 1, col)) count++;
            if (row < size && this.boxes[row][col] === null && this.isBoxCompleteCheck(row, col)) count++;
        } else {
            if (col > 0 && this.boxes[row][col - 1] === null && this.isBoxCompleteCheck(row, col - 1)) count++;
            if (col < size && this.boxes[row][col] === null && this.isBoxCompleteCheck(row, col)) count++;
        }

        // Undo temporary draw
        if (type === 'h') {
            this.horizontalLines[row][col] = false;
        } else {
            this.verticalLines[row][col] = false;
        }

        return count;
    }

    isBoxCompleteCheck(row, col) {
        const top = this.horizontalLines[row][col];
        const bottom = this.horizontalLines[row + 1][col];
        const left = this.verticalLines[row][col];
        const right = this.verticalLines[row][col + 1];
        return top && bottom && left && right;
    }

    wouldGiveBox(move) {
        const size = this.boardSize;

        // Temporarily draw line
        if (move.type === 'h') {
            this.horizontalLines[move.row][move.col] = true;
        } else {
            this.verticalLines[move.row][move.col] = true;
        }

        // Check if any unclaimed box now has 3 sides
        let wouldGive = false;

        if (move.type === 'h') {
            if (move.row > 0 && this.boxes[move.row - 1][move.col] === null) {
                if (this.countSides(move.row - 1, move.col) === 3) wouldGive = true;
            }
            if (move.row < size && this.boxes[move.row][move.col] === null) {
                if (this.countSides(move.row, move.col) === 3) wouldGive = true;
            }
        } else {
            if (move.col > 0 && this.boxes[move.row][move.col - 1] === null) {
                if (this.countSides(move.row, move.col - 1) === 3) wouldGive = true;
            }
            if (move.col < size && this.boxes[move.row][move.col] === null) {
                if (this.countSides(move.row, move.col) === 3) wouldGive = true;
            }
        }

        // Undo temporary draw
        if (move.type === 'h') {
            this.horizontalLines[move.row][move.col] = false;
        } else {
            this.verticalLines[move.row][move.col] = false;
        }

        return wouldGive;
    }

    countSides(row, col) {
        let count = 0;
        if (this.horizontalLines[row][col]) count++;
        if (this.horizontalLines[row + 1][col]) count++;
        if (this.verticalLines[row][col]) count++;
        if (this.verticalLines[row][col + 1]) count++;
        return count;
    }

    endGame() {
        this.gameActive = false;

        // Find winner
        const maxScore = Math.max(...this.scores);
        const winners = this.players.filter((_, i) => this.scores[i] === maxScore);

        if (winners.length > 1) {
            this.winnerTitle.textContent = "It's a Tie!";
            this.winnerTitle.className = 'winner-title draw';
        } else {
            const winnerIndex = this.scores.indexOf(maxScore);
            const winner = this.players[winnerIndex];
            this.winnerTitle.textContent = `${winner.name} Wins!`;
            this.winnerTitle.className = `winner-title win`;
        }

        this.winnerMessage.textContent = `Final Scores: ${this.players.map((p, i) => `${p.name}: ${this.scores[i]}`).join(' | ')}`;
        this.winnerOverlay.classList.add('active');

        localStorage.removeItem('dotsandboxes-save');
    }

    restartGame() {
        this.winnerOverlay.classList.remove('active');
        this.initializeGameState();
        this.renderBoard();
        this.renderScoreboard();
        this.updateTurnIndicator();
        this.gameActive = true;
        this.saveGame();

        if (this.players[0].type === 'ai') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    showSetup() {
        this.winnerOverlay.classList.remove('active');
        this.gameScreen.classList.add('hidden');
        this.setupScreen.classList.remove('hidden');
        this.gameActive = false;
        localStorage.removeItem('dotsandboxes-save');
    }

    saveGame() {
        const state = {
            boardSize: this.boardSize,
            players: this.players,
            currentPlayerIndex: this.currentPlayerIndex,
            horizontalLines: this.horizontalLines,
            verticalLines: this.verticalLines,
            boxes: this.boxes,
            scores: this.scores,
            totalBoxes: this.totalBoxes,
            claimedBoxes: this.claimedBoxes
        };
        localStorage.setItem('dotsandboxes-save', JSON.stringify(state));
    }

    loadGame() {
        const saved = localStorage.getItem('dotsandboxes-save');
        if (!saved) return;

        try {
            const state = JSON.parse(saved);

            this.boardSize = state.boardSize;
            this.players = state.players;
            this.currentPlayerIndex = state.currentPlayerIndex;
            this.horizontalLines = state.horizontalLines;
            this.verticalLines = state.verticalLines;
            this.boxes = state.boxes;
            this.scores = state.scores;
            this.totalBoxes = state.totalBoxes;
            this.claimedBoxes = state.claimedBoxes;

            // Update board size selection
            document.querySelectorAll('.setup-option[data-size]').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.size) === this.boardSize);
            });

            // Show game screen
            this.setupScreen.classList.add('hidden');
            this.gameScreen.classList.remove('hidden');

            this.renderBoard();
            this.renderScoreboard();
            this.updateTurnIndicator();
            this.gameActive = true;

            // If current player is AI, make move
            if (this.players[this.currentPlayerIndex].type === 'ai') {
                setTimeout(() => this.makeAIMove(), 500);
            }
        } catch (e) {
            console.error('Failed to load saved game:', e);
            localStorage.removeItem('dotsandboxes-save');
        }
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DotsAndBoxes();
});
