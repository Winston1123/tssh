class Tetris {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPiece');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.blockSize = 30;
        this.cols = this.canvas.width / this.blockSize;
        this.rows = this.canvas.height / this.blockSize;
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameLoop = null;
        this.currentPiece = null;
        this.nextPiece = null;
        this.gameSpeed = 1000;
        this.setupEventListeners();
    }

    // 定义俄罗斯方块的形状
    static SHAPES = [
        [[1, 1, 1, 1]], // I
        [[1, 1], [1, 1]], // O
        [[1, 1, 1], [0, 1, 0]], // T
        [[1, 1, 1], [1, 0, 0]], // L
        [[1, 1, 1], [0, 0, 1]], // J
        [[1, 1, 0], [0, 1, 1]], // S
        [[0, 1, 1], [1, 1, 0]]  // Z
    ];

    static COLORS = [
        '#00f0f0', // I - 青色
        '#f0f000', // O - 黄色
        '#a000f0', // T - 紫色
        '#f0a000', // L - 橙色
        '#0000f0', // J - 蓝色
        '#00f000', // S - 绿色
        '#f00000'  // Z - 红色
    ];

    generatePiece() {
        const shapeIndex = Math.floor(Math.random() * Tetris.SHAPES.length);
        return {
            shape: Tetris.SHAPES[shapeIndex],
            color: Tetris.COLORS[shapeIndex],
            x: Math.floor(this.cols / 2) - Math.floor(Tetris.SHAPES[shapeIndex][0].length / 2),
            y: 0
        };
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.currentPiece) return;

            switch (e.key) {
                case 'ArrowLeft':
                    if (this.isValidMove(this.currentPiece.x - 1, this.currentPiece.y, this.currentPiece.shape)) {
                        this.currentPiece.x--;
                    }
                    break;
                case 'ArrowRight':
                    if (this.isValidMove(this.currentPiece.x + 1, this.currentPiece.y, this.currentPiece.shape)) {
                        this.currentPiece.x++;
                    }
                    break;
                case 'ArrowDown':
                    if (this.isValidMove(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
                        this.currentPiece.y++;
                        this.score += 1;
                        this.updateScore();
                    }
                    break;
                case 'ArrowUp':
                    const rotated = this.rotate(this.currentPiece.shape);
                    if (this.isValidMove(this.currentPiece.x, this.currentPiece.y, rotated)) {
                        this.currentPiece.shape = rotated;
                    }
                    break;
            }

            this.draw();
        });

        document.getElementById('startBtn').addEventListener('click', () => {
            this.start();
        });
    }

    rotate(shape) {
        const rows = shape.length;
        const cols = shape[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                rotated[c][rows - 1 - r] = shape[r][c];
            }
        }

        return rotated;
    }

    isValidMove(x, y, shape) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const newX = x + c;
                    const newY = y + r;

                    if (newX < 0 || newX >= this.cols || newY >= this.rows) {
                        return false;
                    }

                    if (newY >= 0 && this.board[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    mergePiece() {
        for (let r = 0; r < this.currentPiece.shape.length; r++) {
            for (let c = 0; c < this.currentPiece.shape[r].length; c++) {
                if (this.currentPiece.shape[r][c]) {
                    const newY = this.currentPiece.y + r;
                    if (newY < 0) {
                        this.gameOver();
                        return;
                    }
                    this.board[newY][this.currentPiece.x + c] = this.currentPiece.color;
                }
            }
        }

        this.clearLines();
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.generatePiece();
        this.drawNextPiece();
    }

    clearLines() {
        let linesCleared = 0;

        for (let r = this.rows - 1; r >= 0; r--) {
            if (this.board[r].every(cell => cell !== 0)) {
                this.board.splice(r, 1);
                this.board.unshift(Array(this.cols).fill(0));
                linesCleared++;
                r++; // 检查同一行（因为上面的行下移了）
            }
        }

        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.gameSpeed = Math.max(100, 1000 - (this.level - 1) * 100);
            this.updateScore();
            this.restartGameLoop();
        }
    }

    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        const blockSize = this.nextCanvas.width / 4;
        const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * blockSize) / 2;

        for (let r = 0; r < this.nextPiece.shape.length; r++) {
            for (let c = 0; c < this.nextPiece.shape[r].length; c++) {
                if (this.nextPiece.shape[r][c]) {
                    this.nextCtx.fillStyle = this.nextPiece.color;
                    this.nextCtx.fillRect(
                        offsetX + c * blockSize,
                        offsetY + r * blockSize,
                        blockSize - 1,
                        blockSize - 1
                    );
                }
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制已固定的方块
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c]) {
                    this.ctx.fillStyle = this.board[r][c];
                    this.ctx.fillRect(
                        c * this.blockSize,
                        r * this.blockSize,
                        this.blockSize - 1,
                        this.blockSize - 1
                    );
                }
            }
        }

        // 绘制当前方块
        if (this.currentPiece) {
            this.ctx.fillStyle = this.currentPiece.color;
            for (let r = 0; r < this.currentPiece.shape.length; r++) {
                for (let c = 0; c < this.currentPiece.shape[r].length; c++) {
                    if (this.currentPiece.shape[r][c]) {
                        this.ctx.fillRect(
                            (this.currentPiece.x + c) * this.blockSize,
                            (this.currentPiece.y + r) * this.blockSize,
                            this.blockSize - 1,
                            this.blockSize - 1
                        );
                    }
                }
            }
        }
    }

    updateScore() {
        document.getElementById('score').textContent = `分数: ${this.score}`;
        document.getElementById('level').textContent = `等级: ${this.level}`;
        document.getElementById('lines').textContent = `消除行数: ${this.lines}`;
    }

    restartGameLoop() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }

    update() {
        if (!this.currentPiece) return;

        if (this.isValidMove(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
            this.currentPiece.y++;
        } else {
            this.mergePiece();
        }

        this.draw();
    }

    gameOver() {
        clearInterval(this.gameLoop);
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
        document.getElementById('startBtn').disabled = false;
    }

    start() {
        // 重置游戏状态
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameSpeed = 1000;
        this.currentPiece = this.generatePiece();
        this.nextPiece = this.generatePiece();
        this.updateScore();
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('startBtn').disabled = true;
        this.drawNextPiece();

        // 开始游戏循环
        this.restartGameLoop();
    }
}

const game = new Tetris();