import Vector2 from './utils'

class AnimationRepulsor {
  strength = 1

  constructor(animation, { pageX, pageY }) {
    this.animation = animation
    this.pos = new Vector2(
      pageX - animation.width / 2,
      pageY - animation.height / 2
    )
  }

  update = () => {
    this.strength *= 0.95
    if (this.strength < 0.02) return this.animation.removeRepulsor(this)

    this.draw()
  }

  draw = () => {
    if (this.strength < 0.2) return

    const { c, colorScale } = this.animation
    const colorScaleVal = Math.pow(((this.strength - 0.2) * 1) / 0.8, 2) * 2
    const size = 10 + 1000 * Math.pow(1 / 0.8 - this.strength / 0.8, 2)

    c.fillStyle = colorScale(colorScaleVal)
    c.beginPath()
    c.arc(this.pos.x, this.pos.y, size / 2, 0, Math.PI * 2, true)
    c.fill()
  }
}

export default AnimationRepulsor
