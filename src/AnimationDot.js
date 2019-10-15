import Vector2 from './utils'
import AnimationSpoke from './AnimationSpoke'
import bezierCurveThrough from './vendor/canvas-bezier-multipoint'

class AnimationDot {
  startSize = undefined
  nucleusSize = undefined
  spokeCount = undefined
  spokes = []

  constructor(animation, index) {
    this.animation = animation
    this.index = index
    this.pos = new Vector2(0, 0)
    this.maxSize = 100 + Math.random() * (animation.maxSize - 100)
    this.initialSpokeAngle = Math.random() * Math.PI
    this.setRandomPosition()
    this.setInitialSize()
  }

  setRandomPosition = () => {
    const { width, height } = this.animation
    const angle = Math.random() * (Math.PI * 2)
    const x = Math.random() * 0.35 * width * Math.cos(angle)
    const y = Math.random() * 0.35 * height * Math.sin(angle)
    this.pos.reset(Math.round(x), Math.round(y))
  }

  setInitialSize = () => {
    const { animation, pos } = this
    const closestDistance = animation.dots
      .map(
        (dot) => Math.abs(dot.pos.minusNew(pos).magnitude()) - dot.startSize / 2
      )
      .reduce((prev, cur) => Math.min(prev, cur), Infinity)

    if (closestDistance < animation.minSize / 2) {
      this.setRandomPosition()
      this.setInitialSize()
    } else {
      const size = Math.min(
        closestDistance * 2 - animation.margin,
        this.maxSize
      )
      this.nucleusSize = Math.pow(size, 0.75) + 5
      this.spokeCount = Math.floor(11 + (size - this.nucleusSize) * 0.4)

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
    const { nucleusSize, spokes, pos, animation } = this
    const { c } = animation
    c.save()
    c.translate(pos.x, pos.y)

    c.beginPath()
    c.arc(0, 0, nucleusSize / 2, 0, Math.PI * 2, true)
    c.fill()

    c.beginPath()

    // spokes
    spokes.forEach((spoke) => {
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
    this.updateSpokes()
  }

  updateSpokes = () => {
    const dotsToCheck = this.animation.dots.filter((dot) => dot !== this)
    const spokesToMove = this.spokes.filter((s) => !s.finishedMoving)

    spokesToMove.forEach((spoke) => {
      const spokePosition = spoke.getCompoundPos()

      const otherPositions = dotsToCheck.reduce(
        (acc, cur) => acc.concat(cur.getCompoundSpokePositions()),
        []
      )
      const otherDistances = otherPositions.map((pos) =>
        pos.minusNew(spokePosition).magnitude()
      )

      let otherIndex = undefined
      otherDistances.reduce((prev, cur, i) => {
        if (cur < prev) {
          otherIndex = i
          return cur
        }
        return prev
      }, Infinity)

      const otherPosition = otherPositions[otherIndex]
      const distFromCenter = otherPosition.minusNew(this.pos).magnitude()

      const prevSpoke =
        this.spokes[spoke.i - 1] || this.spokes[this.spokeCount - 1]
      const nextSpoke = this.spokes[spoke.i + 1] || this.spokes[0]

      const neighbourSplit =
        Math.abs(prevSpoke.length - spoke.length) +
        Math.abs(nextSpoke.length - spoke.length)

      if (
        spoke.length + this.animation.margin < distFromCenter &&
        spoke.length < this.startSize * 1.2 &&
        neighbourSplit < 5
      ) {
        return spoke.addToLength(2)
      }

      spoke.finished()
    })
  }
}

export default AnimationDot
