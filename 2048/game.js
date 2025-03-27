class Game2048 {
    constructor() {
        this.grid = document.getElementById('grid');
        this.scoreDisplay = document.getElementById('score');
        this.startBtn = document.getElementById('startBtn');
        this.gameOverDiv = document.getElementById('gameOver');
        this.finalScoreDisplay = document.getElementById('finalScore');
        this.size = 4;
        this.cells = [];
        this.score = 0;
        this.setupGame();
        this.setupEventListeners();
    }

    setupGame() {
        // 创建网格
        this.grid.innerHTML = '';
        this.cells = Array(this.size).fill().map(() => Array(this.size).fill(0));
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                this.grid.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameOver) {
                switch(e.key) {
                    case 'ArrowUp':
                        this.move('up');
                        break;
                    case 'ArrowDown':
                        this.move('down');
                        break;
                    case 'ArrowLeft':
                        this.move('left');
                        break;
                    case 'ArrowRight':
                        this.move('right');
                        break;
                }
            }
        });

        // 添加触摸支持
        let touchStartX, touchStartY;
        this.grid.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.grid.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) this.move('right');
                else this.move('left');
            } else {
                if (deltaY > 0) this.move('down');
                else this.move('up');
            }

            touchStartX = null;
            touchStartY = null;
        });

        this.startBtn.addEventListener('click', () => {
            this.startNewGame();
        });
    }

    startNewGame() {
        this.cells = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.gameOverDiv.style.display = 'none';
        this.scoreDisplay.textContent = `分数: ${this.score}`;
        this.addNewNumber();
        this.addNewNumber();
        this.updateDisplay();
    }

    addNewNumber() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.cells[i][j] === 0) {
                    emptyCells.push({i, j});
                }
            }
        }

        if (emptyCells.length > 0) {
            const {i, j} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.cells[i][j] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    move(direction) {
        let moved = false;
        const newCells = JSON.parse(JSON.stringify(this.cells));

        const moveCell = (i, j, di, dj) => {
            if (newCells[i][j] === 0) return false;

            let newI = i + di;
            let newJ = j + dj;

            while (newI >= 0 && newI < this.size && newJ >= 0 && newJ < this.size) {
                if (newCells[newI][newJ] === 0) {
                    newCells[newI][newJ] = newCells[newI - di][newJ - dj];
                    newCells[newI - di][newJ - dj] = 0;
                    newI += di;
                    newJ += dj;
                    moved = true;
                } else if (newCells[newI][newJ] === newCells[newI - di][newJ - dj]) {
                    newCells[newI][newJ] *= 2;
                    newCells[newI - di][newJ - dj] = 0;
                    this.score += newCells[newI][newJ];
                    moved = true;
                    break;
                } else {
                    break;
                }
            }
        };

        switch(direction) {
            case 'up':
                for (let j = 0; j < this.size; j++) {
                    for (let i = 1; i < this.size; i++) {
                        moveCell(i, j, -1, 0);
                    }
                }
                break;
            case 'down':
                for (let j = 0; j < this.size; j++) {
                    for (let i = this.size - 2; i >= 0; i--) {
                        moveCell(i, j, 1, 0);
                    }
                }
                break;
            case 'left':
                for (let i = 0; i < this.size; i++) {
                    for (let j = 1; j < this.size; j++) {
                        moveCell(i, j, 0, -1);
                    }
                }
                break;
            case 'right':
                for (let i = 0; i < this.size; i++) {
                    for (let j = this.size - 2; j >= 0; j--) {
                        moveCell(i, j, 0, 1);
                    }
                }
                break;
        }

        if (moved) {
            this.cells = newCells;
            this.addNewNumber();
            this.updateDisplay();
            this.checkGameOver();
        }
    }

    updateDisplay() {
        const cellElements = this.grid.children;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.cells[i][j];
                const cell = cellElements[i * this.size + j];
                cell.textContent = value || '';
                cell.dataset.value = value || '';
            }
        }
        this.scoreDisplay.textContent = `分数: ${this.score}`;
    }

    checkGameOver() {
        // 检查是否还有空格
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.cells[i][j] === 0) return;
            }
        }

        // 检查是否还能合并
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.cells[i][j];
                if ((i < this.size - 1 && this.cells[i + 1][j] === current) ||
                    (j < this.size - 1 && this.cells[i][j + 1] === current)) {
                    return;
                }
            }
        }

        // 游戏结束
        this.gameOver = true;
        this.finalScoreDisplay.textContent = this.score;
        this.gameOverDiv.style.display = 'block';
    }
}

const game = new Game2048();
game.startNewGame();