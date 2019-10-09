import Vector2, { randomInteger } from './Vector2'

class AnimationDot {
  constructor(animation, index) {
    this.animation = animation
    this.index = index
    this.pos = new Vector2(0, 0)
    this.color = '#002c00'
    this.setRandomPosition()
    this.setInitialSize()
  }

  setRandomPosition = () => {
    const x = randomInteger(0, this.animation.width)
    const y = randomInteger(0, this.animation.height)
    this.pos.reset(x, y)
  }

  setInitialSize = () => {
    const { animation, pos } = this
    const closestDistance = animation.dots
      .map((dot) => Math.abs(dot.pos.minusNew(pos).magnitude()) - dot.size / 2)
      .concat(pos.x, pos.y, animation.width - pos.x, animation.height - pos.y)
      .reduce((prev, cur) => Math.min(prev, cur), Infinity)

    if (closestDistance < animation.minSize / 2) {
      this.setRandomPosition()
      this.setInitialSize()
    } else {
      this.size = Math.min(
        closestDistance * 2 - animation.margin,
        animation.maxSize
      )
    }
  }

  draw = () => {
    const { size, pos, color, animation } = this
    const { c } = animation
    c.save()

    c.strokeStyle = color
    c.beginPath()
    c.translate(pos.x, pos.y)
    c.arc(0, 0, size / 2, 0, Math.PI * 2, true)
    c.stroke()

    c.restore()
  }

  update = () => {}
}

export default AnimationDot
