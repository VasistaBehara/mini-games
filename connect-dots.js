// ==================== CONNECT THE DOTS GAME ====================

// Connect the Dots Navigation Functions
function openConnectDots() {
    connectDotsModal.style.display = 'block';
    showConnectDotsModeSelection();
}

function closeConnectDots() {
    connectDotsModal.style.display = 'none';
    resetConnectDotsGame();
    showConnectDotsModeSelection();
}

// Connect the Dots Mode Selection Functions
function showConnectDotsModeSelection() {
    connectDotsModeSelection.style.display = 'block';
    connectDotsGameScreen.style.display = 'none';
}

function showConnectDotsGameScreen() {
    connectDotsModeSelection.style.display = 'none';
    connectDotsGameScreen.style.display = 'block';
}

function selectConnectDotsMode(mode) {
    connectDotsState.gameMode = mode;
    
    // Update game mode title
    if (mode === 'ai') {
        connectDotsModeTitle.textContent = 'Connect the Dots - vs AI';
    } else if (mode === 'player') {
        connectDotsModeTitle.textContent = 'Connect the Dots - vs Player';
    }
    
    showConnectDotsGameScreen();
    initializeConnectDotsGame();
}

function backToConnectDotsModeSelection() {
    showConnectDotsModeSelection();
    resetConnectDotsGame();
}

function showConnectDotsComingSoon() {
    showConnectDotsMessage("Online multiplayer coming soon! Stay tuned for updates.", 'draw');
    setTimeout(clearConnectDotsMessage, 3000);
}

// Connect the Dots Game Logic
function initializeConnectDotsGame() {
    createConnectDotsBoard();
    updateConnectDotsDisplay();
    clearConnectDotsMessage();
    loadConnectDotsScores();
}

function createConnectDotsBoard() {
    connectDotsBoard.innerHTML = '';
    connectDotsBoard.className = `connect-dots-board grid-${connectDotsState.size}`;
    
    const size = connectDotsState.size;
    
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.setAttribute('data-row', row);
            dot.setAttribute('data-col', col);
            
            // Add horizontal line (to the right)
            if (col < size - 1) {
                const hLine = document.createElement('div');
                hLine.className = 'line-horizontal';
                hLine.setAttribute('data-row', row);
                hLine.setAttribute('data-col', col);
                hLine.setAttribute('data-direction', 'horizontal');
                hLine.addEventListener('click', () => handleConnectDotsLineClick(row, col, 'horizontal'));
                hLine.addEventListener('mouseenter', () => handleConnectDotsHover(row, col, 'horizontal', true));
                hLine.addEventListener('mouseleave', () => handleConnectDotsHover(row, col, 'horizontal', false));
                dot.appendChild(hLine);
            }
            
            // Add vertical line (downward)
            if (row < size - 1) {
                const vLine = document.createElement('div');
                vLine.className = 'line-vertical';
                vLine.setAttribute('data-row', row);
                vLine.setAttribute('data-col', col);
                vLine.setAttribute('data-direction', 'vertical');
                vLine.addEventListener('click', () => handleConnectDotsLineClick(row, col, 'vertical'));
                vLine.addEventListener('mouseenter', () => handleConnectDotsHover(row, col, 'vertical', true));
                vLine.addEventListener('mouseleave', () => handleConnectDotsHover(row, col, 'vertical', false));
                dot.appendChild(vLine);
            }
            
            connectDotsBoard.appendChild(dot);
        }
    }
    
    // Add boxes
    for (let row = 0; row < size - 1; row++) {
        for (let col = 0; col < size - 1; col++) {
            const box = document.createElement('div');
            box.className = 'box';
            box.setAttribute('data-row', row);
            box.setAttribute('data-col', col);
            box.style.gridRow = `${row + 1} / ${row + 2}`;
            box.style.gridColumn = `${col + 1} / ${col + 2}`;
            box.style.position = 'absolute';
            box.style.top = '50%';
            box.style.left = '50%';
            box.style.transform = 'translate(-50%, -50%)';
            box.style.width = '20px';
            box.style.height = '20px';
            connectDotsBoard.appendChild(box);
        }
    }
}

function handleConnectDotsLineClick(row, col, direction) {
    if (!connectDotsState.gameActive) return;
    
    const key = `${row}-${col}`;
    const lines = connectDotsState.lines[direction];
    
    if (lines[key]) return; // Line already exists
    
    // Make the move
    lines[key] = connectDotsState.currentPlayer;
    
    // Update visual
    const lineElement = document.querySelector(`[data-row="${row}"][data-col="${col}"][data-direction="${direction}"]`);
    if (lineElement) {
        lineElement.classList.add(connectDotsState.currentPlayer);
    }
    
    // Check for completed boxes
    const boxesCompleted = checkConnectDotsBoxes(row, col, direction);
    
    if (boxesCompleted.length === 0) {
        // No boxes completed, switch player
        switchConnectDotsPlayer();
    } else {
        // Boxes completed, current player continues
        updateConnectDotsScores(boxesCompleted.length);
        showConnectDotsMessage(`${connectDotsState.currentPlayer.toUpperCase()} completed ${boxesCompleted.length} box(es)!`, 'win');
        
        // Check if game is over
        if (isConnectDotsGameOver()) {
            endConnectDotsGame();
        }
    }
    
    // AI move if in AI mode
    if (connectDotsState.gameMode === 'ai' && connectDotsState.currentPlayer === 'blue' && connectDotsState.gameActive) {
        setTimeout(() => {
            if (connectDotsState.gameActive) {
                makeConnectDotsAIMove();
            }
        }, 500);
    }
}

function handleConnectDotsHover(row, col, direction, isEntering) {
    const lineElement = document.querySelector(`[data-row="${row}"][data-col="${col}"][data-direction="${direction}"]`);
    if (!lineElement || lineElement.classList.contains('red') || lineElement.classList.contains('blue')) {
        return;
    }
    
    if (isEntering) {
        lineElement.style.background = connectDotsState.currentPlayer === 'red' ? 
            'rgba(255, 71, 87, 0.3)' : 'rgba(55, 66, 250, 0.3)';
    } else {
        lineElement.style.background = 'transparent';
    }
}

function checkConnectDotsBoxes(row, col, direction) {
    const completedBoxes = [];
    const size = connectDotsState.size;
    
    if (direction === 'horizontal') {
        // Check box above
        if (row > 0) {
            const boxKey = `${row - 1}-${col}`;
            if (isBoxCompleted(row - 1, col) && !connectDotsState.boxes[boxKey]) {
                connectDotsState.boxes[boxKey] = connectDotsState.currentPlayer;
                completedBoxes.push(boxKey);
                updateBoxVisual(row - 1, col, connectDotsState.currentPlayer);
            }
        }
        
        // Check box below
        if (row < size - 1) {
            const boxKey = `${row}-${col}`;
            if (isBoxCompleted(row, col) && !connectDotsState.boxes[boxKey]) {
                connectDotsState.boxes[boxKey] = connectDotsState.currentPlayer;
                completedBoxes.push(boxKey);
                updateBoxVisual(row, col, connectDotsState.currentPlayer);
            }
        }
    } else if (direction === 'vertical') {
        // Check box to the left
        if (col > 0) {
            const boxKey = `${row}-${col - 1}`;
            if (isBoxCompleted(row, col - 1) && !connectDotsState.boxes[boxKey]) {
                connectDotsState.boxes[boxKey] = connectDotsState.currentPlayer;
                completedBoxes.push(boxKey);
                updateBoxVisual(row, col - 1, connectDotsState.currentPlayer);
            }
        }
        
        // Check box to the right
        if (col < size - 1) {
            const boxKey = `${row}-${col}`;
            if (isBoxCompleted(row, col) && !connectDotsState.boxes[boxKey]) {
                connectDotsState.boxes[boxKey] = connectDotsState.currentPlayer;
                completedBoxes.push(boxKey);
                updateBoxVisual(row, col, connectDotsState.currentPlayer);
            }
        }
    }
    
    return completedBoxes;
}

function isBoxCompleted(row, col) {
    const top = `${row}-${col}`;
    const bottom = `${row + 1}-${col}`;
    const left = `${row}-${col}`;
    const right = `${row}-${col + 1}`;
    
    return connectDotsState.lines.horizontal[top] &&
           connectDotsState.lines.horizontal[bottom] &&
           connectDotsState.lines.vertical[left] &&
           connectDotsState.lines.vertical[right];
}

function updateBoxVisual(row, col, player) {
    const boxElement = document.querySelector(`.box[data-row="${row}"][data-col="${col}"]`);
    if (boxElement) {
        boxElement.classList.add(player);
    }
}

function switchConnectDotsPlayer() {
    connectDotsState.currentPlayer = connectDotsState.currentPlayer === 'red' ? 'blue' : 'red';
    updateConnectDotsDisplay();
}

function makeConnectDotsAIMove() {
    const availableMoves = getConnectDotsAvailableMoves();
    if (availableMoves.length === 0) return;
    
    // Simple AI: prioritize moves that complete boxes, then random
    const bestMove = getConnectDotsBestMove(availableMoves);
    const { row, col, direction } = bestMove;
    
    handleConnectDotsLineClick(row, col, direction);
}

function getConnectDotsAvailableMoves() {
    const moves = [];
    const size = connectDotsState.size;
    
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            // Check horizontal lines
            if (col < size - 1) {
                const key = `${row}-${col}`;
                if (!connectDotsState.lines.horizontal[key]) {
                    moves.push({ row, col, direction: 'horizontal' });
                }
            }
            
            // Check vertical lines
            if (row < size - 1) {
                const key = `${row}-${col}`;
                if (!connectDotsState.lines.vertical[key]) {
                    moves.push({ row, col, direction: 'vertical' });
                }
            }
        }
    }
    
    return moves;
}

function getConnectDotsBestMove(availableMoves) {
    // First, try to find moves that complete boxes
    for (const move of availableMoves) {
        const tempLines = JSON.parse(JSON.stringify(connectDotsState.lines));
        tempLines[move.direction][`${move.row}-${move.col}`] = 'blue';
        
        // Check if this move would complete a box
        if (wouldCompleteBox(move.row, move.col, move.direction, tempLines)) {
            return move;
        }
    }
    
    // If no box-completing moves, try to block opponent from completing boxes
    for (const move of availableMoves) {
        const tempLines = JSON.parse(JSON.stringify(connectDotsState.lines));
        tempLines[move.direction][`${move.row}-${move.col}`] = 'red';
        
        // Check if this move would block opponent from completing a box
        if (wouldCompleteBox(move.row, move.col, move.direction, tempLines)) {
            return move;
        }
    }
    
    // Otherwise, return a random move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function wouldCompleteBox(row, col, direction, lines) {
    const size = connectDotsState.size;
    
    if (direction === 'horizontal') {
        // Check box above
        if (row > 0) {
            const top = `${row - 1}-${col}`;
            const bottom = `${row}-${col}`;
            const left = `${row - 1}-${col}`;
            const right = `${row - 1}-${col + 1}`;
            
            if (lines.horizontal[top] && lines.horizontal[bottom] && 
                lines.vertical[left] && lines.vertical[right]) {
                return true;
            }
        }
        
        // Check box below
        if (row < size - 1) {
            const top = `${row}-${col}`;
            const bottom = `${row + 1}-${col}`;
            const left = `${row}-${col}`;
            const right = `${row}-${col + 1}`;
            
            if (lines.horizontal[top] && lines.horizontal[bottom] && 
                lines.vertical[left] && lines.vertical[right]) {
                return true;
            }
        }
    } else if (direction === 'vertical') {
        // Check box to the left
        if (col > 0) {
            const top = `${row}-${col - 1}`;
            const bottom = `${row + 1}-${col - 1}`;
            const left = `${row}-${col - 1}`;
            const right = `${row}-${col}`;
            
            if (lines.horizontal[top] && lines.horizontal[bottom] && 
                lines.vertical[left] && lines.vertical[right]) {
                return true;
            }
        }
        
        // Check box to the right
        if (col < size - 1) {
            const top = `${row}-${col}`;
            const bottom = `${row + 1}-${col}`;
            const left = `${row}-${col}`;
            const right = `${row}-${col + 1}`;
            
            if (lines.horizontal[top] && lines.horizontal[bottom] && 
                lines.vertical[left] && lines.vertical[right]) {
                return true;
            }
        }
    }
    
    return false;
}

function isConnectDotsGameOver() {
    const availableMoves = getConnectDotsAvailableMoves();
    return availableMoves.length === 0;
}

function endConnectDotsGame() {
    connectDotsState.gameActive = false;
    const redScore = connectDotsState.scores.red;
    const blueScore = connectDotsState.scores.blue;
    
    if (redScore > blueScore) {
        showConnectDotsMessage("Red Player Wins!", 'win');
    } else if (blueScore > redScore) {
        showConnectDotsMessage("Blue Player Wins!", 'win');
    } else {
        showConnectDotsMessage("It's a Draw!", 'draw');
    }
}

function updateConnectDotsScores(boxesCompleted) {
    connectDotsState.scores[connectDotsState.currentPlayer] += boxesCompleted;
    updateConnectDotsScoreDisplay();
    saveConnectDotsScores();
}

function updateConnectDotsScoreDisplay() {
    connectDotsRedScore.textContent = connectDotsState.scores.red;
    connectDotsBlueScore.textContent = connectDotsState.scores.blue;
}

function updateConnectDotsDisplay() {
    const playerName = connectDotsState.currentPlayer === 'red' ? 'Red' : 
                      (connectDotsState.gameMode === 'ai' ? 'AI (Blue)' : 'Blue');
    connectDotsCurrentPlayer.textContent = `${playerName} Player's Turn`;
}

// Connect the Dots Local Storage
function saveConnectDotsScores() {
    localStorage.setItem('connectDotsScores', JSON.stringify(connectDotsState.scores));
}

function loadConnectDotsScores() {
    const savedScores = localStorage.getItem('connectDotsScores');
    if (savedScores) {
        connectDotsState.scores = JSON.parse(savedScores);
        updateConnectDotsScoreDisplay();
    }
}

// Connect the Dots Game Reset
function resetConnectDotsGame() {
    connectDotsState.currentPlayer = 'red';
    connectDotsState.gameActive = true;
    connectDotsState.lines = { horizontal: {}, vertical: {} };
    connectDotsState.boxes = {};
    
    createConnectDotsBoard();
    updateConnectDotsDisplay();
    clearConnectDotsMessage();
}

function restartConnectDotsGame() {
    resetConnectDotsGame();
    showConnectDotsMessage("Game restarted!", 'draw');
    setTimeout(clearConnectDotsMessage, 2000);
}

function resetConnectDotsScores() {
    connectDotsState.scores.red = 0;
    connectDotsState.scores.blue = 0;
    updateConnectDotsScoreDisplay();
    saveConnectDotsScores();
    showConnectDotsMessage("Scores reset!", 'draw');
    setTimeout(clearConnectDotsMessage, 2000);
}

// Connect the Dots Display Updates
function showConnectDotsMessage(message, type) {
    connectDotsMessage.textContent = message;
    connectDotsMessage.className = `game-message ${type}`;
}

function clearConnectDotsMessage() {
    connectDotsMessage.textContent = '';
    connectDotsMessage.className = 'game-message';
}
