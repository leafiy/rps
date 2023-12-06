<template>
  <div>
    <canvas ref="goBoard" class="go-board"></canvas>
    <!-- 其他内容 -->
  </div>
</template>
<script>
export default {
  name: 'YourComponent',
  data() {
    return {
      chessImages: [null, null, null],
    }
  },
  mounted() {
    this.loadChessImages()
    this.drawGoBoard()
    window.addEventListener('resize', this.drawGoBoard) // 响应式调整大小
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.drawGoBoard)
  },

  methods: {
    loadChessImages() {
      this.chessImages = [new Image(), new Image(), new Image()]
      this.chessImages[0].src = require('@/assets/paper.png')
      this.chessImages[1].src = require('@/assets/rock.png')
      this.chessImages[2].src = require('@/assets/scissors.png')
    },
    drawGoBoard() {
      const canvas = this.$refs.goBoard
      const context = canvas.getContext('2d')
      const size = Math.min(canvas.offsetWidth, 800) // 获取适应屏幕的大小
      canvas.width = size
      canvas.height = size

      this.drawGrid(context, size)
      this.drawChessPieces()
    },

    drawGrid(context, size) {
      const cellSize = size / 50 // 每个格子的大小
      context.strokeStyle = '#ddd' // 设置线条颜色

      for (let i = 0; i <= 50; i++) {
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
    drawChessPieces() {
      const canvas = this.$refs.goBoard
      const context = canvas.getContext('2d')
      const size = Math.min(canvas.offsetWidth, 800)
      const gridSize = 100 // 格子数量
      const cellSize = size / gridSize // 每个格子的大小
      const chessSize = cellSize * 1.1 // 棋子直径稍大于格子间距

      for (let i = 0; i < 3; i++) {
        const col = Math.floor(Math.random() * gridSize)
        const row = Math.floor(Math.random() * gridSize)
        const x = col * cellSize + cellSize / 2
        const y = row * cellSize + cellSize / 2

        // 绘制棋子，使其居中在格子交点
        if (this.chessImages[i].complete) {
          context.drawImage(
            this.chessImages[i],
            x - chessSize / 2,
            y - chessSize / 2,
            chessSize,
            chessSize
          )
        } else {
          this.chessImages[i].onload = () => {
            context.drawImage(
              this.chessImages[i],
              x - chessSize / 2,
              y - chessSize / 2,
              chessSize,
              chessSize
            )
          }
        }
      }
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
