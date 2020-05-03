<template>
  <div class="hello">
      <div class='left-bar bar-wrap'>
        <span>{{player1.health}}</span>
        <span>{{player2.health}}</span>
        <div class='left-health-bar health-bar'/>
         </div>
  </div>
</template>

<script>
export default {
  name: 'HealthBar',
  props: {
    healthStatus: {
      type: Object,
      default: function () {
        return {
          player1: {
            health: 100
          },
          player2: {
            health: 100
          }
        }
      }
    }
  },
  computed: {
    health () {
      return this.healthStatus
    }
  },
  methods: {
    updateHealth (hitPlayer) {
    //   let incrementCount = this.health[hitPlayer.name] = ;
      this.$emit('health', hitPlayer)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
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
