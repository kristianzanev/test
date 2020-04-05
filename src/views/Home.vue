
<template>
  <div class="home">
    <h1>3d scene</h1>
    <div id='stage'/>
  </div>
</template>

<script>
import FightScene from '../js/FightScene.js'

export default {
  mounted () {
    const stage = document.querySelector('#stage')
    const scene = new FightScene()
    scene.createScene(stage)
  }
}
</script>
