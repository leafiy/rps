<template>
    <div>
        <canvas ref="canvas" class="game-canvas" width="600" height="400"></canvas>
        <div class="status">
            <p>游戏时长: {{ gameDuration }} 秒</p>
            <p>剪刀: {{ scissorsCount }}</p>
            <p>石头: {{ rockCount }}</p>
            <p>布: {{ paperCount }}</p>
        </div>
        <button @click="startGame">Start</button>
        <div v-if="showModal" class="modal">
            <p>{{ modalMessage }}</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'GameBoard',
    data() {
        return {
            items: [], // 存储游戏元素
            ctx: null, // Canvas context
            intervalId: null, // 游戏循环的 interval ID,
            scissorsImage: null,
            rockImage: null,
            paperImage: null,
            gameStartTime: null,
            gameDuration: 0,
            gameEnded: false,
            canvasWidth: 600, // 初始宽度
            canvasHeight: 400, // 初始高度
            showModal: false,
            modalMessage: '',

        };
    },
    computed: {
        scissorsCount() {
            return this.items.filter(item => item.type === 'scissors').length;
        },
        rockCount() {
            return this.items.filter(item => item.type === 'rock').length;
        },
        paperCount() {
            return this.items.filter(item => item.type === 'paper').length;
        },
    },
    methods: {
        restartGame() {
            this.showModal = false; // 隐藏模态框
            this.startGame(); // 重新开始游戏
        },
        endGame(message) {
            this.modalMessage = message;
            this.showModal = true; // 显示模态框
            setTimeout(() => {
                this.restartGame();
            }, 20000); // 20秒后自动重新开始游戏
        },
        loadImages() {
            this.scissorsImage = new Image();
            this.scissorsImage.src = require('@/assets/scissors.png');

            this.rockImage = new Image();
            this.rockImage.src = require('@/assets/rock.png');

            this.paperImage = new Image();
            this.paperImage.src = require('@/assets/paper.png');
        },

        startGame() {
            this.gameEnded = false; // 重置游戏结束标记
            this.initItems(); // 初始化游戏元素
            this.intervalId = setInterval(this.gameLoop, 100);
            this.gameStartTime = Date.now();
            this.updateGameDuration();
        },
        updateGameDuration() {
            if (this.gameStartTime) {
                this.gameDuration = Math.floor((Date.now() - this.gameStartTime) / 1000);
            }
        },
        initItems() {
            this.items = []; // 清空之前的游戏元素

            // 生成 10 个剪刀、石头、布
            for (let i = 0; i < 40; i++) {
                this.items.push(this.createItem('scissors'));
                this.items.push(this.createItem('rock'));
                this.items.push(this.createItem('paper'));
            }
        },
        createItem(type) {
            return {
                type: type,
                x: Math.random() * this.canvasWidth, // 使用动态宽度
                y: Math.random() * this.canvasHeight, // 使用动态高度
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
            };
        },
        gameLoop() {
            this.updateGameDuration();

            let needsRedraw = false;

            // 更新每个元素的位置
            this.items.forEach(item => {
                if (this.updatePosition(item)) {
                    needsRedraw = true;
                }
            });

            // 检查相互之间的碰撞并更新状态
            if (this.checkCollisions()) {
                needsRedraw = true;
            }

            // 如果有变化，重绘画布
            if (needsRedraw) {
                this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight); // 使用动态尺寸
                this.items.forEach(item => {
                    this.drawItem(item);
                });
            }

            // 检查游戏结束条件
            this.checkGameOver();
        },
        redrawCanvas() {
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.items.forEach(item => {
                this.drawItem(item);
            });
        },

        updatePosition(item) {
            let moved = false;

            // 更新位置
            item.x += item.vx;
            item.y += item.vy;

            // 检查边界碰撞并反转速度
            if (item.x < 0 || item.x > this.canvasWidth) {
                item.vx = -item.vx;
                item.x = Math.max(0, Math.min(item.x, this.canvasWidth)); // 防止元素超出边界
                moved = true;
            }
            if (item.y < 0 || item.y > this.canvasHeight) {
                item.vy = -item.vy;
                item.y = Math.max(0, Math.min(item.y, this.canvasHeight)); // 防止元素超出边界
                moved = true;
            }

            return moved;
        },
        drawItem(item) {
            this.ctx.fillStyle = this.getItemColor(item.type); // 设置填充颜色
            let image;
            switch (item.type) {
                case 'scissors':
                    image = this.scissorsImage;
                    break;
                case 'rock':
                    image = this.rockImage;
                    break;
                case 'paper':
                    image = this.paperImage;
                    break;
            }
            if (image) {
                // 假设图标大小为 40x40
                this.ctx.drawImage(image, item.x - 10, item.y - 10, 10, 10);

            }
        },
        getItemColor(type) {
            // 根据类型返回不同的颜色
            switch (type) {
                case 'rock': return 'gray';
                case 'paper': return 'red';
                case 'scissors': return 'orange';
            }
        },
        checkCollisions() {
            let collisionOccurred = false;
            const size = 10; // 假设每个元素的大小相同
            for (let i = 0; i < this.items.length; i++) {
                for (let j = i + 1; j < this.items.length; j++) {
                    const item1 = this.items[i];
                    const item2 = this.items[j];

                    // 计算两个元素之间的距离
                    const dx = item1.x - item2.x;
                    const dy = item1.y - item2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // 检查是否发生碰撞
                    if (distance < size) {
                        // 碰撞发生，根据游戏规则处理
                        this.resolveCollision(item1, item2);
                    }
                }
            }
            return collisionOccurred;
        },
        resolveCollision(item1, item2) {
            // 基于剪刀、石头、布的规则更新状态
            if ((item1.type === 'scissors' && item2.type === 'paper') ||
                (item1.type === 'paper' && item2.type === 'scissors')) {
                item1.type = item2.type = 'scissors';
            } else if ((item1.type === 'paper' && item2.type === 'rock') ||
                (item1.type === 'rock' && item2.type === 'paper')) {
                item1.type = item2.type = 'paper';
            } else if ((item1.type === 'rock' && item2.type === 'scissors') ||
                (item1.type === 'scissors' && item2.type === 'rock')) {
                item1.type = item2.type = 'rock';
            }
            this.randomizeDirection(item1);
            this.randomizeDirection(item2);
            this.checkGameOver();
            return true;

        },
        randomizeDirection(item) {
            const angle = Math.random() * Math.PI * 2; // 随机角度
            const speedChange = (Math.random() - 0.5) * 3; // 随机改变速度
            const speed = Math.sqrt(item.vx * item.vx + item.vy * item.vy) + speedChange;
            item.vx = Math.cos(angle) * Math.max(1, speed); // 确保速度不低于1
            item.vy = Math.sin(angle) * Math.max(1, speed);
        },

        checkGameOver() {
            if (this.gameEnded) {
                return; // 如果游戏已经结束，不再执行任何操作
            }

            if (this.items.length === 0) {
                return; // 没有元素，直接返回
            }

            const firstType = this.items[0].type;
            const isGameOver = this.items.every(item => item.type === firstType);

            if (isGameOver) {
                this.gameEnded = true; // 标记游戏已结束
                clearInterval(this.intervalId); // 停止游戏循环
                this.endGame(`游戏结束，胜利者：${firstType}`);

                // 可以在这里添加其他游戏结束后的逻辑
            }
        },
        adjustCanvasSize() {
            const canvas = this.$refs.canvas;
            this.canvasWidth = canvas.offsetWidth;
            this.canvasHeight = canvas.offsetHeight;

            canvas.width = this.canvasWidth;
            canvas.height = this.canvasHeight;

            this.ctx = canvas.getContext('2d');
            this.loadImages();
            // 重新绘制画布内容
            this.redrawCanvas();
        },


    },
    mounted() {
        this.adjustCanvasSize();
        window.addEventListener('resize', this.adjustCanvasSize); // 监听窗口大小变化
        document.title = '剪刀石头大混战';
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.adjustCanvasSize);
    }
}
</script>

<style>
.status {
    margin-top: 10px;
}

.game-canvas {
    max-width: 800px;
    /* 设置最大宽度为 800px */
    width: 100%;
    /* 允许画布在较小的屏幕上自适应宽度 */
    border: 2px solid #000;
    /* 黑色边框，你可以自定义颜色和边框宽度 */
    /* 可以添加其他样式，如圆角等 */
}

.modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: 1px solid #ccc;
    background-color: white;
    padding: 20px;
    z-index: 1000;
}
</style>
