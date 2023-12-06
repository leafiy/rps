<template>
  <div class="game-entry-container">
    <div v-for="game in games" :key="game.name" class="game-entry" @click="goToGame(game.url)">
      <img :src="game.icon" :alt="game.name" class="game-icon" />
      <p>{{ game.name }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      games: [
        {
          name: '剪刀石头大混战',
          icon: require('@/assets/war.png'),
          url: '/war',
        },
        { name: '8子棋', icon: require('@/assets/gomoku.png'), url: '/gomoku' },
        // 更多游戏...
      ],
    }
  },
  methods: {
    goToGame(url) {
      this.$router.push(url)
    },
  },
}
</script>

<style scoped>
.game-entry-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 20px;
}

.game-entry {
  width: 300px;
  height: 300px;
  margin: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.game-entry:hover {
  transform: scale(1.1);
}

.game-icon {
  width: 200px;
  height: 200px;
}
</style>
