document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const minesDisplay = document.getElementById('mines');
    const timerDisplay = document.getElementById('timer');
    const startBtn = document.getElementById('startBtn');
    const gameOverDiv = document.getElementById('gameOver');
    const gameResult = document.getElementById('gameResult');

    const GRID_SIZE = 10;
    const MINE_COUNT = 10;
    let board = [];
    let mineLocations = [];
    let revealed = [];
    let flagged = [];
    let isGameOver = false;
    let isPlaying = false;
    let timer = 0;
    let timerInterval;

    // 初始化游戏板
    function initBoard() {
        board = Array(GRID_SIZE * GRID_SIZE).fill(0);
        mineLocations = [];
        revealed = Array(GRID_SIZE * GRID_SIZE).fill(false);
        flagged = Array(GRID_SIZE * GRID_SIZE).fill(false);
        isGameOver = false;
        timer = 0;
        timerDisplay.textContent = `时间: ${timer}`;
        minesDisplay.textContent = `剩余地雷: ${MINE_COUNT}`;

        // 放置地雷
        let minesPlaced = 0;
        while (minesPlaced < MINE_COUNT) {
            const pos = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
            if (!mineLocations.includes(pos)) {
                mineLocations.push(pos);
                board[pos] = -1;
                minesPlaced++;
            }
        }

        // 计算周围地雷数
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (board[i * GRID_SIZE + j] === -1) continue;
                let count = 0;
                for (let di = -1; di <= 1; di++) {
                    for (let dj = -1; dj <= 1; dj++) {
                        const ni = i + di;
                        const nj = j + dj;
                        if (ni >= 0 && ni < GRID_SIZE && nj >= 0 && nj < GRID_SIZE) {
                            if (board[ni * GRID_SIZE + nj] === -1) count++;
                        }
                    }
                }
                board[i * GRID_SIZE + j] = count;
            }
        }

        // 创建格子
        grid.innerHTML = '';
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            grid.appendChild(cell);
        }
    }

    // 显示格子
    function revealCell(index) {
        if (revealed[index] || flagged[index] || isGameOver) return;

        revealed[index] = true;
        const cell = grid.children[index];
        cell.classList.add('revealed');

        if (board[index] === -1) {
            // 踩到地雷
            cell.classList.add('mine');
            cell.textContent = '💣';
            gameOver(false);
        } else {
            // 显示数字
            if (board[index] > 0) {
                cell.textContent = board[index];
                cell.style.color = getNumberColor(board[index]);
            } else {
                // 如果是空格，递归显示周围的格子
                const row = Math.floor(index / GRID_SIZE);
                const col = index % GRID_SIZE;
                for (let di = -1; di <= 1; di++) {
                    for (let dj = -1; dj <= 1; dj++) {
                        const ni = row + di;
                        const nj = col + dj;
                        if (ni >= 0 && ni < GRID_SIZE && nj >= 0 && nj < GRID_SIZE) {
                            revealCell(ni * GRID_SIZE + nj);
                        }
                    }
                }
            }
        }

        // 检查是否胜利
        checkWin();
    }

    // 标记地雷
    function toggleFlag(index) {
        if (revealed[index] || isGameOver) return;

        const cell = grid.children[index];
        if (flagged[index]) {
            flagged[index] = false;
            cell.classList.remove('flagged');
            cell.textContent = '';
            minesDisplay.textContent = `剩余地雷: ${MINE_COUNT - flagged.filter(f => f).length}`;
        } else {
            flagged[index] = true;
            cell.classList.add('flagged');
            cell.textContent = '🚩';
            minesDisplay.textContent = `剩余地雷: ${MINE_COUNT - flagged.filter(f => f).length}`;
        }

        // 检查是否胜利
        checkWin();
    }

    // 获取数字颜色
    function getNumberColor(number) {
        const colors = [
            '#0000ff', // 1: 蓝色
            '#008000', // 2: 绿色
            '#ff0000', // 3: 红色
            '#000080', // 4: 深蓝色
            '#800000', // 5: 深红色
            '#008080', // 6: 青色
            '#000000', // 7: 黑色
            '#808080'  // 8: 灰色
        ];
        return colors[number - 1] || '#000000';
    }

    // 检查是否胜利
    function checkWin() {
        const allMinesFlagged = mineLocations.every(pos => flagged[pos]);
        const allSafeCellsRevealed = board.every((val, idx) => {
            return val === -1 ? flagged[idx] : revealed[idx];
        });

        if (allMinesFlagged && allSafeCellsRevealed) {
            gameOver(true);
        }
    }

    // 游戏结束
    function gameOver(isWin) {
        isGameOver = true;
        isPlaying = false;
        clearInterval(timerInterval);

        // 显示所有地雷
        mineLocations.forEach(pos => {
            const cell = grid.children[pos];
            if (!flagged[pos]) {
                cell.classList.add('revealed', 'mine');
                cell.textContent = '💣';
            }
        });

        gameOverDiv.style.display = 'block';
        gameResult.textContent = isWin ? '恭喜你赢了！' : '游戏结束！';
        startBtn.textContent = '重新开始';
    }

    // 开始游戏
    startBtn.addEventListener('click', () => {
        gameOverDiv.style.display = 'none';
        isPlaying = true;
        clearInterval(timerInterval);
        initBoard();

        // 开始计时
        timer = 0;
        timerInterval = setInterval(() => {
            timer++;
            timerDisplay.textContent = `时间: ${timer}`;
        }, 1000);
    });

    // 鼠标事件
    grid.addEventListener('click', (e) => {
        if (!isPlaying) return;
        const cell = e.target;
        if (cell.classList.contains('cell')) {
            const index = parseInt(cell.dataset.index);
            revealCell(index);
        }
    });

    grid.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (!isPlaying) return;
        const cell = e.target;
        if (cell.classList.contains('cell')) {
            const index = parseInt(cell.dataset.index);
            toggleFlag(index);
        }
    });
});