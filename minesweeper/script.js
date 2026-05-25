const BOARD_SIZE = 9;
const MINE_COUNT = 10;

let board = [];
let revealedCount = 0;
let flagCount = 0;
let gameOver = false;

const boardElement = document.getElementById('board');
const mineCountElement = document.getElementById('mine-count');
const gameResultElement = document.getElementById('game-result');
const resultTextElement = document.getElementById('result-text');

function initGame() {
    board = [];
    revealedCount = 0;
    flagCount = 0;
    gameOver = false;
    mineCountElement.innerText = MINE_COUNT;
    gameResultElement.classList.add('hidden');
    boardElement.innerHTML = '';

    // 1. 建立空盤
    for (let r = 0; r < BOARD_SIZE; r++) {
        board[r] = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
            board[r][c] = { r, c, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 };
        }
    }

    // 2. 隨機埋雷
    let minesPlanted = 0;
    while (minesPlanted < MINE_COUNT) {
        let r = Math.floor(Math.random() * BOARD_SIZE);
        let c = Math.floor(Math.random() * BOARD_SIZE);
        if (!board[r][c].isMine) {
            board[r][c].isMine = true;
            minesPlanted++;
        }
    }

    // 3. 計算周圍地雷數
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (!board[r][c].isMine) {
                board[r][c].neighborMines = countMinesAround(r, c);
            }
        }
    }

    // 4. 渲染網格
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            cellElement.dataset.row = r;
            cellElement.dataset.col = c;

            // 綁定點擊事件 (支援手機長按插旗)
            cellElement.addEventListener('click', () => revealCell(r, c));
            cellElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleFlag(r, c);
            });

            // 手機長按邏輯
            let touchTimer;
            cellElement.addEventListener('touchstart', (e) => {
                touchTimer = setTimeout(() => toggleFlag(r, c), 500);
            });
            cellElement.addEventListener('touchend', () => clearTimeout(touchTimer));

            board[r][c].element = cellElement;
            boardElement.appendChild(cellElement);
        }
    }
}

function countMinesAround(r, c) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (board[r + i] && board[r + i][c + j] && board[r + i][c + j].isMine) count++;
        }
    }
    return count;
}

function revealCell(r, c) {
    if (gameOver || board[r][c].isRevealed || board[r][c].isFlagged) return;

    const cell = board[r][c];
    cell.isRevealed = true;
    revealedCount++;
    cell.element.classList.add('revealed');

    if (cell.isMine) {
        endGame(false);
        return;
    }

    if (cell.neighborMines > 0) {
        cell.element.innerText = cell.neighborMines;
        cell.element.setAttribute('data-count', cell.neighborMines);
    } else {
        // 擴散演算法 (自動翻開周圍零雷區)
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (board[r + i] && board[r + i][c + j]) revealCell(r + i, c + j);
            }
        }
    }

    if (revealedCount === BOARD_SIZE * BOARD_SIZE - MINE_COUNT) {
        endGame(true);
    }
}

function toggleFlag(r, c) {
    if (gameOver || board[r][c].isRevealed) return;

    const cell = board[r][c];
    if (!cell.isFlagged) {
        cell.isFlagged = true;
        flagCount++;
        cell.element.classList.add('flagged');
        cell.element.innerText = '🚩';
    } else {
        cell.isFlagged = false;
        flagCount--;
        cell.element.classList.remove('flagged');
        cell.element.innerText = '';
    }
    mineCountElement.innerText = MINE_COUNT - flagCount;
}

function endGame(isWin) {
    gameOver = true;
    resultTextElement.innerText = isWin ? '🎉 你贏了！' : '💥 踩到雷了！';
    resultTextElement.style.color = isWin ? '#22c55e' : '#ef4444';
    
    // 顯示所有地雷
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c].isMine) {
                board[r][c].element.classList.add('revealed', 'mine');
                board[r][c].element.innerText = '💣';
            }
        }
    }
    setTimeout(() => gameResultElement.classList.remove('hidden'), 500);
}

document.getElementById('restart-btn').addEventListener('click', initGame);
document.getElementById('retry-btn').addEventListener('click', initGame);

// 啟動
initGame();
