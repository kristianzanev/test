
<template>
  <div class="game">
    <div id='stage'>
      <HealthBar v-bind:healthStatus="this.healthBar.player1"/>
      <HealthBar position='right' v-bind:healthStatus="this.healthBar.player2"/>
    </div>
  </div>
</template>

<script>
import FightScene from '../js/FightScene.js'
import HealthBar from '../components/HealthBar'

export default {
  name: 'game',
  components: {
    HealthBar
  },
  data () {
    return {
      healthBar: {
        player1: {
          health: 100,
          name: 'player1'
        },
        player2: {
          health: 100,
          name: 'player2'
        }
      }
    }
  },
  mounted () {
    const stage = document.querySelector('#stage')
    const scene = new FightScene()
    scene.createScene(stage)
    scene.addListener('hit', (hitPlayer) => this.$emit('healthChange', hitPlayer))

    this.$on('healthChange', e => this.updateHealth(e))
  },
  methods: {
    updateHealth (hitPlayer) {
      this.healthBar[hitPlayer.name].health = hitPlayer.health
    }
  }
}
</script>

<style lang="scss">
$health-barPadding: 5px;

#stage {
  // position: absolute;
  margin: 0 !important;
  padding: 0 !important;
}
.bar-wrap {
  width: 30%;
  height: 5%;
  background: #cbcbcb;
  position: absolute;
  padding: $health-barPadding;
  .health-bar {
    width: calc(100% - (2 * #{$health-barPadding}));
    height: calc(100% - (2 *#{$health-barPadding}));
    background: gray;
    position: absolute;
  }
  .left-health-bar {
    background: red;
  }
}

</style>
