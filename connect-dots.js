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
    
    // Create dots
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.setAttribute('data-row', row);
            dot.setAttribute('data-col', col);
            
            // Add drag event listeners
            dot.addEventListener('mousedown', (e) => handleDotMouseDown(e, row, col));
            dot.addEventListener('mouseenter', (e) => handleDotMouseEnter(e, row, col));
            dot.addEventListener('mouseup', (e) => handleDotMouseUp(e, row, col));
            
            connectDotsBoard.appendChild(dot);
        }
    }
    
    // Create boxes
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
            box.style.width = '40px';
            box.style.height = '40px';
            connectDotsBoard.appendChild(box);
        }
    }
    
    // Add global mouse events for dragging
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

function handleDotMouseDown(e, row, col) {
    if (!connectDotsState.gameActive || connectDotsState.dragging) return;
    
    e.preventDefault();
    connectDotsState.dragging = true;
    connectDotsState.dragStartDot = { row, col };
    
    // Highlight the starting dot
    const dot = e.target;
    dot.classList.add('dragging');
    
    // Highlight valid target dots
    highlightValidTargets(row, col);
}

function handleDotMouseEnter(e, row, col) {
    if (!connectDotsState.dragging || !connectDotsState.dragStartDot) return;
    
    const startDot = connectDotsState.dragStartDot;
    
    // Check if this is a valid connection
    if (isValidConnection(startDot.row, startDot.col, row, col)) {
        const direction = getDirection(startDot.row, startDot.col, row, col);
        const lineKey = getLineKey(startDot.row, startDot.col, direction);
        
        // Check if line already exists
        if (!isLineExists(lineKey, direction)) {
            // Highlight this dot as valid target
            e.target.classList.add('valid-target');
            
            // Create visual drag line
            createDragLine(startDot.row, startDot.col, row, col);
        }
    }
}

function handleDotMouseUp(e, row, col) {
    if (!connectDotsState.dragging || !connectDotsState.dragStartDot) return;
    
    const startDot = connectDotsState.dragStartDot;
    
    // Check if this is a valid connection
    if (isValidConnection(startDot.row, startDot.col, row, col)) {
        const direction = getDirection(startDot.row, startDot.col, row, col);
        const lineKey = getLineKey(startDot.row, startDot.col, direction);
        
        // Check if line already exists
        if (!isLineExists(lineKey, direction)) {
            // Draw the line
            drawLine(startDot.row, startDot.col, row, col, direction);
            
            // Check for completed boxes
            const boxesCompleted = checkConnectDotsBoxes(startDot.row, startDot.col, direction);
            
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
    }
    
    // Clean up dragging state
    cleanupDragging();
}

function handleMouseMove(e) {
    if (!connectDotsState.dragging || !connectDotsState.dragLine) return;
    
    // Update drag line position to follow mouse
    const rect = connectDotsBoard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (connectDotsState.dragStartDot) {
        const startDot = document.querySelector(`[data-row="${connectDotsState.dragStartDot.row}"][data-col="${connectDotsState.dragStartDot.col}"]`);
        if (startDot) {
            const startRect = startDot.getBoundingClientRect();
            const startX = startRect.left - rect.left + startRect.width / 2;
            const startY = startRect.top - rect.top + startRect.height / 2;
            
            const dx = x - startX;
            const dy = y - startY;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            
            connectDotsState.dragLine.style.left = startX + 'px';
            connectDotsState.dragLine.style.top = startY + 'px';
            connectDotsState.dragLine.style.width = length + 'px';
            connectDotsState.dragLine.style.height = '6px';
            connectDotsState.dragLine.style.transform = `rotate(${angle}deg)`;
            connectDotsState.dragLine.style.transformOrigin = '0 50%';
        }
    }
}

function handleMouseUp(e) {
    if (connectDotsState.dragging) {
        cleanupDragging();
    }
}

function highlightValidTargets(row, col) {
    const size = connectDotsState.size;
    
    // Clear previous highlights
    document.querySelectorAll('.dot.valid-target').forEach(dot => {
        dot.classList.remove('valid-target');
    });
    
    // Check all adjacent dots
    const directions = [
        { dr: -1, dc: 0 }, // up
        { dr: 1, dc: 0 },  // down
        { dr: 0, dc: -1 }, // left
        { dr: 0, dc: 1 }   // right
    ];
    
    directions.forEach(dir => {
        const newRow = row + dir.dr;
        const newCol = col + dir.dc;
        
        if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
            const direction = getDirection(row, col, newRow, newCol);
            const lineKey = getLineKey(row, col, direction);
            
            if (!isLineExists(lineKey, direction)) {
                const dot = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
                if (dot) {
                    dot.classList.add('valid-target');
                }
            }
        }
    });
}

function isValidConnection(row1, col1, row2, col2) {
    // Must be adjacent (horizontally or vertically)
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

function getDirection(row1, col1, row2, col2) {
    if (row1 === row2) {
        return 'horizontal';
    } else {
        return 'vertical';
    }
}

function getLineKey(row, col, direction) {
    return `${row}-${col}`;
}

function isLineExists(lineKey, direction) {
    return connectDotsState.lines[direction][lineKey] !== undefined;
}

function createDragLine(row1, col1, row2, col2) {
    // Remove existing drag line
    if (connectDotsState.dragLine) {
        connectDotsState.dragLine.remove();
    }
    
    const dragLine = document.createElement('div');
    dragLine.className = `drag-line ${connectDotsState.currentPlayer}`;
    
    // Position the drag line between the two dots
    const startDot = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
    const endDot = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
    
    if (startDot && endDot) {
        const startRect = startDot.getBoundingClientRect();
        const endRect = endDot.getBoundingClientRect();
        const boardRect = connectDotsBoard.getBoundingClientRect();
        
        const startX = startRect.left - boardRect.left + startRect.width / 2;
        const startY = startRect.top - boardRect.top + startRect.height / 2;
        const endX = endRect.left - boardRect.left + endRect.width / 2;
        const endY = endRect.top - boardRect.top + endRect.height / 2;
        
        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        dragLine.style.left = startX + 'px';
        dragLine.style.top = startY + 'px';
        dragLine.style.width = length + 'px';
        dragLine.style.height = '6px';
        dragLine.style.transform = `rotate(${angle}deg)`;
        dragLine.style.transformOrigin = '0 50%';
    }
    
    connectDotsBoard.appendChild(dragLine);
    connectDotsState.dragLine = dragLine;
}

function drawLine(row1, col1, row2, col2, direction) {
    const lineKey = getLineKey(row1, col1, direction);
    connectDotsState.lines[direction][lineKey] = connectDotsState.currentPlayer;
    
    // Create visual line element
    const lineElement = document.createElement('div');
    lineElement.className = `game-line ${connectDotsState.currentPlayer}`;
    lineElement.setAttribute('data-row', row1);
    lineElement.setAttribute('data-col', col1);
    lineElement.setAttribute('data-direction', direction);
    
    // Position the line between the two dots
    const startDot = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
    const endDot = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
    
    if (startDot && endDot) {
        const startRect = startDot.getBoundingClientRect();
        const endRect = endDot.getBoundingClientRect();
        const boardRect = connectDotsBoard.getBoundingClientRect();
        
        const startX = startRect.left - boardRect.left + startRect.width / 2;
        const startY = startRect.top - boardRect.top + startRect.height / 2;
        const endX = endRect.left - boardRect.left + endRect.width / 2;
        const endY = endRect.top - boardRect.top + endRect.height / 2;
        
        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        lineElement.style.left = startX + 'px';
        lineElement.style.top = startY + 'px';
        lineElement.style.width = length + 'px';
        lineElement.style.height = '6px';
        lineElement.style.transform = `rotate(${angle}deg)`;
        lineElement.style.transformOrigin = '0 50%';
    }
    
    connectDotsBoard.appendChild(lineElement);
}

function cleanupDragging() {
    connectDotsState.dragging = false;
    connectDotsState.dragStartDot = null;
    
    // Remove drag line
    if (connectDotsState.dragLine) {
        connectDotsState.dragLine.remove();
        connectDotsState.dragLine = null;
    }
    
    // Remove dragging class from all dots
    document.querySelectorAll('.dot.dragging').forEach(dot => {
        dot.classList.remove('dragging');
    });
    
    // Remove valid target highlights
    document.querySelectorAll('.dot.valid-target').forEach(dot => {
        dot.classList.remove('valid-target');
    });
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
    
    // Determine the end position for the line
    let endRow = row, endCol = col;
    if (direction === 'horizontal') {
        endCol = col + 1;
    } else {
        endRow = row + 1;
    }
    
    // Simulate AI move by drawing line directly
    drawLine(row, col, endRow, endCol, direction);
    
    // Check for completed boxes
    const boxesCompleted = checkConnectDotsBoxes(row, col, direction);
    
    if (boxesCompleted.length === 0) {
        // No boxes completed, switch player
        switchConnectDotsPlayer();
    } else {
        // Boxes completed, AI continues
        updateConnectDotsScores(boxesCompleted.length);
        showConnectDotsMessage(`AI completed ${boxesCompleted.length} box(es)!`, 'win');
        
        // Check if game is over
        if (isConnectDotsGameOver()) {
            endConnectDotsGame();
        } else {
            // AI continues if it completed boxes
            setTimeout(() => {
                if (connectDotsState.gameActive && connectDotsState.currentPlayer === 'blue') {
                    makeConnectDotsAIMove();
                }
            }, 500);
        }
    }
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
    connectDotsState.dragging = false;
    connectDotsState.dragStartDot = null;
    connectDotsState.dragLine = null;
    
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