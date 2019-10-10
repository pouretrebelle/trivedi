import Vector2, { randomFloat, randomInteger } from './Vector2'

class AnimationDot {
  size = undefined
  nucleusSize = undefined
  tendtrilCount = undefined

  constructor(animation, index) {
    this.animation = animation
    this.index = index
    this.pos = new Vector2(0, 0)
    this.color = '#002c00'
    this.initialSpokeAngle = Math.random() * Math.PI
    this.setRandomPosition()
    this.setInitialSize()
  }

  setRandomPosition = () => {
    const { width, height } = this.animation

    const radius = Math.random() * (Math.min(width, height) * 0.35)
    const angle = Math.random() * (Math.PI * 2)

    const x = radius * Math.cos(angle) + width / 2
    const y = radius * Math.sin(angle) + height / 2
    this.pos.reset(Math.round(x), Math.round(y))
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
      this.nucleusSize =
        this.size < animation.nucleusMaxSize * 1.5
          ? this.size / 1.5
          : animation.nucleusMaxSize
      this.spokeCount = Math.floor(5 + (this.size - this.nucleusSize) * 0.15)
    }
  }

  draw = () => {
    const {
      size,
      nucleusSize,
      spokeCount,
      initialSpokeAngle,
      pos,
      color,
      animation,
    } = this
    const { c } = animation
    c.save()

    c.translate(pos.x, pos.y)

    c.strokeStyle = color
    c.beginPath()
    c.arc(0, 0, size / 2, 0, Math.PI * 2, true)
    c.stroke()

    c.fillStyle = color
    c.beginPath()
    c.arc(0, 0, nucleusSize / 2, 0, Math.PI * 2, true)
    c.fill()

    const spoke = new Vector2(size / 2, 0)
    spoke.rotate(initialSpokeAngle)

    c.beginPath()
    Array.from({ length: spokeCount }, (v, i) => (i / spokeCount) * Math.PI * 2)
      .map((angle) => spoke.clone().rotate(angle))
      .forEach((pos) => {
        c.moveTo(0, 0)
        c.lineTo(pos.x, pos.y)
      })
    c.stroke()

    c.restore()
  }

  update = () => {}
}

export default AnimationDot
