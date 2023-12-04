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
        loadImages() {
            this.scissorsImage = new Image();
            this.scissorsImage.src = require('@/assets/scissors.svg');

            this.rockImage = new Image();
            this.rockImage.src = require('@/assets/rock.svg');

            this.paperImage = new Image();
            this.paperImage.src = require('@/assets/paper.svg');
        },
        startGame() {
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
                type: type, // 'scissors', 'rock', or 'paper'
                x: Math.random() * 600, // 随机 x 位置
                y: Math.random() * 400, // 随机 y 位置
                vx: (Math.random() - 0.5) * 15, // 随机 x 方向速度
                vy: (Math.random() - 0.5) * 15, // 随机 y 方向速度
            };
        },
        gameLoop() {
            this.updateGameDuration();
            // 清空画布
            this.ctx.clearRect(0, 0, 600, 400);

            // 更新和绘制每个游戏元素
            this.items.forEach(item => {
                // 更新位置
                item.x += item.vx;
                item.y += item.vy;

                // 处理边界碰撞
                if (item.x < 0 || item.x > 600) item.vx = -item.vx;
                if (item.y < 0 || item.y > 400) item.vy = -item.vy;

                // 绘制元素
                this.drawItem(item);
            });

            // 检查相互之间的碰撞并更新状态
            this.checkCollisions();

            // 检查游戏结束条件
            this.checkGameOver();
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

        },
        randomizeDirection(item) {
            const angle = Math.random() * Math.PI * 2; // 随机角度
            const speed = Math.sqrt(item.vx * item.vx + item.vy * item.vy); // 保持速度不变
            item.vx = Math.cos(angle) * speed;
            item.vy = Math.sin(angle) * speed;
        },
        checkGameOver() {
            if (this.items.length === 0) {
                return; // 没有元素，直接返回
            }

            const firstType = this.items[0].type;
            const isGameOver = this.items.every(item => item.type === firstType);

            if (isGameOver) {
                clearInterval(this.intervalId); // 停止游戏循环
                alert(`游戏结束，胜利者：${firstType}`); // 弹出胜利者信息
                // 可以在这里添加其他游戏结束后的逻辑
            }
        },
    },
    mounted() {
        const canvas = this.$refs.canvas;
        this.ctx = canvas.getContext('2d');
        this.loadImages();
    }
}
</script>

<style>
.status {
    margin-top: 10px;
}

.game-canvas {
    border: 2px solid #000;
    /* 黑色边框，你可以自定义颜色和边框宽度 */
    /* 可以添加其他样式，如圆角等 */
}
</style>
