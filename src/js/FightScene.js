/* eslint-disable no-mixed-operators */
import Player1 from './players/Player1'
import Player2 from './players/Player2'
import CollisionEngine from './utils/CollisionEngine'

const THREE = window.THREE = require('three')
require('three/examples/js/loaders/FBXLoader')
const Zlib = require('three/examples/js/libs/inflate.min')
window.Zlib = Zlib.Zlib
//! https://github.com/mrdoob/three.js/blob/master/examples/webgl_animation_skinning_blending.html

export default class FightScene {
  constructor () {
    this.objScene = []
    this.modelPath = { // assets are in public folder, but are copied from webpack thats why there isn't the word 'public' in the path
      // mmaKickNoSkin: '/animations/MmaKickNoSkin.fbx',
      // idleSkin: '/animations/idleSkin.fbx',
      // runningNoSkin: '/animations/RunningNoSkin.fbx',
      // jumpingNoSkin: '/animations/JumpingNoSkin.fbx',
      // test: '/animations/test.fbx',
      dummy: '/animations/dummy6.fbx'
    }
    this.actions = {}
    this.mixer = null
    this.player1 = null
    this.box = null
    this.manager = new THREE.LoadingManager() /// for loading progress
    this.collisionEngine = new CollisionEngine({
      THREEVector3: THREE.Vector3,
      THREEVector4: THREE.Vector4,
      THREEMatrix4: THREE.Matrix4,
      THREEBox3: THREE.Box3
    })
  }

  createScene (stage) { // TODO make an init function which is invoked in this class
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.z = 550
    this.camera.position.y = 150
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setClearColor('#e5e5e5')
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    stage.appendChild(this.renderer.domElement)
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
    })
    const light = new THREE.PointLight(0xFFFFFF, 1, 1500)
    light.position.set(0, 100, 150)
    this.scene.add(light)

    this.detectCollisionCubes = (mesh1, mesh2) => {
      mesh1.geometry.computeBoundingBox()
      mesh2.geometry.computeBoundingBox()
      mesh1.updateMatrixWorld()
      mesh2.updateMatrixWorld()

      const box1 = mesh1.geometry.boundingBox.clone()
      box1.applyMatrix4(mesh1.matrixWorld)

      const box2 = mesh2.geometry.boundingBox.clone()
      box2.applyMatrix4(mesh2.matrixWorld)

      return box1.intersectsBox(box2)
    }

    this.detectCollisionCubes2 = (bbox1, bbox2) => {
      return bbox1.intersectsBox(bbox2)
    }

    this.init()
  }
  async init () {
    this.loadAssets()
    await this.handleLoadingProgress()
    this.collisionEngine.addElements([
      this.player1,
      this.player2
    ])
    this.startAnimation()
  }
  handleLoadingProgress () {
    return new Promise((resolve, reject) => {
      this.manager.onStart = function (url, itemsLoaded, itemsTotal) {
        console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.')
      }
      this.manager.onLoad = function () {
        console.log('Loading complete!')
        resolve('Loading complete!')
      }
      this.manager.onProgress = function (url, itemsLoaded, itemsTotal) {
        console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.')
      }
      this.manager.onError = function (url) {
        console.log('There was an error loading ' + url)
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(url)
      }
      window.loaderManager = this.manager // for debugging purposes should be deleted
    })
  }
  loadAssets () {
    const loader = new THREE.FBXLoader(this.manager)

    loader.load(this.modelPath.dummy, Object3D => { // TODO to load second player or find a way to clone the Object3D or copy and  load the file
      const mixer = new THREE.AnimationMixer(Object3D)
      this.player1 = new Player1(Object3D, mixer, THREE.LoopOnce)
      this.player1.Object3d.children.find(m => m.name === 'Beta_Surface').material.shininess = 10 // changing shininess of p1
      this.scene.add(Object3D)

      this.objScene.push({ Object3D, mixer, clock: new THREE.Clock() })
    }, undefined, error => {
      console.error(error)
    })
    loader.load(this.modelPath.dummy, Object3D => {
      console.error(Object3D)
      const mixer = new THREE.AnimationMixer(Object3D)
      this.player2 = new Player2(Object3D, mixer, THREE.LoopOnce)
      this.player2.Object3d.children.forEach(mesh => {
        if (mesh.name === 'Beta_Surface' && mesh.type === 'SkinnedMesh') {
          mesh.material.color = {
            r: 0.2,
            g: 0.2,
            b: 0.7
          }
          mesh.material.shininess = 10
        }
      })

      this.scene.add(Object3D)
      this.objScene.push({ Object3D, mixer, clock: new THREE.Clock() })
    }, undefined, error => {
      console.error(error)
    })
  }

  startAnimation () {
    this.collisionEngine.elements.forEach(el => {
      this.scene.add(new THREE.Box3Helper(el.box3, 0x00ff00)) // for green box helpers
    })
    // window.fpsCap = 60
    window.intervalRender = 60
    const render = () => {
      // if (window.fpsCap) {
      //   // eslint-disable-next-line no-inner-declarations
      //   const slowanimate = () => {
      //     setTimeout(() => {
      //       requestAnimationFrame(render)
      //     }, 1000 / window.fpsCap)
      //   }
      //   slowanimate()
      // } else requestAnimationFrame(render)

      // requestAnimationFrame(render)
      this.objScene.forEach(({ mixer, clock }) => mixer.update(clock.getDelta()))
      const collidedPlayers = this.collisionEngine.getCollidedPlayers() // there are always be 2 collided elements

      if (collidedPlayers) {
        console.warn(collidedPlayers.player1.activeAction.getClip().name)
        collidedPlayers.player1.handleCollisionMovement(collidedPlayers.player2)
        collidedPlayers.player2.handleCollisionMovement(collidedPlayers.player1)
      } else {
        this.player1.updatePosition()
        this.player2.updatePosition()
      }

      this.player1.handleRotationSwitch(this.player2.position.x)
      this.player2.handleRotationSwitch(this.player1.position.x)
      this.renderer.render(this.scene, this.camera)
    }
    // render()

    setInterval(() => {
      render()
    }, 1000 / window.intervalRender)
  }
}
