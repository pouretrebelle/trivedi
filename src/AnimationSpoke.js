import Vector2 from './utils'

class AnimationSpoke {
  finishedMoving = false

  constructor(dot, initialAngle, length, i) {
    this.dot = dot
    this.i = i
    this.length = length
    this.angle = initialAngle + (Math.PI * 2 * i) / dot.spokeCount
    this.pos = new Vector2(length, 0)
    this.pos.rotate(this.angle)
  }

  addToLength = (increment) => {
    this.length += increment
    this.pos.normalise().multiplyEq(this.length)
  }

  getCompoundPos = () => this.pos.plusNew(this.dot.pos)

  finished = () => (this.finishedMoving = true)
}

export default AnimationSpoke
