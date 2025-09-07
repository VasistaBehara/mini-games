// Game State Management
let gameState = {
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X',
    gameMode: 'ai', // 'ai' or 'player'
    gameActive: true,
    scores: {
        playerX: 0,
        playerO: 0
    }
};

// Connect the Dots Game State
let connectDotsState = {
    size: 5, // Grid size (5x5, 6x6, 7x7, etc.)
    currentPlayer: 'red', // 'red' or 'blue'
    gameMode: 'ai', // 'ai' or 'player'
    gameActive: true,
    scores: {
        red: 0,
        blue: 0
    },
    lines: {
        horizontal: {}, // key: "row-col" format
        vertical: {}    // key: "row-col" format
    },
    boxes: {} // key: "row-col" format, value: 'red' or 'blue'
};

// DOM Elements
const modal = document.getElementById('ticTacToeModal');
const modeSelectionScreen = document.getElementById('modeSelectionScreen');
const gameScreen = document.getElementById('gameScreen');
const gameBoard = document.getElementById('gameBoard');
const currentPlayerText = document.getElementById('currentPlayerText');
const playerXScore = document.getElementById('playerXScore');
const playerOScore = document.getElementById('playerOScore');
const gameMessage = document.getElementById('gameMessage');
const gameModeTitle = document.getElementById('gameModeTitle');

// Connect the Dots DOM Elements
const connectDotsModal = document.getElementById('connectDotsModal');
const connectDotsModeSelection = document.getElementById('connectDotsModeSelection');
const connectDotsGameScreen = document.getElementById('connectDotsGameScreen');
const connectDotsBoard = document.getElementById('connectDotsBoard');
const connectDotsCurrentPlayer = document.getElementById('connectDotsCurrentPlayer');
const connectDotsRedScore = document.getElementById('connectDotsRedScore');
const connectDotsBlueScore = document.getElementById('connectDotsBlueScore');
const connectDotsMessage = document.getElementById('connectDotsMessage');
const connectDotsModeTitle = document.getElementById('connectDotsModeTitle');

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    loadScores();
});

// Navigation Functions
function scrollToGames() {
    document.getElementById('games').scrollIntoView({ behavior: 'smooth' });
}

function openTicTacToe() {
    modal.style.display = 'block';
    showModeSelection();
}

function closeTicTacToe() {
    modal.style.display = 'none';
    resetGame();
    showModeSelection();
}

// Mode Selection Functions
function showModeSelection() {
    modeSelectionScreen.style.display = 'block';
    gameScreen.style.display = 'none';
}

function showGameScreen() {
    modeSelectionScreen.style.display = 'none';
    gameScreen.style.display = 'block';
}

function selectGameMode(mode) {
    gameState.gameMode = mode;
    
    // Update game mode title
    if (mode === 'ai') {
        gameModeTitle.textContent = 'Tic Tac Toe - vs AI';
    } else if (mode === 'player') {
        gameModeTitle.textContent = 'Tic Tac Toe - vs Player';
    }
    
    showGameScreen();
    initializeGame();
}

function backToModeSelection() {
    showModeSelection();
    resetGame();
}

function showComingSoon() {
    showMessage("Online multiplayer coming soon! Stay tuned for updates.", 'draw');
    setTimeout(clearMessage, 3000);
}

// Game Initialization
function initializeGame() {
    createGameBoard();
    updateDisplay();
    clearMessage();
}

function createGameBoard() {
    gameBoard.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('button');
        cell.className = 'cell';
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', () => handleCellClick(i));
        gameBoard.appendChild(cell);
    }
}

// Game Logic
function handleCellClick(index) {
    if (gameState.board[index] !== '' || !gameState.gameActive) {
        return;
    }
    
    // Make player move
    makeMove(index, gameState.currentPlayer);
    
    if (checkGameEnd()) {
        return;
    }
    
    // Switch player or AI move
    if (gameState.gameMode === 'ai') {
        setTimeout(() => {
            if (gameState.gameActive) {
                makeAIMove();
                checkGameEnd();
            }
        }, 500);
    } else {
        switchPlayer();
    }
}

function makeMove(index, player) {
    gameState.board[index] = player;
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());
    cell.classList.add('disabled');
}

function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    updateDisplay();
}

function makeAIMove() {
    const bestMove = getBestMove();
    if (bestMove !== -1) {
        makeMove(bestMove, 'O');
    }
}

// AI Logic (Minimax Algorithm)
function getBestMove() {
    // Check for winning move
    for (let i = 0; i < 9; i++) {
        if (gameState.board[i] === '') {
            gameState.board[i] = 'O';
            if (checkWinner() === 'O') {
                gameState.board[i] = '';
                return i;
            }
            gameState.board[i] = '';
        }
    }
    
    // Check for blocking move
    for (let i = 0; i < 9; i++) {
        if (gameState.board[i] === '') {
            gameState.board[i] = 'X';
            if (checkWinner() === 'X') {
                gameState.board[i] = '';
                return i;
            }
            gameState.board[i] = '';
        }
    }
    
    // Prefer center
    if (gameState.board[4] === '') {
        return 4;
    }
    
    // Prefer corners
    const corners = [0, 2, 6, 8];
    for (let corner of corners) {
        if (gameState.board[corner] === '') {
            return corner;
        }
    }
    
    // Take any available move
    for (let i = 0; i < 9; i++) {
        if (gameState.board[i] === '') {
            return i;
        }
    }
    
    return -1;
}

// Win Detection
function checkGameEnd() {
    const winner = checkWinner();
    
    if (winner) {
        gameState.gameActive = false;
        updateScores(winner);
        showMessage(`${winner} Wins!`, 'win');
        disableAllCells();
        return true;
    }
    
    if (gameState.board.every(cell => cell !== '')) {
        gameState.gameActive = false;
        showMessage("It's a Draw!", 'draw');
        disableAllCells();
        return true;
    }
    
    return false;
}

function checkWinner() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];
    
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameState.board[a] && 
            gameState.board[a] === gameState.board[b] && 
            gameState.board[a] === gameState.board[c]) {
            return gameState.board[a];
        }
    }
    
    return null;
}

function disableAllCells() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.add('disabled');
    });
}

// Score Management
function updateScores(winner) {
    if (winner === 'X') {
        gameState.scores.playerX++;
    } else if (winner === 'O') {
        gameState.scores.playerO++;
    }
    
    updateScoreDisplay();
    saveScores();
}

function updateScoreDisplay() {
    playerXScore.textContent = gameState.scores.playerX;
    playerOScore.textContent = gameState.scores.playerO;
}

function resetScores() {
    gameState.scores.playerX = 0;
    gameState.scores.playerO = 0;
    updateScoreDisplay();
    saveScores();
    showMessage("Scores reset!", 'draw');
    setTimeout(clearMessage, 2000);
}

// Local Storage
function saveScores() {
    localStorage.setItem('ticTacToeScores', JSON.stringify(gameState.scores));
}

function loadScores() {
    const savedScores = localStorage.getItem('ticTacToeScores');
    if (savedScores) {
        gameState.scores = JSON.parse(savedScores);
        updateScoreDisplay();
    }
}

// Game Reset
function resetGame() {
    gameState.board = ['', '', '', '', '', '', '', '', ''];
    gameState.currentPlayer = 'X';
    gameState.gameActive = true;
    
    createGameBoard();
    updateDisplay();
    clearMessage();
}

function restartGame() {
    resetGame();
    showMessage("Game restarted!", 'draw');
    setTimeout(clearMessage, 2000);
}

// Display Updates
function updateDisplay() {
    const playerName = gameState.currentPlayer === 'X' ? 'Player X' : 
                      (gameState.gameMode === 'ai' ? 'AI (O)' : 'Player O');
    currentPlayerText.textContent = `${playerName}'s Turn`;
}

function showMessage(message, type) {
    gameMessage.textContent = message;
    gameMessage.className = `game-message ${type}`;
}

function clearMessage() {
    gameMessage.textContent = '';
    gameMessage.className = 'game-message';
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        closeTicTacToe();
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        closeTicTacToe();
    }
});

// Add some fun animations
function addCellAnimation(cell) {
    cell.style.transform = 'scale(0)';
    cell.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
        cell.style.transform = 'scale(1)';
    }, 100);
}

// Enhanced cell click with animation
function handleCellClick(index) {
    if (gameState.board[index] !== '' || !gameState.gameActive) {
        return;
    }
    
    const cell = document.querySelector(`[data-index="${index}"]`);
    addCellAnimation(cell);
    
    // Make player move
    makeMove(index, gameState.currentPlayer);
    
    if (checkGameEnd()) {
        return;
    }
    
    // Switch player or AI move
    if (gameState.gameMode === 'ai') {
        setTimeout(() => {
            if (gameState.gameActive) {
                makeAIMove();
                checkGameEnd();
            }
        }, 500);
    } else {
        switchPlayer();
    }
}

// Add winning line highlight
function highlightWinningLine() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];
    
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameState.board[a] && 
            gameState.board[a] === gameState.board[b] && 
            gameState.board[a] === gameState.board[c]) {
            
            // Highlight winning cells
            combination.forEach(index => {
                const cell = document.querySelector(`[data-index="${index}"]`);
                cell.style.background = '#ffeb3b';
                cell.style.transform = 'scale(1.1)';
            });
            break;
        }
    }
}

// Update checkGameEnd to include highlighting
function checkGameEnd() {
    const winner = checkWinner();
    
    if (winner) {
        gameState.gameActive = false;
        updateScores(winner);
        showMessage(`${winner} Wins!`, 'win');
        disableAllCells();
        highlightWinningLine();
        return true;
    }
    
    if (gameState.board.every(cell => cell !== '')) {
        gameState.gameActive = false;
        showMessage("It's a Draw!", 'draw');
        disableAllCells();
        return true;
    }
    
    return false;
}
