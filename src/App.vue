<template>
  <div id="app">
    <game-board></game-board>
  </div>
</template>

<script>
import GameBoard from './components/GameBoard.vue'

export default {
  name: 'App',
  components: {
    GameBoard
  }
}
</script>

<style>
#app {
  text-align: center;
}
</style>
