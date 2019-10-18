import Vector2 from './utils'

class AnimationSpoke {
  constructor(dot, initialAngle, length, i) {
    this.dot = dot
    this.i = i
    this.length = length
    this.angle = initialAngle + (Math.PI * 2 * i) / dot.spokeCount
    this.pos = new Vector2(length, 0)
    this.pos.rotate(this.angle)
  }

  setLength = (length) => {
    this.length = length
    this.pos.normalise().multiplyEq(this.length)
  }

  getCompoundPos = () => this.pos.plusNew(this.dot.pos)

  canGrow = () => {
    if (this.length > this.dot.startSize * 2.5) return false

    const prevSpoke =
      this.dot.spokes[this.i - 1] || this.dot.spokes[this.dot.spokeCount - 1]
    const nextSpoke = this.dot.spokes[this.i + 1] || this.dot.spokes[0]

    const neighbourSplit =
      Math.abs(prevSpoke.length - this.length) +
      Math.abs(nextSpoke.length - this.length)

    if (neighbourSplit > 5) return false

    return true
  }
}

export default AnimationSpoke
