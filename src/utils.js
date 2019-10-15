export const randomInteger = (min, max) => {
  if (max === undefined) {
    max = min
    min = 0
  }
  return Math.floor(Math.random() * (max + 1 - min)) + min
}

export const map = (value, low1, high1, low2, high2, clamp) => {
  const val = low2 + ((high2 - low2) * (value - low1)) / (high1 - low1)
  return clamp ? Math.min(Math.max(val, low2), high2) : val
}

const Vector2Const = {
  TO_DEGREES: 180 / Math.PI,
  TO_RADIANS: Math.PI / 180,
}

class Vector2 {
  constructor(x, y) {
    this.x = x || 0
    this.y = y || 0
  }

  reset(x, y) {
    this.x = x
    this.y = y
    return this
  }

  toString(decPlaces) {
    decPlaces = decPlaces || 3
    const scalar = Math.pow(10, decPlaces)
    return `${Math.round(this.x * scalar) / scalar}, ${Math.round(
      this.y * scalar
    ) / scalar}]`
  }

  clone() {
    return new Vector2(this.x, this.y)
  }

  copyTo(v) {
    v.x = this.x
    v.y = this.y
  }

  copyFrom(v) {
    this.x = v.x
    this.y = v.y
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  magnitudeSquared() {
    return this.x * this.x + this.y * this.y
  }

  normalise() {
    const m = this.magnitude()
    this.x = this.x / m
    this.y = this.y / m
    return this
  }

  reverse() {
    this.x = -this.x
    this.y = -this.y
    return this
  }

  plusEq(v) {
    this.x += v.x
    this.y += v.y
    return this
  }

  plusNew(v) {
    return new Vector2(this.x + v.x, this.y + v.y)
  }

  minusEq(v) {
    this.x -= v.x
    this.y -= v.y
    return this
  }

  minusNew(v) {
    return new Vector2(this.x - v.x, this.y - v.y)
  }

  multiplyEq(scalar) {
    this.x *= scalar
    this.y *= scalar
    return this
  }

  multiplyNew(scalar) {
    const returnvec = this.clone()
    return returnvec.multiplyEq(scalar)
  }

  divideEq(scalar) {
    this.x /= scalar
    this.y /= scalar
    return this
  }

  divideNew(scalar) {
    const returnvec = this.clone()
    return returnvec.divideEq(scalar)
  }

  dot(v) {
    return this.x * v.x + this.y * v.y
  }

  angle(useDegrees) {
    return (
      Math.atan2(this.y, this.x) * (useDegrees ? Vector2Const.TO_DEGREES : 1)
    )
  }

  rotate(angle, useDegrees) {
    const cosRY = Math.cos(angle * (useDegrees ? Vector2Const.TO_RADIANS : 1))
    const sinRY = Math.sin(angle * (useDegrees ? Vector2Const.TO_RADIANS : 1))
    const temp = new Vector2()
    temp.copyFrom(this)
    this.x = temp.x * cosRY - temp.y * sinRY
    this.y = temp.x * sinRY + temp.y * cosRY
    return this
  }

  equals(v) {
    return this.x === v.x && this.y === v.y
  }

  isCloseTo(v, tolerance) {
    if (this.equals(v)) return true
    const temp = this.clone()
    temp.minusEq(v)
    return temp.magnitudeSquared() < tolerance * tolerance
  }

  rotateAroundPoint(point, angle, useDegrees) {
    const temp = this.clone()
    temp.minusEq(point)
    temp.rotate(angle, useDegrees)
    temp.plusEq(point)
    this.copyFrom(temp)
  }

  isMagLessThan(distance) {
    return this.magnitudeSquared() < distance * distance
  }

  isMagGreaterThan(distance) {
    return this.magnitudeSquared() > distance * distance
  }

  dist(v) {
    return this.minusNew(v).magnitude()
  }
}

export default Vector2
