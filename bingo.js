// ==================== BINGO GAME ====================

// Bingo Game State
let bingoState = {
    gameMode: null, // 'host' or 'join'
    gameId: null,
    playerName: null,
    isHost: false,
    gameActive: false,
    currentNumber: null,
    calledNumbers: [],
    players: [],
    myBoard: [],
    markedCells: new Set(),
    gameStatus: 'waiting', // 'waiting', 'playing', 'ended'
    restartVotes: new Set(),
    winner: null
};

// Global games storage using localStorage for cross-tab communication
const GAMES_STORAGE_KEY = 'bingo_active_games';

function getActiveGames() {
    const stored = localStorage.getItem(GAMES_STORAGE_KEY);
    return stored ? new Map(JSON.parse(stored)) : new Map();
}

function saveActiveGames(games) {
    localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(Array.from(games.entries())));
}

function removeGame(gameId) {
    const games = getActiveGames();
    games.delete(gameId);
    saveActiveGames(games);
}

// DOM Elements
const bingoModal = document.getElementById('bingoModal');
const bingoGameSelection = document.getElementById('bingoGameSelection');
const bingoHostScreen = document.getElementById('bingoHostScreen');
const bingoJoinScreen = document.getElementById('bingoJoinScreen');
const bingoGameScreen = document.getElementById('bingoGameScreen');
const gameIdElement = document.getElementById('gameId');
const playerCountElement = document.getElementById('playerCount');
const playersListElement = document.getElementById('playersList');
const gameIdInput = document.getElementById('gameIdInput');
const playerNameInput = document.getElementById('playerNameInput');
const bingoGameTitle = document.getElementById('bingoGameTitle');
const currentBingoNumber = document.getElementById('currentBingoNumber');
const gameStatusElement = document.getElementById('gameStatus');
const bingoBoard = document.getElementById('bingoBoard');
const bingoMessage = document.getElementById('bingoMessage');
const calledNumbersList = document.getElementById('calledNumbersList');
const playersStatusList = document.getElementById('playersStatusList');
const playersStatusSection = document.getElementById('playersStatusSection');

// Bingo Navigation Functions
function openBingo() {
    bingoModal.style.display = 'block';
    showBingoGameSelection();
}

function closeBingo() {
    bingoModal.style.display = 'none';
    resetBingoGame();
    showBingoGameSelection();
}

// Bingo Game Selection Functions
function showBingoGameSelection() {
    bingoGameSelection.style.display = 'block';
    bingoHostScreen.style.display = 'none';
    bingoJoinScreen.style.display = 'none';
    bingoGameScreen.style.display = 'none';
}

function selectBingoMode(mode) {
    bingoState.gameMode = mode;
    
    if (mode === 'host') {
        showBingoHostScreen();
    } else if (mode === 'join') {
        showBingoJoinScreen();
    }
}

function showBingoHostScreen() {
    bingoGameSelection.style.display = 'none';
    bingoHostScreen.style.display = 'block';
    bingoJoinScreen.style.display = 'none';
    bingoGameScreen.style.display = 'none';
    
    // Initialize host game
    initializeHostGame();
}

function showBingoJoinScreen() {
    bingoGameSelection.style.display = 'none';
    bingoHostScreen.style.display = 'none';
    bingoJoinScreen.style.display = 'block';
    bingoGameScreen.style.display = 'none';
}

function backToBingoSelection() {
    showBingoGameSelection();
    resetBingoGame();
}

// Host Game Functions
function initializeHostGame() {
    // Generate unique game ID
    bingoState.gameId = generateGameId();
    bingoState.isHost = true;
    bingoState.playerName = 'Host';
    bingoState.players = [{ name: 'Host', isHost: true, id: 'host', status: 'waiting' }];
    
    // Register this game in the global games storage
    const games = getActiveGames();
    games.set(bingoState.gameId, {
        gameId: bingoState.gameId,
        host: bingoState,
        players: bingoState.players,
        gameActive: false,
        gameStatus: 'waiting'
    });
    saveActiveGames(games);
    
    // Update UI
    gameIdElement.textContent = bingoState.gameId;
    updatePlayerCount();
    updatePlayersList();
    
    // Start listening for player joins
    startListeningForPlayers();
}

function generateGameId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function addPlayer(playerName) {
    if (bingoState.players.length >= 5) return;
    
    const playerId = 'player_' + Date.now();
    bingoState.players.push({ name: playerName, isHost: false, id: playerId, status: 'waiting' });
    updatePlayerCount();
    updatePlayersList();
    updatePlayersStatus();
    
    // Enable start button if we have at least 2 players
    if (bingoState.players.length >= 2) {
        document.querySelector('.start-game-btn').disabled = false;
    }
}

function updatePlayerCount() {
    playerCountElement.textContent = `${bingoState.players.length}/5`;
}

function updatePlayersList() {
    playersListElement.innerHTML = '';
    
    bingoState.players.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = `player-item ${player.isHost ? 'host-player' : ''}`;
        
        playerItem.innerHTML = `
            <i class="fas ${player.isHost ? 'fa-crown' : 'fa-user'}"></i>
            <span>${player.name}${player.isHost ? ' (Host)' : ''}</span>
        `;
        
        playersListElement.appendChild(playerItem);
    });
}

function updatePlayersStatus() {
    if (!playersStatusList) return;
    
    playersStatusList.innerHTML = '';
    
    bingoState.players.forEach(player => {
        const statusItem = document.createElement('div');
        statusItem.className = `player-status-item ${player.status === 'bingo' ? 'winner' : ''}`;
        
        statusItem.innerHTML = `
            <span class="player-name">${player.name}</span>
            <span class="player-status ${player.status}">${getStatusText(player.status)}</span>
        `;
        
        playersStatusList.appendChild(statusItem);
    });
}

function getStatusText(status) {
    switch (status) {
        case 'waiting': return 'Waiting';
        case 'playing': return 'Playing';
        case 'bingo': return 'BINGO!';
        default: return 'Unknown';
    }
}

function copyGameId() {
    navigator.clipboard.writeText(bingoState.gameId).then(() => {
        showBingoMessage('Game ID copied to clipboard!', 'win');
        setTimeout(clearBingoMessage, 2000);
    });
}

function startBingoGame() {
    if (bingoState.players.length < 2) {
        showBingoMessage('Need at least 2 players to start!', 'draw');
        return;
    }
    
    bingoState.gameActive = true;
    bingoState.gameStatus = 'playing';
    bingoState.calledNumbers = [];
    bingoState.currentNumber = null;
    bingoState.winner = null;
    bingoState.restartVotes.clear();
    
    // Update all players status to playing
    bingoState.players.forEach(player => {
        if (!player.isHost) {
            player.status = 'playing';
        }
    });
    
    // Generate boards for all players
    generateBingoBoards();
    
    // Show game screen
    showBingoGameScreen();
    
    // Start calling numbers
    startCallingNumbers();
}

function endBingoGame() {
    bingoState.gameActive = false;
    bingoState.gameStatus = 'ended';
    showBingoMessage('Game ended by host', 'draw');
    
    // Reset to host screen
    setTimeout(() => {
        showBingoHostScreen();
    }, 2000);
}

// Join Game Functions
function joinBingoGame() {
    const gameId = gameIdInput.value.trim().toUpperCase();
    const playerName = playerNameInput.value.trim();
    
    console.log('Attempting to join game:', gameId, 'with name:', playerName);
    const games = getActiveGames();
    console.log('Available games:', Array.from(games.keys()));
    
    if (!gameId || !playerName) {
        showBingoMessage('Please enter both Game ID and your name!', 'draw');
        return;
    }
    
    bingoState.gameId = gameId;
    bingoState.playerName = playerName;
    bingoState.isHost = false;
    bingoState.status = 'waiting';
    
    showBingoMessage(`Joining game ${gameId}...`, 'draw');
    
    // Try to join the game
    attemptJoinGame(gameId, playerName);
}

function attemptJoinGame(gameId, playerName) {
    // Check if there's a host game with this ID
    const hostGame = getHostGame(gameId);
    
    if (hostGame) {
        // Add player to host's game
        const success = addPlayerToHostGame(gameId, playerName);
        if (success) {
            showBingoMessage(`Successfully joined game ${gameId}!`, 'win');
            setTimeout(() => {
                showBingoGameScreen();
            }, 1000);
        }
    } else {
        showBingoMessage(`Game ${gameId} not found. Please check the Game ID.`, 'draw');
    }
}

// Multiplayer Management Functions
function getHostGame(gameId) {
    const games = getActiveGames();
    return games.get(gameId);
}

function addPlayerToHostGame(gameId, playerName) {
    const games = getActiveGames();
    const game = games.get(gameId);
    if (!game) {
        console.log('Game not found:', gameId);
        return false;
    }
    
    // Check if player limit reached
    if (game.players.length >= 5) {
        showBingoMessage('Game is full! Maximum 5 players allowed.', 'draw');
        return false;
    }
    
    // Check if player name already exists
    if (game.players.some(p => p.name === playerName)) {
        showBingoMessage('Player name already taken. Please choose another name.', 'draw');
        return false;
    }
    
    // Add player to the game
    const playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const newPlayer = { name: playerName, isHost: false, id: playerId, status: 'waiting' };
    game.players.push(newPlayer);
    
    // Update the host's game state
    if (game.host && game.host.isHost) {
        game.host.players = game.players;
    }
    
    // Save updated game to localStorage
    games.set(gameId, game);
    saveActiveGames(games);
    
    console.log('Player added to game:', newPlayer);
    console.log('Current players:', game.players);
    return true;
}

function startListeningForPlayers() {
    // In a real implementation, this would use WebSockets or similar
    // For now, we'll use a simple polling mechanism
    const checkForNewPlayers = () => {
        if (bingoState.isHost && bingoState.gameId) {
            const games = getActiveGames();
            const game = games.get(bingoState.gameId);
            if (game && game.players.length !== bingoState.players.length) {
                bingoState.players = [...game.players];
                updatePlayerCount();
                updatePlayersList();
                console.log('Host updated with new players:', bingoState.players);
            }
        }
    };
    
    // Check every 500ms for new players
    setInterval(checkForNewPlayers, 500);
}

// Game Screen Functions
function showBingoGameScreen() {
    bingoGameSelection.style.display = 'none';
    bingoHostScreen.style.display = 'none';
    bingoJoinScreen.style.display = 'none';
    bingoGameScreen.style.display = 'block';
    
    // Update title
    bingoGameTitle.textContent = bingoState.isHost ? 'Hosting Bingo Game' : 'Playing Bingo';
    
    // Show players status for host
    if (bingoState.isHost) {
        playersStatusSection.style.display = 'block';
        updatePlayersStatus();
    }
    
    // Generate player's board
    generatePlayerBoard();
    updateGameStatus();
    updateCalledNumbersList();
    
    // Show restart vote button if game ended
    if (bingoState.gameStatus === 'ended') {
        document.querySelector('.restart-vote-btn').style.display = 'block';
    }
}

function generateBingoBoards() {
    // Generate boards for all players
    bingoState.players.forEach(player => {
        if (!player.isHost) {
            player.board = generateBingoBoard();
            player.markedCells = new Set();
        }
    });
}

function generatePlayerBoard() {
    bingoState.myBoard = generateBingoBoard();
    bingoState.markedCells.clear();
    displayBingoBoard();
}

function generateBingoBoard() {
    // Generate 5x5 grid with numbers 1-99
    const numbers = Array.from({ length: 99 }, (_, i) => i + 1);
    const shuffled = shuffleArray(numbers);
    
    const board = [];
    for (let i = 0; i < 5; i++) {
        board[i] = [];
        for (let j = 0; j < 5; j++) {
            board[i][j] = shuffled[i * 5 + j];
        }
    }
    
    return board;
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function displayBingoBoard() {
    bingoBoard.innerHTML = '';
    
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.className = 'bingo-cell';
            cell.textContent = bingoState.myBoard[row][col];
            cell.setAttribute('data-row', row);
            cell.setAttribute('data-col', col);
            cell.setAttribute('data-number', bingoState.myBoard[row][col]);
            cell.addEventListener('click', () => toggleCell(row, col));
            
            bingoBoard.appendChild(cell);
        }
    }
}

function toggleCell(row, col) {
    if (!bingoState.gameActive || bingoState.gameStatus !== 'playing') return;
    
    const cellIndex = row * 5 + col;
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    
    if (bingoState.markedCells.has(cellIndex)) {
        bingoState.markedCells.delete(cellIndex);
        cell.classList.remove('marked');
    } else {
        bingoState.markedCells.add(cellIndex);
        cell.classList.add('marked');
    }
    
    // Check if player can call bingo
    checkBingoEligibility();
}

function checkBingoEligibility() {
    const callBingoBtn = document.querySelector('.call-bingo-btn');
    
    // Check for bingo patterns
    if (hasBingo()) {
        callBingoBtn.disabled = false;
    } else {
        callBingoBtn.disabled = true;
    }
}

function hasBingo() {
    // Check rows
    for (let row = 0; row < 5; row++) {
        let markedInRow = 0;
        for (let col = 0; col < 5; col++) {
            if (bingoState.markedCells.has(row * 5 + col)) {
                markedInRow++;
            }
        }
        if (markedInRow === 5) return true;
    }
    
    // Check columns
    for (let col = 0; col < 5; col++) {
        let markedInCol = 0;
        for (let row = 0; row < 5; row++) {
            if (bingoState.markedCells.has(row * 5 + col)) {
                markedInCol++;
            }
        }
        if (markedInCol === 5) return true;
    }
    
    // Check diagonals
    let markedInDiag1 = 0;
    let markedInDiag2 = 0;
    for (let i = 0; i < 5; i++) {
        if (bingoState.markedCells.has(i * 5 + i)) {
            markedInDiag1++;
        }
        if (bingoState.markedCells.has(i * 5 + (4 - i))) {
            markedInDiag2++;
        }
    }
    if (markedInDiag1 === 5 || markedInDiag2 === 5) return true;
    
    return false;
}

function callBingo() {
    if (!hasBingo()) {
        showBingoMessage('You don\'t have Bingo yet!', 'draw');
        return;
    }
    
    bingoState.gameStatus = 'ended';
    bingoState.winner = bingoState.playerName;
    
    // Update player status
    const player = bingoState.players.find(p => p.name === bingoState.playerName);
    if (player) {
        player.status = 'bingo';
    }
    
    showBingoMessage(`🎉 ${bingoState.playerName} got BINGO! 🎉`, 'win');
    
    // Announce winner to all players
    announceWinner(bingoState.playerName);
    
    // Disable further interactions
    document.querySelector('.call-bingo-btn').disabled = true;
    document.querySelectorAll('.bingo-cell').forEach(cell => {
        cell.style.pointerEvents = 'none';
    });
    
    // Show restart vote button
    document.querySelector('.restart-vote-btn').style.display = 'block';
    
    // Update players status
    updatePlayersStatus();
}

function announceWinner(winnerName) {
    // This would normally broadcast to all players
    console.log(`Winner announced: ${winnerName}`);
}

function voteRestart() {
    if (bingoState.restartVotes.has(bingoState.playerName)) {
        showBingoMessage('You have already voted to restart!', 'draw');
        return;
    }
    
    bingoState.restartVotes.add(bingoState.playerName);
    showBingoMessage('Vote to restart submitted!', 'win');
    
    // Check if majority wants to restart
    const totalPlayers = bingoState.players.length;
    const votesNeeded = Math.ceil(totalPlayers / 2);
    
    if (bingoState.restartVotes.size >= votesNeeded) {
        setTimeout(() => {
            restartGame();
        }, 2000);
    } else {
        const remaining = votesNeeded - bingoState.restartVotes.size;
        showBingoMessage(`${remaining} more vote(s) needed to restart`, 'draw');
    }
}

function restartGame() {
    showBingoMessage('Game restarting...', 'win');
    
    // Reset game state
    bingoState.gameActive = false;
    bingoState.gameStatus = 'waiting';
    bingoState.calledNumbers = [];
    bingoState.currentNumber = null;
    bingoState.winner = null;
    bingoState.restartVotes.clear();
    
    // Reset all players
    bingoState.players.forEach(player => {
        player.status = 'waiting';
        if (player.board) {
            player.markedCells = new Set();
        }
    });
    
    // Reset UI
    setTimeout(() => {
        if (bingoState.isHost) {
            showBingoHostScreen();
        } else {
            showBingoGameScreen();
        }
    }, 2000);
}

function leaveBingoGame() {
    showBingoMessage('Left the game', 'draw');
    setTimeout(() => {
        showBingoGameSelection();
    }, 1000);
}

// Number Calling Functions
function startCallingNumbers() {
    if (!bingoState.isHost) return;
    
    const numbers = Array.from({ length: 99 }, (_, i) => i + 1);
    const shuffledNumbers = shuffleArray(numbers);
    let currentIndex = 0;
    
    const callNextNumber = () => {
        if (!bingoState.gameActive || bingoState.gameStatus !== 'playing') return;
        
        if (currentIndex < shuffledNumbers.length) {
            bingoState.currentNumber = shuffledNumbers[currentIndex];
            bingoState.calledNumbers.push(bingoState.currentNumber);
            currentIndex++;
            
            updateCurrentNumber();
            updateGameStatus();
            updateCalledNumbersList();
            autoMarkNumbers();
            
            // Call next number after 3 seconds
            setTimeout(callNextNumber, 3000);
        } else {
            // All numbers called
            bingoState.gameStatus = 'ended';
            updateGameStatus();
            showBingoMessage('All numbers have been called!', 'draw');
            document.querySelector('.restart-vote-btn').style.display = 'block';
        }
    };
    
    // Start calling numbers after 2 seconds
    setTimeout(callNextNumber, 2000);
}

function autoMarkNumbers() {
    if (!bingoState.currentNumber) return;
    
    // Mark the current number on all boards
    const cells = document.querySelectorAll('.bingo-cell');
    cells.forEach(cell => {
        const cellNumber = parseInt(cell.getAttribute('data-number'));
        if (cellNumber === bingoState.currentNumber) {
            cell.classList.add('marked');
            const row = parseInt(cell.getAttribute('data-row'));
            const col = parseInt(cell.getAttribute('data-col'));
            const cellIndex = row * 5 + col;
            bingoState.markedCells.add(cellIndex);
        }
    });
    
    // Check if player can call bingo
    checkBingoEligibility();
}

function updateCurrentNumber() {
    currentBingoNumber.textContent = bingoState.currentNumber || '-';
}

function updateCalledNumbersList() {
    if (!calledNumbersList) return;
    
    calledNumbersList.innerHTML = '';
    
    bingoState.calledNumbers.forEach((number, index) => {
        const numberElement = document.createElement('div');
        numberElement.className = 'called-number';
        numberElement.textContent = number;
        
        // Highlight the latest number
        if (index === bingoState.calledNumbers.length - 1) {
            numberElement.classList.add('latest');
        }
        
        calledNumbersList.appendChild(numberElement);
    });
}

function updateGameStatus() {
    let status = '';
    
    switch (bingoState.gameStatus) {
        case 'waiting':
            status = 'Waiting to start...';
            break;
        case 'playing':
            status = `Numbers called: ${bingoState.calledNumbers.length}/99`;
            break;
        case 'ended':
            status = bingoState.winner ? `Winner: ${bingoState.winner}` : 'Game ended';
            break;
        default:
            status = 'Unknown status';
    }
    
    gameStatusElement.textContent = status;
}

// Utility Functions
function showBingoMessage(message, type) {
    bingoMessage.textContent = message;
    bingoMessage.className = `game-message ${type}`;
}

function clearBingoMessage() {
    bingoMessage.textContent = '';
    bingoMessage.className = 'game-message';
}

function resetBingoGame() {
    // Remove game from active games if this was a host
    if (bingoState.isHost && bingoState.gameId) {
        removeGame(bingoState.gameId);
    }
    
    bingoState = {
        gameMode: null,
        gameId: null,
        playerName: null,
        isHost: false,
        gameActive: false,
        currentNumber: null,
        calledNumbers: [],
        players: [],
        myBoard: [],
        markedCells: new Set(),
        gameStatus: 'waiting',
        restartVotes: new Set(),
        winner: null
    };
    
    // Clear inputs
    if (gameIdInput) gameIdInput.value = '';
    if (playerNameInput) playerNameInput.value = '';
    
    // Reset UI
    updateCurrentNumber();
    updateGameStatus();
    clearBingoMessage();
    
    // Hide restart vote button
    const restartBtn = document.querySelector('.restart-vote-btn');
    if (restartBtn) {
        restartBtn.style.display = 'none';
    }
}