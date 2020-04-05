import Player1 from './Player1'

export default class Player2 extends Player1 {
  // eslint-disable-next-line no-useless-constructor
  constructor (model, mixer, THREELoopOnce) {
    super(model, mixer, THREELoopOnce)
    this.key = { // inheriting keys from Player1
      left: {
        isDown: false,
        isAlreadyPressed: false, // this boolean is for checking if player is still holding the key
        code: 'KeyJ'
      },
      jump: {
        isDown: false,
        isAlreadyPressed: false,
        code: 'KeyI'
      },
      right: {
        isDown: false,
        isAlreadyPressed: false,
        code: 'KeyL'
      },
      mmaKick: {
        isDown: false,
        isAlreadyPressed: false,
        code: 'KeyN'
      }
    }
    this.setPosition(200) // for setting position and rotation
  }
}
