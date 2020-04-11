/* eslint-disable no-mixed-operators */
import { gsap } from 'gsap'

export default class Player1 {
  constructor (Object3D, mixer, THREELoopOnce, speed = 7) {
    this.Object3D = Object3D
    this.mixer = mixer
    this.THREELoopOnce = THREELoopOnce
    this.speed = speed
    this.jumpLength = 200
    this._activeAction = null
    this.actions = {}
    this.actionNames = null
    this.key = {
      left: {
        isDown: false,
        isAlreadyPressed: false, // this boolean is for checking if player is still holding the key
        code: 'KeyA'
      },
      jump: {
        isDown: false,
        isAlreadyPressed: false,
        code: 'KeyW'
      },
      right: {
        isDown: false,
        isAlreadyPressed: false,
        code: 'KeyD'
      },
      mmaKick: {
        isDown: false,
        isAlreadyPressed: false,
        code: 'KeyG'
      }
    }
    this.isSwitchedBefore = false
    this.isSwitchOn = false // for switching animations for the other player orientation
    this.default = {
      rotation: {
        y: 1.5,
        opposite: { y: 4.5 }
      },
      position: {
        x: -200
      }
    }
    this.timeline = gsap.timeline()
    this.stamps = {}

    this.init()
  }
  init () {
    // gsap.ticker.useRAF(false) //makes ticker using setTimout for frames intead of requestAnimationframe. Also used for not pausing when switching between tabs// a wise solution is to switch between these mods when user switches
    // gsap.ticker.lagSmoothing(0) // for not pausing rendering when swiching tabs, its bad because if theres fps drop there will be no smoothing of animations
    this.setActionNames()
    this.setPosition() // for setting position and rotation
    this.mixActions()
    this._activeAction = this.actions['idle'].play()
    this.setAnimations()
    this.handleKeyboardEvents()
  }
  setActionNames () { // will cause bugs if name of obejct3d is changed
    this.actionNames = this.Object3D.animations.reduce((acc, anim) => {
      if (anim.name.includes('Armature')) {
        const cleanName = anim.name.split('|')[1]
        // removes the word Armature in the animation name
        anim.name = cleanName // sets new name to animation
        acc[cleanName] = cleanName
        return acc
      }
    }, {})
  }
  setPosition (positionX = this.default.position.x, rotation = this.default.rotation.y) {
    this.Object3D.position.x = positionX
    this.Object3D.rotation.y = rotation
  }
  mixActions () {
    this.Object3D.animations.forEach(animation => {
      this.actions[animation.name] = this.mixer.clipAction(animation)
    })
  }
  fadeToAction ({ name = 'idle', duration = 0.1, inReverse = false, speed = 1, isLoopOnce = false, isfreezeLastFrame = true }) {
    let num
    inReverse ? num = -1 * speed : num = 1 * speed
    this._activeAction.clampWhenFinished = isfreezeLastFrame
    const previousAction = this._activeAction
    this._activeAction = this.actions[ name ]
    if (previousAction !== this._activeAction) previousAction.fadeOut(duration)
    this._activeAction.reset()
    if (isLoopOnce) this._activeAction.setLoop(this.THREELoopOnce)
    this._activeAction.setDuration()
    this._activeAction.setEffectiveTimeScale(num) // num = -1 is for reversing the animation
    this._activeAction.setEffectiveWeight(1)
    this._activeAction.fadeIn(duration)
    this._activeAction.play()
  }
  setAnimations () {
    // eslint-disable-next-line no-unused-vars
    let isAlreadyIdle = false
    // eslint-disable-next-line no-unused-vars
    this.isAlreadyJumping = false

    this.moveLeft = () => {
      if (!this.isSwitchOn) this.fadeToAction({ name: 'running', inReverse: true, speed: this.speed / 5 })
      else this.fadeToAction({ name: 'running', speed: this.speed / 5 })
      isAlreadyIdle = false
    }
    this.moveRight = () => {
      if (!this.isSwitchOn) this.fadeToAction({ name: 'running', speed: this.speed / 5 })
      else this.fadeToAction({ name: 'running', inReverse: true, speed: this.speed / 5 })
      isAlreadyIdle = false
    }
    this.mmaKick = () => {
      const isKickStillPlaying = this._activeAction.getClip().name === 'mmaKick' && this._activeAction.isRunning()
      if (!isKickStillPlaying) {
        console.time('kick')
        this.fadeToAction({ name: 'mmaKick', speed: 2, isLoopOnce: true })
        isAlreadyIdle = false
        this.mixer.addEventListener('finished', event => {
          const finishedClip = event.action.getClip()
          if (finishedClip === this._activeAction.getClip()) {
            console.timeEnd('kick')
            this.idle()
            this.mixer.removeEventListener('finished')
          }
        })
      }
    }
    this.jump = () => {
      if (this.isAlreadyJumping === false) {
        console.time('jump')
        const timescale = this.speed / 3
        const duration = ((this.actions.jumping.getClip().duration / timescale))
        const halfDuration = (duration / 2.2).toFixed(3) * 1 /** divided by 2.2 because of up and down in timeline
        ( there is bug if its only by 2) also fadeToAction and timeline anim are syncing and because there are 2 actions */
        isAlreadyIdle = false
        this.isAlreadyJumping = true
        this.fadeToAction({ name: 'jumping', speed: timescale, isLoopOnce: true })
        this.timeline
          .to(this.Object3D.position, halfDuration, { y: this.jumpLength, ease: 'Power1.easeOut' })
          .to(this.Object3D.position, halfDuration, {
            y: 0,
            ease: 'Power1.easeIn',
            onComplete: () => {
              console.timeEnd('jump')
              this.isAlreadyJumping = false
              if (this.key.left.isDown && this.key.right.isDown) this.idle() // if player holds a,d before and after jump
              else if (this.key.right.isDown) this.moveRight()
              else if (this.key.left.isDown) this.moveLeft()
              else this.idle()
            }
          })
      }
    }
    this.idle = () => {
      if (!isAlreadyIdle) {
        this.fadeToAction({ name: 'idle' })
        isAlreadyIdle = true
      }
    }
  }
  handleKeyboardEvents () {
    const logKeyDown = (event) => {
      if (event.code === this.key.right.code) {
        this.key.right.isDown = true
        if (!this.key.right.isAlreadyPressed) { // checking if key is previously pressed
          if (this.isAlreadyJumping) return
          if (this.key.left.isDown) this.idle() // plays idle in case if player holds a, d keys
          else this.moveRight()
        }
        this.key.right.isAlreadyPressed = true
      }
      if (event.code === this.key.left.code) {
        this.key.left.isDown = true
        if (!this.key.left.isAlreadyPressed) {
          if (this.isAlreadyJumping) return
          if (this.key.right.isDown) this.idle() // plays idle in case if player holds a, d keys
          else this.moveLeft()
        }
        this.key.left.isAlreadyPressed = true
      }
      if (event.code === this.key.jump.code) {
        this.key.jump.isDown = true
        if (this.key.jump.isAlreadyPressed === false) this.jump()
        this.key.jump.isAlreadyPressed = true
      }
      if (event.code === this.key.mmaKick.code) {
        this.key.mmaKick.isDown = true
        if (this.key.mmaKick.isAlreadyPressed === false) this.mmaKick()
        this.key.mmaKick.isAlreadyPressed = true
      }
    }
    const logKeyUp = (event) => {
      if (event.code === this.key.right.code) {
        this.key.right.isDown = false
        if (this.key.left.isDown && !this.isAlreadyJumping) this.moveLeft() // in case if player holds a,d or w,d then releases one of the keys, otherwise idle animation will play
        else if (!this.key.left.isDown && !this.isAlreadyJumping) this.idle()
        this.key.right.isAlreadyPressed = false
      }
      if (event.code === this.key.left.code) {
        this.key.left.isDown = false
        if (this.key.right.isDown && !this.isAlreadyJumping) this.moveRight() // in case if player holds a,d or a,w then releases one of the keys, otherwise idle animation will play
        else if (!this.key.right.isDown && !this.isAlreadyJumping) this.idle()
        this.key.left.isAlreadyPressed = false
      }
      if (event.code === this.key.jump.code) {
        this.key.jump.isDown = false
        this.key.jump.isAlreadyPressed = false
      }
      if (event.code === this.key.mmaKick.code) {
        this.key.mmaKick.isDown = false
        this.key.mmaKick.isAlreadyPressed = false
      }
    }
    window.addEventListener('keyup', logKeyUp)
    window.addEventListener('keydown', logKeyDown)
  }
  handleCollisionMovement (player2) {
    const isMovingLeft = this.moveDirection.x < 0 // this player move directions
    const isMovingRight = this.moveDirection.x > 0 //
    const isStill = this.moveDirection.x === 0 //
    const isInLeftSide = this.position.x < player2.position.x // is this player from the left side of player2
    const isInRightSide = this.position.x > player2.position.x // is this player from the right side of player2
    if (isInLeftSide) {
      if (isMovingRight) {
        this.position.x -= 0 // stopping this player movement
        player2.position.x += player2.currentSpeed / 4 // moving other player slowly
      } else if (isMovingLeft) this.updatePosition()
      else if (isStill) player2.position.x += player2.currentSpeed / 4 // moving other player slowly
    } else if (isInRightSide) {
      if (isMovingLeft) {
        this.position.x -= 0
        player2.position.x -= player2.currentSpeed / 4
      } else if (isMovingRight) this.updatePosition()
      else if (isStill) player2.position.x -= player2.currentSpeed / 4
    }
  }
  handleRotationSwitch (opponentPosX) {
    if (this.position.x > opponentPosX) this.switchRight()
    else if (this.position.x < opponentPosX) this.switchLeft()
  }
  switchRight () {
    const isRotationDefault = this.default.rotation.y === this.Object3D.rotation.y
    if (isRotationDefault) {
      this.isSwitchOn = true
      const switchedRotation = this.default.rotation.opposite.y // switches to opposite value
      if (this.key.right.isDown) this.fadeToAction({ name: 'running', inReverse: true, speed: this.speed / 5, duration: 0.05 }) // fix for moonwalking bug after switching
      gsap.to(this.Object3D.rotation, 0.3, { y: switchedRotation, ease: 'Power1.easeOut' })
    }
  }
  switchLeft () {
    const isRotationDefault = this.default.rotation.y === this.Object3D.rotation.y
    if (!isRotationDefault) {
      if (this.isSwitchOn) {
        this.isSwitchOn = false
        const switchedRotation = this.default.rotation.y
        if (this.key.left.isDown) this.fadeToAction({ name: 'running', inReverse: true, speed: this.speed / 5, duration: 0.05 }) // fix for moonwalking bug after switching
        gsap.to(this.Object3D.rotation, 0.3, { y: switchedRotation, ease: 'Power1.easeOut' })
      }
    }
  }

  _addKeyStamps (time) {
    for (const property in this.key) {
      const key = this.key[property]
      if (key.isDown) {
        if (!this.stamps.hasOwnProperty(key.code)) {
          this.stamps[key.code] = {
            startTime: time,
            startPosition: this.Object3D.position
          }
        }
      } else {
        if (this.stamps.hasOwnProperty(key.code)) {
          delete this.stamps[key.code]
        }
      }
    }
  }

  updatePosition (time) {
    this._addKeyStamps(time)
    this._handleMovement(time)
  }
  _handleMovement (currentTime) {
    if (this.key.left.isDown) {
      const { startTime, startPosition } = this.stamps[this.key.left.code]
      const passedTime = currentTime - startTime
      const distance = (this.speed * 1) * passedTime
      this.Object3D.position.x = startPosition.x - distance
      console.error('passedTime', passedTime, 'distance', distance, 'startPosition', startPosition.x, 'currentPosition', this.Object3D.position.x)
    }
    if (this.key.right.isDown) {
      const { startTime, startPosition } = this.stamps[this.key.right.code]
      const passedTime = currentTime - startTime
      const distance = (this.speed * 1) * passedTime
      // console.error('passedTime', passedTime, 'distance', distance)
      this.Object3D.position.x = startPosition.x + distance
    }
    // if (this.key.right.isDown) this.Object3D.position.x += this.speed
  }
  get activeAction () {
    return this._activeAction
  }
  get moveDirection () {
    if (this.key.left.isDown) return { x: -this.speed }
    else if (this.key.right.isDown) return { x: this.speed }
    else return { x: 0 }
  }
  get currentSpeed () {
    return this.speed
  }
  set currentSpeed (speed) {
    this.speed = speed
  }
  get Object3d () {
    return this.Object3D
  }
  get allActions () {
    return this.actions
  }
  get position () {
    return this.Object3D.position
  }
  set position (position) {
    this.Object3D.position = position
  }
}
