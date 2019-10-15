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
    if (this.strength < 0.05) this.animation.removeRepulsor(this)
  }
}

export default AnimationRepulsor
