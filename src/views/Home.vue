
<template>
  <div class="home">
    <!-- <h1>3d scene</h1> -->
    <div id='stage'>
      <div class='left-bar bar-wrap'>
        <span>{{healthBar.player1.health}}</span>
        <span>{{healthBar.player2.health}}</span>
        <div class='left-health-bar health-bar'/>
         </div>
    </div>
  </div>
</template>

<script>
import FightScene from '../js/FightScene.js'

export default {
  data () {
    return {
      healthBar: {
        player1: {
          health: ''
        },
        player2: {
          health: ''
        }
      }
    }
  },
  mounted () {
    const stage = document.querySelector('#stage')
    const scene = new FightScene()
    scene.createScene(stage)
    scene.addListener('hit', (hitPlayer) => {
      // this.healthBar[hitPlayer.name] = hitPlayer.health
      // this.$set(this.healthBar, hitPlayer.name, hitPlayer.health)
      console.error(this.healthBar.player1, this.healthBar.player2, this)
    })
  },
  methods: {
    removeHealth (hitPlayer) {
      this.healthBar[hitPlayer.name] = hitPlayer.health
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
