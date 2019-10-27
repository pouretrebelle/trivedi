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
    if (this.length > Math.pow(this.dot.spokeCount, 1.5)) return false

    const { width, height, margin } = this.dot.animation
    const halfScreen = new Vector2(width / 2, height / 2)
    const pos = this.getCompoundPos()
    const bottomRight = pos.minusNew(halfScreen)
    const topLeft = pos.plusNew(halfScreen)
    if (
      bottomRight.x > -margin ||
      bottomRight.y > -margin ||
      topLeft.x < margin ||
      topLeft.y < margin
    )
      return false

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
