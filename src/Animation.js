import chroma from 'chroma-js'
import AnimationDot from './AnimationDot'
import AnimationRepulsor from './AnimationRepulsor'
import { map } from './utils'

class Animation {
  canvas = undefined
  c = undefined
  width = undefined
  height = undefined
  pixelRatio = undefined

  frames = 0
  dotScale = undefined
  predraw = 10
  dots = []
  repulsors = []

  color = '#002c00'
  colorScale = chroma.scale(['#ffffff', '#002c00'])
  minSize = 20
  maxSize = 350
  margin = 4
  nucleusMaxSize = 50

  constructor(canvas) {
    this.width = canvas.width
    this.height = canvas.height

    this.pixelRatio = window.devicePixelRatio || 1
    this.centralDistance *= this.pixelRatio
    this.avoidanceDistance *= this.pixelRatio

    this.canvas = canvas
    this.c = canvas.getContext('2d')
    this.c.lineWidth = 1

    this.updateDimensions(document.body)

    this.setup()

    window.requestAnimationFrame(this.loop)

    window.addEventListener('resize', this.onResize)
    document.body.addEventListener('click', this.triggerAnimation)
    document.body.addEventListener('touchstart', (e) =>
      this.triggerAnimation(e.touches[0])
    )
  }

  reset = () => {
    this.updateDimensions(document.body)
    this.setup()
  }

  onResize = () => {
    this.updateDimensions(document.body)
  }

  updateDimensions = (wrapperElement) => {
    if (!wrapperElement) return

    const boundingBox = wrapperElement.getBoundingClientRect()

    const width = boundingBox.width
    const height = boundingBox.height

    this.width = width
    this.height = height

    this.canvas.width = width * this.pixelRatio
    this.canvas.style.width = `${width}px`
    this.canvas.height = height * this.pixelRatio
    this.canvas.style.height = `${height}px`

    // redraw canvas
    this.draw()
  }

  setup = () => {
    this.dots = []
    this.repulsors = []
    this.frames = 0

    const count = this.width * this.height * 0.00005
    for (let i = 0; i < count; i++) {
      this.dots.push(new AnimationDot(this, i))
    }

    for (let i = 0; i < this.predraw; i++) {
      this.dots.forEach((dot) => {
        dot.update()
      })
    }
  }

  triggerAnimation = (e) => {
    this.repulsors.push(new AnimationRepulsor(this, e))
  }

  removeRepulsor = (repulsor) => {
    const rIndex = this.repulsors.findIndex((r) => r === repulsor)
    this.repulsors.splice(rIndex, 1)
  }

  draw = () => {
    if (!this.c) return
    this.frames++
    this.dotScale = Math.pow(
      map(this.frames, this.predraw, this.predraw + 20, 0.99, 1, true),
      10
    )

    this.c.clearRect(
      0,
      0,
      this.width * this.pixelRatio,
      this.height * this.pixelRatio
    )

    this.c.save()
    this.c.scale(this.pixelRatio, this.pixelRatio)
    this.c.translate(this.width / 2, this.height / 2)

    this.repulsors.forEach((r) => {
      r.update()
    })

    this.dots.forEach((dot) => {
      dot.update(this.repulsors.length)
    })

    this.c.restore()
  }

  loop = () => {
    this.draw()
    if (!this.canvas) return
    window.requestAnimationFrame(this.loop)
  }
}

export default Animation
