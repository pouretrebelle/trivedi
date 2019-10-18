import AnimationSpoke from './AnimationSpoke'
import bezierCurveThrough from './vendor/canvas-bezier-multipoint'
import Vector2, { map } from './utils'

class AnimationDot {
  size = undefined
  startSize = undefined
  spokeCount = undefined
  initialSpokeAngle = undefined
  spokes = []

  constructor(animation, index) {
    this.animation = animation
    this.index = index
    this.pos = new Vector2(0, 0)
    this.maxSize = 100 + Math.random() * (animation.maxSize - 100)
    this.spokeDensity = map(Math.random(), 0, 1, 0.2, 0.4)
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
      this.spokeCount = Math.floor(2 + size * this.spokeDensity)

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

  draw = (color = this.animation.color) => {
    const { size, spokes, pos, animation } = this
    const { c, dotScale } = animation
    const s = (v) => dotScale * v

    c.save()
    c.translate(pos.x, pos.y)
    c.fillStyle = color
    c.strokeStyle = color

    // spokes
    c.beginPath()
    spokes.forEach((spoke) => {
      c.moveTo(0, 0)
      c.lineTo(s(spoke.pos.x), s(spoke.pos.y))
    })
    c.stroke()

    // todo: fix start/end meeting point
    c.beginPath()
    bezierCurveThrough(
      c,
      spokes
        .map((spoke) => [s(spoke.pos.x), s(spoke.pos.y)])
        .concat([[s(spokes[0].pos.x), s(spokes[0].pos.y)]])
    )
    c.stroke()

    const nucleusSize = Math.pow(size, 0.75) + 4
    c.beginPath()
    c.arc(0, 0, s(nucleusSize / 2), 0, Math.PI * 2, true)
    c.fill()

    c.restore()
  }

  getNearestSpokeToPoint = (pos) => {
    const vector = pos.minusNew(this.pos)
    const angle = vector.angle() - this.initialSpokeAngle
    const i =
      Math.round((angle / (2 * Math.PI)) * this.spokeCount + this.spokeCount) %
      this.spokeCount
    return this.spokes[i]
  }

  grow = (growth) => {
    if (growth < 0.1) return

    const dotsToCheck = this.animation.dots.filter((dot) => dot !== this)
    const spokesToMove = this.spokes

    spokesToMove.forEach((spoke) => {
      const spokePos = spoke.getCompoundPos()

      if (!spoke.canGrow()) return

      const otherPositions = dotsToCheck
        .filter(
          (dot) => spokePos.minusNew(dot.pos).magnitude() < dot.size / 2 + 20
        )
        .map((dot) => dot.getNearestSpokeToPoint(spokePos).getCompoundPos())

      if (!otherPositions.length)
        return spoke.setLength(spoke.length + 1 * growth)

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
        return spoke.setLength(spoke.length + 1 * growth)
      }
    })
  }

  update = (hasRepulsors) => {
    this.setSize()

    const { repulsors, colorScale } = this.animation
    const REPULSOR_DISTANCE = 400
    let weightedRepulsorDistance

    if (hasRepulsors) {
      weightedRepulsorDistance = repulsors
        .map((r) => r.pos.minusNew(this.pos).magnitude() / r.strength)
        .reduce((prev, cur) => Math.min(prev, cur), Infinity)

      // normalise/retract shape
      const degreeToNormalise = map(
        weightedRepulsorDistance,
        REPULSOR_DISTANCE,
        0,
        0,
        0.05,
        true
      )
      this.spokes.forEach((spoke) =>
        spoke.setLength(
          spoke.length * (1 - degreeToNormalise) +
            this.startSize * 0.4 * degreeToNormalise
        )
      )

      // push dots away from repulsors
      this.animation.repulsors.forEach((repulsor) => {
        const dir = this.pos.minusNew(repulsor.pos)
        const strength =
          map(dir.magnitude(), REPULSOR_DISTANCE, 0, 0, 3, true) *
          repulsor.strength

        this.pos.plusEq(dir.normalise().multiplyEq(strength))
      })

      // push dots away from eachother
      this.animation.dots
        .filter((dot) => dot !== this)
        .forEach((dot) => {
          const vec = this.pos.minusNew(dot.pos)

          const distBetweenCentres = vec.magnitude()
          const spoke1Length = this.getNearestSpokeToPoint(dot.pos).length
          const spoke2Length = dot.getNearestSpokeToPoint(this.pos).length
          const spaceBetween =
            distBetweenCentres - (spoke1Length + spoke2Length)

          const vel = map(spaceBetween, 0, -5, 0, 2.5, true)
          this.pos.plusEq(vec.normalise().multiplyEq(vel))
        })
    }

    // grow shape
    this.grow(
      hasRepulsors ? map(weightedRepulsorDistance, 0, 1000, 0, 1, true) : 1
    )

    const fillStrength = hasRepulsors
      ? map(weightedRepulsorDistance, 300, 0, 0, 1, true)
      : 0
    this.draw(colorScale(1 - Math.pow(fillStrength, 5)))
  }
}

export default AnimationDot
