/**
 * @description - you can add Players in this engine and it will take their hitbox_guide mesh
 * and update their boundingBox then it will check if there's collision between the updated bboxes.
 */
const Config = {
  hitGuide: 'boundingBox_guide'
}
export default class CollissionEngine {
  constructor ({
    THREEVector3,
    THREEVector4,
    THREEMatrix4,
    THREEBox3
  }) {
    this.THREEVector3 = THREEVector3
    this.THREEVector4 = THREEVector4
    this.THREEMatrix4 = THREEMatrix4
    this.THREEBox3 = THREEBox3
    this._elements = []
  }

  get elements () {
    return this._elements
  }

  /**
   *  @param elements [array] with Players Classes
   */
  addElements (players) {
    // this._elements = players.map(player => this._collisionElementFactory(player)) test this later
    players.forEach(player => this._elements.push(this._collisionElementFactory(player)))
  }

  getCollidedPlayers () {
    this._updateAllBBoxes()
    let collidedElements
    for (let i = 0; i < this._elements.length; i++) {
      const element1 = this._elements[i]

      for (let j = 0; j < this._elements.length; j++) {
        const element2 = this._elements[j]

        if (element1 !== element2) {
          const isCollisionBetween2 = element1.box3.intersectsBox(element2.box3)
          if (isCollisionBetween2) {
            collidedElements = { player1: element1.player, player2: element2.player }

            break
          }
        }
      }

      if (collidedElements) break
    }
    return collidedElements
  }

  _collisionElementFactory (player) {
    const meshGuide = player.Object3d.children.find(mesh => mesh.name === Config.hitGuide)
    return {
      player,
      meshGuide,
      box3: new this.THREEBox3()
    }
  }

  _updateAllBBoxes () {
    for (let i = 0; i < this._elements.length; i++) {
      const element = this._elements[i]
      this._updateBoundingBox(element.meshGuide, element.box3)
    }
  }

  _updateBoundingBox (skinnedMesh, aabb) { // this is very taxing process
    const vertex = new this.THREEVector3()
    const temp = new this.THREEVector3()
    const skinned = new this.THREEVector3()
    const skinIndices = new this.THREEVector4()
    const skinWeights = new this.THREEVector4()
    const boneMatrix = new this.THREEMatrix4()

    const skeleton = skinnedMesh.skeleton
    const boneMatrices = skeleton.boneMatrices
    const geometry = skinnedMesh.geometry

    const index = geometry.index
    const position = geometry.attributes.position
    const skinIndex = geometry.attributes.skinIndex
    const skinWeigth = geometry.attributes.skinWeight

    const bindMatrix = skinnedMesh.bindMatrix
    const bindMatrixInverse = skinnedMesh.bindMatrixInverse

    let i, j, si, sw

    aabb.makeEmpty()

    //

    if (index !== null) {
      // indexed geometry

      for (i = 0; i < index.count; i++) {
        vertex.fromBufferAttribute(position, index[ i ])
        skinIndices.fromBufferAttribute(skinIndex, index[ i ])
        skinWeights.fromBufferAttribute(skinWeigth, index[ i ])

        // the following code section is normally implemented in the vertex shader

        vertex.applyMatrix4(bindMatrix) // transform to bind space
        skinned.set(0, 0, 0)

        for (j = 0; j < 4; j++) {
          si = skinIndices.getComponent(j)
          sw = skinWeights.getComponent(j)
          boneMatrix.fromArray(boneMatrices, si * 16)

          // weighted vertex transformation

          temp.copy(vertex).applyMatrix4(boneMatrix).multiplyScalar(sw)
          skinned.add(temp)
        }

        skinned.applyMatrix4(bindMatrixInverse) // back to local space

        // expand aabb

        aabb.expandByPoint(skinned)
      }
    } else {
      // non-indexed geometry

      for (i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(position, i)
        skinIndices.fromBufferAttribute(skinIndex, i)
        skinWeights.fromBufferAttribute(skinWeigth, i)

        // the following code section is normally implemented in the vertex shader

        vertex.applyMatrix4(bindMatrix) // transform to bind space
        skinned.set(0, 0, 0)

        for (j = 0; j < 4; j++) {
          si = skinIndices.getComponent(j)
          sw = skinWeights.getComponent(j)
          boneMatrix.fromArray(boneMatrices, si * 16)

          // weighted vertex transformation

          temp.copy(vertex).applyMatrix4(boneMatrix).multiplyScalar(sw)
          skinned.add(temp)
        }

        skinned.applyMatrix4(bindMatrixInverse) // back to local space

        // expand aabb

        aabb.expandByPoint(skinned)
      }
    }

    aabb.applyMatrix4(skinnedMesh.matrixWorld)
  }
}
