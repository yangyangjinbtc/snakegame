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
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (index === 0) {
                // 蛇头
                this.drawSnakeHead(x, y);
            } else {
                // 蛇身
                this.drawSnakeBody(x, y, index);
            }
            
            // 绘制身体连接处
            if (index > 0 && index < this.snake.length - 1) {
                this.drawSnakeConnection(index);
            }
        });
    }
    
    drawSnakeConnection(index) {
        const prev = this.snake[index - 1];
        const curr = this.snake[index];
        const next = this.snake[index + 1];
        
        const centerX = curr.x * this.gridSize + this.gridSize / 2;
        const centerY = curr.y * this.gridSize + this.gridSize / 2;
        
        this.ctx.save();
        this.ctx.fillStyle = '#27ae60';
        this.ctx.shadowColor = '#2ecc71';
        this.ctx.shadowBlur = 3;
        
        // 绘制平滑的连接曲线
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.gridSize/2 - 4, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawSnakeHead(x, y) {
        const centerX = x + this.gridSize / 2;
        const centerY = y + this.gridSize / 2;
        
        // 根据移动方向调整蛇头角度
        let rotation = 0;
        if (this.dx === 1) rotation = 0; // 向右
        else if (this.dx === -1) rotation = Math.PI; // 向左
        else if (this.dy === -1) rotation = -Math.PI/2; // 向上
        else if (this.dy === 1) rotation = Math.PI/2; // 向下
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(rotation);
        
        // 蛇头主体 - 更真实的形状
        this.ctx.fillStyle = '#27ae60';
        this.ctx.shadowColor = '#2ecc71';
        this.ctx.shadowBlur = 8;
        
        // 绘制椭圆形的蛇头
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.gridSize/2 - 1, this.gridSize/2 - 3, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // 蛇头前部更尖
        this.ctx.beginPath();
        this.ctx.moveTo(this.gridSize/2 - 3, 0);
        this.ctx.lineTo(this.gridSize/2 + 2, -3);
        this.ctx.lineTo(this.gridSize/2 + 2, 3);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 高光效果
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.ellipse(-3, -3, this.gridSize/4, this.gridSize/5, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // 眼睛 - 根据头部方向调整位置
        const eyeY = -4;
        const eyeSize = 2.5;
        const eyeOffset = 3;
        
        // 左眼
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(-eyeOffset, eyeY, eyeSize, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // 右眼
        this.ctx.beginPath();
        this.ctx.arc(eyeOffset, eyeY, eyeSize, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // 瞳孔
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(-eyeOffset + 0.5, eyeY - 0.5, 1, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(eyeOffset + 0.5, eyeY - 0.5, 1, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // 蛇信子 - 分叉的舌头
        this.ctx.strokeStyle = '#ff4757';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(this.gridSize/2 - 2, 0);
        this.ctx.lineTo(this.gridSize/2 + 3, -2);
        this.ctx.moveTo(this.gridSize/2 - 2, 0);
        this.ctx.lineTo(this.gridSize/2 + 3, 2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawSnakeBody(x, y, index) {
        const centerX = x + this.gridSize / 2;
        const centerY = y + this.gridSize / 2;
        const isTail = index === this.snake.length - 1;
        
        this.ctx.save();
        
        // 创建身体段的渐变效果
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, this.gridSize/2 - 2);
        
        if (isTail) {
            // 尾巴 - 逐渐变细
            gradient.addColorStop(0, '#2ecc71');
            gradient.addColorStop(1, '#27ae60');
            
            this.ctx.fillStyle = gradient;
            this.ctx.shadowColor = '#27ae60';
            this.ctx.shadowBlur = 4;
            
            // 绘制椭圆形的尾巴
            this.ctx.beginPath();
            this.ctx.ellipse(centerX, centerY, this.gridSize/2 - 3, this.gridSize/2 - 5, 0, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // 尾巴尖
            this.ctx.beginPath();
            this.ctx.ellipse(centerX + 2, centerY, this.gridSize/4, this.gridSize/4, 0, 0, 2 * Math.PI);
            this.ctx.fill();
        } else {
            // 身体 - 圆润的连接
            gradient.addColorStop(0, '#2ecc71');
            gradient.addColorStop(1, '#27ae60');
            
            this.ctx.fillStyle = gradient;
            this.ctx.shadowColor = '#27ae60';
            this.ctx.shadowBlur = 5;
            
            // 绘制圆润的身体段
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, this.gridSize/2 - 3, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // 身体纹理线条
            this.ctx.strokeStyle = '#27ae60';
            this.ctx.lineWidth = 0.5;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, this.gridSize/2 - 5, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
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