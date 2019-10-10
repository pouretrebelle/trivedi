import Vector2, { randomFloat, randomInteger } from './utils'
import AnimationSpoke from './AnimationSpoke'
import bezierCurveThrough from './vendor/canvas-bezier-multipoint'

class AnimationDot {
  size = undefined
  nucleusSize = undefined
  spokeCount = undefined
  spokes = []

  constructor(animation, index) {
    this.animation = animation
    this.index = index
    this.pos = new Vector2(0, 0)
    this.maxSize = 100 + Math.random() * (animation.maxSize - 100)
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
      .map(
        (dot) => Math.abs(dot.pos.minusNew(pos).magnitude()) - dot.startSize / 2
      )
      .concat(pos.x, pos.y, animation.width - pos.x, animation.height - pos.y)
      .reduce((prev, cur) => Math.min(prev, cur), Infinity)

    if (closestDistance < animation.minSize / 2) {
      this.setRandomPosition()
      this.setInitialSize()
    } else {
      const size = Math.min(
        closestDistance * 2 - animation.margin,
        this.maxSize
      )
      this.nucleusSize =
        size < animation.nucleusMaxSize * 1.5
          ? size / 1.5
          : animation.nucleusMaxSize
      this.spokeCount = Math.floor(10 + (size - this.nucleusSize) * 0.3)

      this.startSize = size
      this.setInitialSpokes(size / 2)
    }
  }

  setInitialSpokes = (length) => {
    this.spokes = Array.from(
      { length: this.spokeCount },
      (v, i) => new AnimationSpoke(this, this.initialSpokeAngle, length, i)
    )
  }

  getCompoundSpokePositions = () =>
    this.spokes.map((spoke) => spoke.pos.plusNew(this.pos))

  draw = () => {
    const { size, nucleusSize, spokes, pos, color, animation } = this
    const { c } = animation
    c.save()

    c.translate(pos.x, pos.y)

    c.lineWidth = 2
    c.strokeStyle = color
    c.fillStyle = color

    c.beginPath()
    c.arc(0, 0, nucleusSize / 2, 0, Math.PI * 2, true)
    c.fill()

    c.beginPath()

    // spokes
    spokes
      .filter((s, i) => i % 2 === 0) // every other spoke
      .forEach((spoke) => {
        c.moveTo(0, 0)
        c.lineTo(spoke.pos.x, spoke.pos.y)
      })

    c.stroke()

    // todo: fix start/end meeting point
    bezierCurveThrough(
      c,
      spokes
        .map((spoke) => [spoke.pos.x, spoke.pos.y])
        .concat([[spokes[0].pos.x, spokes[0].pos.y]])
    )
    c.stroke()

    c.restore()
  }

  update = () => {
    const dotsToCheck = this.animation.dots.filter((dot) => dot !== this)
    this.spokes.forEach((spoke) => {
      const spokePosition = spoke.getCompoundPos()

      const otherPositions = dotsToCheck.reduce(
        (acc, cur) => acc.concat(cur.getCompoundSpokePositions()),
        []
      )
      const otherDistances = otherPositions.map((pos) =>
        pos.minusNew(spokePosition).magnitude()
      )

      let otherIndex = undefined
      const distFromSpoke = otherDistances.reduce((prev, cur, i) => {
        if (cur < prev) {
          otherIndex = i
          return cur
        }
        return prev
      }, Infinity)

      const otherPosition = otherPositions[otherIndex]

      const distFromCenter = otherPosition.minusNew(this.pos).magnitude()

      if (spoke.length + this.animation.margin < distFromCenter)
        spoke.addToLength(1)
    })
  }
}

export default AnimationDot
