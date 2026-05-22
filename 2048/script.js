let board = Array(16).fill(0);
let score = 0;
const gridElement = document.getElementById('grid');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('game-over');

function initGame() {
    board = Array(16).fill(0);
    score = 0;
    scoreElement.innerText = score;
    gameOverElement.classList.add('hidden');
    generateNewTile();
    generateNewTile();
    drawBoard();
}

function generateNewTile() {
    const emptyCells = board.map((val, idx) => val === 0 ? idx : null).filter(val => val !== null);
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomCell] = Math.random() < 0.9 ? 2 : 4;
    }
}

function drawBoard() {
    gridElement.innerHTML = '';
    board.forEach(value => {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        if (value > 0) {
            cell.innerText = value;
            cell.setAttribute('data-value', value);
        }
        gridElement.appendChild(cell);
    });
}

// 核心滑動與合併邏輯
function slide(row) {
    let arr = row.filter(val => val);
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            score += arr[i];
            arr[i + 1] = 0;
        }
    }
    arr = arr.filter(val => val);
    while (arr.length < 4) arr.push(0);
    return arr;
}

function moveLeft() {
    let changed = false;
    for (let i = 0; i < 4; i++) {
        let row = board.slice(i * 4, (i + 1) * 4);
        let newRow = slide(row);
        if (JSON.stringify(row) !== JSON.stringify(newRow)) changed = true;
        for (let j = 0; j < 4; j++) board[i * 4 + j] = newRow[j];
    }
    return changed;
}

function moveRight() {
    let changed = false;
    for (let i = 0; i < 4; i++) {
        let row = board.slice(i * 4, (i + 1) * 4).reverse();
        let newRow = slide(row);
        newRow.reverse();
        row.reverse();
        if (JSON.stringify(row) !== JSON.stringify(newRow)) changed = true;
        for (let j = 0; j < 4; j++) board[i * 4 + j] = newRow[j];
    }
    return changed;
}

function moveUp() {
    let changed = false;
    for (let j = 0; j < 4; j++) {
        let row = [board[j], board[j + 4], board[j + 8], board[j + 12]];
        let newRow = slide(row);
        if (JSON.stringify(row) !== JSON.stringify(newRow)) changed = true;
        for (let i = 0; i < 4; i++) board[i * 4 + j] = newRow[i];
    }
    return changed;
}

function moveDown() {
    let changed = false;
    for (let j = 0; j < 4; j++) {
        let row = [board[j], board[j + 4], board[j + 8], board[j + 12]].reverse();
        let newRow = slide(row);
        newRow.reverse();
        row.reverse();
        if (JSON.stringify(row) !== JSON.stringify(newRow)) changed = true;
        for (let i = 0; i < 4; i++) board[i * 4 + j] = newRow[i];
    }
    return changed;
}

function checkGameOver() {
    if (board.includes(0)) return;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let current = board[i * 4 + j];
            if (j < 3 && current === board[i * 4 + j + 1]) return;
            if (i < 3 && current === board[(i + 1) * 4 + j]) return;
        }
    }
    gameOverElement.classList.remove('hidden');
}

// 監聽鍵盤事件
window.addEventListener('keydown', (e) => {
    let moved = false;
    if (e.key === 'ArrowLeft') moved = moveLeft();
    else if (e.key === 'ArrowRight') moved = moveRight();
    else if (e.key === 'ArrowUp') moved = moveUp();
    else if (e.key === 'ArrowDown') moved = moveDown();

    if (moved) {
        generateNewTile();
        drawBoard();
        scoreElement.innerText = score;
        setTimeout(checkGameOver, 300);
    }
});

// 手機滑動支援 (Touch Events)
let touchStartX = 0, touchStartY = 0;
window.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});
window.addEventListener('touchend', e => {
    let diffX = e.changedTouches[0].clientX - touchStartX;
    let diffY = e.changedTouches[0].clientY - touchStartY;
    let moved = false;
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 50) moved = moveRight();
        else if (diffX < -50) moved = moveLeft();
    } else {
        if (diffY > 50) moved = moveDown();
        else if (diffY < -50) moved = moveUp();
    }
    if (moved) {
        generateNewTile();
        drawBoard();
        scoreElement.innerText = score;
        setTimeout(checkGameOver, 300);
    }
});

document.getElementById('restart-btn').addEventListener('click', initGame);
document.getElementById('retry-btn').addEventListener('click', initGame);

// 啟動遊戲
initGame();
