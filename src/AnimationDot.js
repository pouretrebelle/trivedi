import Vector2 from './utils'
import AnimationSpoke from './AnimationSpoke'
import bezierCurveThrough from './vendor/canvas-bezier-multipoint'
import { map } from './utils'

class AnimationDot {
  size = undefined
  startSize = undefined
  nucleusSize = undefined
  spokeCount = undefined
  initialSpokeAngle = undefined
  spokes = []

  constructor(animation, index) {
    this.animation = animation
    this.index = index
    this.pos = new Vector2(0, 0)
    this.maxSize = 100 + Math.random() * (animation.maxSize - 100)
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

  setSize = () => {
    this.size =
      (this.spokes.reduce((acc, cur) => acc + cur.length, 0) /
        this.spokes.length) *
      2
  }

  setInitialSpokes = (length) => {
    this.initialSpokeAngle = (Math.random() * Math.PI * 2) / this.spokeCount
    this.spokes = Array.from(
      { length: this.spokeCount },
      (v, i) => new AnimationSpoke(this, this.initialSpokeAngle, length, i)
    )
  }

  getCompoundSpokePositions = () =>
    this.spokes.map((spoke) => spoke.pos.plusNew(this.pos))

  draw = () => {
    const { nucleusSize, spokes, pos, animation } = this
    const { c, dotScale } = animation
    const s = (v) => dotScale * v

    c.save()
    c.translate(pos.x, pos.y)

    c.beginPath()
    c.arc(0, 0, s(nucleusSize / 2), 0, Math.PI * 2, true)
    c.fill()

    c.beginPath()

    // spokes
    spokes.forEach((spoke) => {
      c.moveTo(0, 0)
      c.lineTo(s(spoke.pos.x), s(spoke.pos.y))
    })

    c.stroke()

    // todo: fix start/end meeting point
    bezierCurveThrough(
      c,
      spokes
        .map((spoke) => [s(spoke.pos.x), s(spoke.pos.y)])
        .concat([[s(spokes[0].pos.x), s(spokes[0].pos.y)]])
    )
    c.stroke()

    c.restore()
  }

  update = () => {
    this.updateSpokes()
    this.setSize()
  }

  updateSpokes = () => {
    const dotsToCheck = this.animation.dots.filter((dot) => dot !== this)
    const spokesToMove = this.spokes.filter((s) => !s.finishedMoving)

    spokesToMove.forEach((spoke) => {
      const spokePos = spoke.getCompoundPos()

      if (!spoke.canGrow()) return

      const otherPositions = dotsToCheck
        .filter(
          (dot) =>
            spokePos.minusNew(dot.pos).magnitude() <
            spoke.length + dot.size / 2 + 20
        )
        .map((dot) => {
          const vector = spokePos.minusNew(dot.pos)
          const angle = vector.angle() - dot.initialSpokeAngle
          const i =
            Math.round(
              (angle / (2 * Math.PI)) * dot.spokeCount + dot.spokeCount
            ) % dot.spokeCount
          return dot.spokes[i].getCompoundPos()
        })

      if (!otherPositions.length) return spoke.setLength(spoke.length + 2)

      const otherDistances = otherPositions.map((pos) =>
        pos.minusNew(spokePos).magnitude()
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

      if (spoke.length + this.animation.margin < distFromCenter) {
        return spoke.setLength(spoke.length + 1)
      }
    })
  }

  move = () => {
    this.spokes.forEach((spoke) =>
      spoke.setLength(spoke.length * 0.95 + this.startSize * 0.025)
    )

    this.animation.repulsors.forEach((repulsor) => {
      const direction = this.pos.minusNew(repulsor.pos)
      const strength =
        map(direction.magnitude(), 400, 0, 0, 3, true) * repulsor.strength

      this.pos.plusEq(direction.normalise().multiplyEq(strength))
    })
  }
}

export default AnimationDot
