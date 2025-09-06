class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.finalScoreElement = document.getElementById('final-score');
        this.gameOverElement = document.getElementById('game-over');
        
        // 添加成语库
        this.idioms = [
            "功亏一篑", "功败垂成", "前功尽弃", "半途而废", "壮志未酬",
            "功亏一篑", "一失足成千古恨", "失之交臂", "棋差一着", "满盘皆输",
            "功败垂成", "前功尽弃", "半途而废", "壮志未酬", "功亏一篑"
        ];
        
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.speedSelect = document.getElementById('speed-select');
        
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.reset();
        this.bindEvents();
        this.loadHighScore();
    }
    
    reset() {
        this.snake = [
            {x: 10, y: 10}
        ];
        this.dx = 0;
        this.dy = 0;
        this.food = this.generateFood();
        this.score = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameLoop = null;
        
        this.updateScore();
        this.hideGameOver();
        this.draw();
    }
    
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }
    
    getSpeed() {
        const speeds = {
            'slow': 200,
            'medium': 150,
            'fast': 100,
            'extreme': 50
        };
        return speeds[this.speedSelect.value];
    }
    
    start() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gamePaused = false;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.speedSelect.disabled = true;
        
        if (this.dx === 0 && this.dy === 0) {
            this.dx = 1;
            this.dy = 0;
        }
        
        this.gameLoop = setInterval(() => this.update(), this.getSpeed());
    }
    
    pause() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.gamePaused = true;
        clearInterval(this.gameLoop);
        this.pauseBtn.textContent = '继续';
    }
    
    resume() {
        if (!this.gamePaused) return;
        
        this.gamePaused = false;
        this.gameLoop = setInterval(() => this.update(), this.getSpeed());
        this.pauseBtn.textContent = '暂停';
    }
    
    togglePause() {
        if (this.gamePaused) {
            this.resume();
        } else {
            this.pause();
        }
    }
    
    stop() {
        this.gameRunning = false;
        this.gamePaused = false;
        clearInterval(this.gameLoop);
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '暂停';
        this.speedSelect.disabled = false;
    }
    
    update() {
        if (!this.gameRunning || this.gamePaused) return;
        
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
            this.updateScore();
        } else {
            this.snake.pop();
        }
        
        this.draw();
    }
    
    checkCollision(head) {
        return (
            head.x < 0 ||
            head.x >= this.tileCount ||
            head.y < 0 ||
            head.y >= this.tileCount ||
            this.snake.some(segment => segment.x === head.x && segment.y === head.y)
        );
    }
    
    getRandomIdiom() {
        return this.idioms[Math.floor(Math.random() * this.idioms.length)];
    }
    
    gameOver() {
        this.stop();
        this.showGameOver();
        this.saveHighScore();
        this.showIdiom();
    }
    
    showIdiom() {
        const idiom = this.getRandomIdiom();
        
        // 创建成语显示元素
        const idiomDiv = document.createElement('div');
        idiomDiv.id = 'game-idiom';
        idiomDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 24px;
            font-weight: bold;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: fadeInOut 3s ease-in-out;
        `;
        
        idiomDiv.textContent = `成语：${idiom}`;
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(idiomDiv);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (idiomDiv.parentNode) {
                idiomDiv.parentNode.removeChild(idiomDiv);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 3000);
    }
    
    draw() {
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawSnake();
        this.drawFood();
        this.drawGrid();
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                this.ctx.fillStyle = '#27ae60';
                this.ctx.shadowColor = '#2ecc71';
                this.ctx.shadowBlur = 10;
            } else {
                this.ctx.fillStyle = '#2ecc71';
                this.ctx.shadowColor = '#27ae60';
                this.ctx.shadowBlur = 5;
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 2,
                segment.y * this.gridSize + 2,
                this.gridSize - 4,
                this.gridSize - 4
            );
            
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawFood() {
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.shadowColor = '#c0392b';
        this.ctx.shadowBlur = 15;
        
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    showGameOver() {
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.classList.remove('hidden');
    }
    
    hideGameOver() {
        this.gameOverElement.classList.add('hidden');
    }
    
    saveHighScore() {
        const highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
        if (this.score > highScore) {
            localStorage.setItem('snakeHighScore', this.score.toString());
            this.highScoreElement.textContent = this.score;
        }
    }
    
    loadHighScore() {
        const highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
        this.highScoreElement.textContent = highScore;
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.restartBtn.addEventListener('click', () => this.reset());
        
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning && !['Space', 'Enter'].includes(e.code)) return;
            
            switch(e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    if (this.dy !== 1) {
                        this.dx = 0;
                        this.dy = -1;
                        if (!this.gameRunning) this.start();
                    }
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    if (this.dy !== -1) {
                        this.dx = 0;
                        this.dy = 1;
                        if (!this.gameRunning) this.start();
                    }
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    if (this.dx !== 1) {
                        this.dx = -1;
                        this.dy = 0;
                        if (!this.gameRunning) this.start();
                    }
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    if (this.dx !== -1) {
                        this.dx = 1;
                        this.dy = 0;
                        if (!this.gameRunning) this.start();
                    }
                    break;
                case 'Space':
                case 'Enter':
                    e.preventDefault();
                    if (this.gameRunning) {
                        this.togglePause();
                    } else {
                        this.start();
                    }
                    break;
            }
        });
        
        this.speedSelect.addEventListener('change', () => {
            if (this.gameRunning && !this.gamePaused) {
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.getSpeed());
            }
        });
    }
}

const game = new SnakeGame();