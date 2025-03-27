class Snake {
    constructor() {
        this.body = [
            { x: 10, y: 10 }
        ];
        this.direction = 'right';
    }

    move() {
        const head = { ...this.body[0] };

        switch (this.direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }

        this.body.unshift(head);
        this.body.pop();
    }

    grow() {
        const tail = { ...this.body[this.body.length - 1] };
        this.body.push(tail);
    }

    checkCollision(gridSize) {
        const head = this.body[0];

        // 检查是否撞墙
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
            return true;
        }

        // 检查是否撞到自己
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                return true;
            }
        }

        return false;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileSize = this.canvas.width / this.gridSize;
        this.snake = new Snake();
        this.food = this.generateFood();
        this.score = 0;
        this.gameLoop = null;
        this.setupEventListeners();
    }

    generateFood() {
        const food = {
            x: Math.floor(Math.random() * this.gridSize),
            y: Math.floor(Math.random() * this.gridSize)
        };

        // 确保食物不会生成在蛇身上
        for (const segment of this.snake.body) {
            if (food.x === segment.x && food.y === segment.y) {
                return this.generateFood();
            }
        }
        return food;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                    if (this.snake.direction !== 'down') this.snake.direction = 'up';
                    break;
                case 'ArrowDown':
                    if (this.snake.direction !== 'up') this.snake.direction = 'down';
                    break;
                case 'ArrowLeft':
                    if (this.snake.direction !== 'right') this.snake.direction = 'left';
                    break;
                case 'ArrowRight':
                    if (this.snake.direction !== 'left') this.snake.direction = 'right';
                    break;
            }
        });

        document.getElementById('startBtn').addEventListener('click', () => {
            this.start();
        });
    }

    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制蛇
        this.ctx.fillStyle = '#4CAF50';
        for (const segment of this.snake.body) {
            this.ctx.fillRect(
                segment.x * this.tileSize,
                segment.y * this.tileSize,
                this.tileSize - 1,
                this.tileSize - 1
            );
        }

        // 绘制食物
        this.ctx.fillStyle = '#FF4444';
        this.ctx.fillRect(
            this.food.x * this.tileSize,
            this.food.y * this.tileSize,
            this.tileSize - 1,
            this.tileSize - 1
        );
    }

    update() {
        this.snake.move();

        // 检查是否吃到食物
        if (this.snake.body[0].x === this.food.x && this.snake.body[0].y === this.food.y) {
            this.snake.grow();
            this.food = this.generateFood();
            this.score += 10;
            document.getElementById('score').textContent = `分数: ${this.score}`;
        }

        // 检查碰撞
        if (this.snake.checkCollision(this.gridSize)) {
            this.gameOver();
        }
    }

    gameOver() {
        clearInterval(this.gameLoop);
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
        document.getElementById('startBtn').disabled = false;
    }

    start() {
        // 重置游戏状态
        this.snake = new Snake();
        this.food = this.generateFood();
        this.score = 0;
        document.getElementById('score').textContent = '分数: 0';
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('startBtn').disabled = true;

        // 开始游戏循环
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 150);
    }
}

const game = new Game();