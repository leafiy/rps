<template>
  <div>
    <canvas ref="goBoard" class="go-board"></canvas>
    <div style="text-align: center;">
      <div class="status">
        <p>剪刀数量: {{ scissorsCount }}</p>
        <p>石头数量: {{ rockCount }}</p>
        <p>布数量: {{ paperCount }}</p>
        <p>棋盘:{{ this.gridSize * this.gridSize }}</p>
        <p>剩余空格: {{ this.gridSize * this.gridSize - boardState.filter(i => i).length }}</p>
      </div>
      <!-- <button @click="addChessPieces">添加棋子</button> -->
    </div>
  </div>
</template>
<script>
import Vue from 'vue';

export default {
  name: 'Gomoku',
  data() {
    return {
      chessImages: [null, null, null],
      gridSize: 50,
      boardState: [],
      gameStartTime: null,
      gameDuration: null, // 游戏时长
      intervalId: null,
      winningPositions: [], // 存储获胜棋子的位置
    }
  },
  mounted() {
    this.boardState = Array(this.gridSize * this.gridSize).fill(null);
    this.loadChessImages();
    this.$nextTick(() => {
      this.drawGoBoard();
      setTimeout(() => {
        this.startAutoAddingChessPieces(); // 启动游戏

      }, 2000);
    });
  },

  computed: {
    scissorsCount() {
      return this.boardState.filter(type => type === 'scissors').length;
    },
    rockCount() {
      return this.boardState.filter(type => type === 'rock').length;
    },
    paperCount() {
      return this.boardState.filter(type => type === 'paper').length;
    },
  },

  beforeDestroy() {
    // window.removeEventListener('resize', this.drawGoBoard)
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  },

  methods: {
    startAutoAddingChessPieces() {
      this.intervalId = setInterval(() => {
        this.addChessPieces();

        if (this.isBoardFull()) {
          clearInterval(this.intervalId);
        }
      }, 100);
    },
    isBoardFull() {
      return this.boardState.every(type => type !== null);
    },
    loadChessImages() {
      this.chessImages = [new Image(), new Image(), new Image()]
      this.chessImages[0].src = require('@/assets/paper.png')
      this.chessImages[1].src = require('@/assets/rock.png')
      this.chessImages[2].src = require('@/assets/scissors.png')
    },
    drawGoBoard() {
      this.gameStartTime = Date.now(); // 设置游戏开始时间

      const canvas = this.$refs.goBoard;
      const context = canvas.getContext('2d');
      const size = Math.min(canvas.offsetWidth, 800);
      canvas.width = size;
      canvas.height = size;

      this.drawGrid(context, size);
      if (this.gameDuration) {
        this.drawWinningChessPieces(context, size); // 绘制获胜棋子
      } else {
        this.drawChessPieces(); // 绘制所有棋子
      }
    },
    drawWinningChessPieces(context, size) {
      const cellSize = size / this.gridSize;
      this.winningPositions.forEach(index => {
        const row = Math.floor(index / this.gridSize);
        const col = index % this.gridSize;
        const type = this.boardState[index];
        const typeIndex = ['paper', 'rock', 'scissors'].indexOf(type);
        this.placeChessPiece(context, this.chessImages[typeIndex], col, row, cellSize, type);
      });
    },


    drawGrid(context, size) {
      const cellSize = size / this.gridSize // 每个格子的大小
      context.strokeStyle = '#ddd' // 设置线条颜色

      for (let i = 0; i <= this.gridSize; i++) {
        context.beginPath()
        context.moveTo(i * cellSize, 0)
        context.lineTo(i * cellSize, size)
        context.stroke()

        context.beginPath()
        context.moveTo(0, i * cellSize)
        context.lineTo(size, i * cellSize)
        context.stroke()
      }
    },
    placeChessPiece(context, image, col, row, cellSize, type) {
      const index = row * this.gridSize + col;
      const existingType = this.boardState[index];

      // 如果格子为空或者按照剪刀石头布规则可以替换
      if (!existingType || this.canReplace(existingType, type)) {
        // this.boardState[index] = type;
        Vue.set(this.boardState, index, type)
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        const chessSize = cellSize;

        // 清除该格子当前的内容
        context.clearRect(x - chessSize / 2, y - chessSize / 2, chessSize, chessSize);

        if (image.complete) {
          context.drawImage(image, x - chessSize / 2, y - chessSize / 2, chessSize, chessSize);
        } else {
          image.onload = () => {
            context.drawImage(image, x - chessSize / 2, y - chessSize / 2, chessSize, chessSize);
          };
        }
      }
    },

    canReplace(existingType, newType) {
      // 实现剪刀石头布的规则
      const rules = {
        'scissors': 'paper',
        'rock': 'scissors',
        'paper': 'rock',
      };
      return rules[newType] === existingType;
    },

    drawChessPieces() {
      const canvas = this.$refs.goBoard;
      const context = canvas.getContext('2d');
      const cellSize = canvas.width / this.gridSize;

      for (let i = 0; i < 3; i++) {
        const col = Math.floor(Math.random() * this.gridSize);
        const row = Math.floor(Math.random() * this.gridSize);
        const type = ['paper', 'rock', 'scissors'][i]; // 分别代表不同的棋子类型
        this.placeChessPiece(context, this.chessImages[i], col, row, cellSize, type);
      }
    },


    addChessPieces() {
      const canvas = this.$refs.goBoard;
      const context = canvas.getContext('2d');
      const cellSize = canvas.width / this.gridSize;

      for (let i = 0; i < 10; i++) {
        const col = Math.floor(Math.random() * this.gridSize);
        const row = Math.floor(Math.random() * this.gridSize);
        const typeIndex = Math.floor(Math.random() * 3); // 随机选择类型
        const type = ['paper', 'rock', 'scissors'][typeIndex];
        this.placeChessPiece(context, this.chessImages[typeIndex], col, row, cellSize, type);
      }
      for (let i = 0; i < this.gridSize; i++) {
        for (let j = 0; j < this.gridSize; j++) {
          const type = this.boardState[i * this.gridSize + j];
          if (type && this.checkForWin(j, i, type)) {
            return; // 一方获胜，结束方法执行
          }
        }
      }
    },
    checkForWin(col, row, type) {
      if (this.checkLine(col, row, type, 1, 0) || // 检查横向
        this.checkLine(col, row, type, 0, 1) || // 检查竖向
        this.checkLine(col, row, type, 1, 1) || // 检查斜向（右下）
        this.checkLine(col, row, type, 1, -1)) { // 检查斜向（右上）
        // 游戏获胜，清除其他棋子
        this.boardState = this.boardState.map((currentType, index) => {
          return this.winningPositions.includes(index) ? currentType : null;
        });
        clearInterval(this.intervalId); // 停止定时器
        this.gameDuration = (Date.now() - this.gameStartTime) / 1000;
        alert(`游戏结束，${type} 获胜！游戏时长：${this.gameDuration.toFixed(2)} 秒`);
        return true;
      }
      return false;
    },
    // 修改 checkLine 方法以记录获胜棋子的位置
    checkLine(col, row, type, deltaX, deltaY) {
      let count = 0;
      let x = col;
      let y = row;

      // 检查一方向并记录位置
      while (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize && this.boardState[y * this.gridSize + x] === type) {
        this.winningPositions.push(y * this.gridSize + x);
        count++;
        x += deltaX;
        y += deltaY;
      }

      // 重置并检查相反方向
      x = col - deltaX;
      y = row - deltaY;
      this.winningPositions = []; // 重置获胜位置
      while (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize && this.boardState[y * this.gridSize + x] === type) {
        this.winningPositions.push(y * this.gridSize + x);
        count++;
        x -= deltaX;
        y -= deltaY;
      }

      return count > 5;
    },

  },
}
</script>

<style>
.go-board {
  max-width: 800px;
  width: 100%;
  height: auto;
}
</style>
