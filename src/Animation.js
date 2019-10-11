import { randomInteger } from './utils'
import AnimationDot from './AnimationDot'

class Animation {
  canvas = undefined
  c = undefined
  width = undefined
  height = undefined
  pixelRatio = undefined

  frames = 0
  predraw = 30
  dots = []

  minSize = 20
  maxSize = 350
  margin = 2
  nucleusMaxSize = 50

  constructor(canvas) {
    this.width = canvas.width
    this.height = canvas.height

    this.pixelRatio = window.devicePixelRatio || 1
    this.centralDistance *= this.pixelRatio
    this.avoidanceDistance *= this.pixelRatio

    this.canvas = canvas
    this.c = canvas.getContext('2d')

    this.updateDimensions(document.body)

    this.setup()

    window.requestAnimationFrame(this.loop)

    window.addEventListener('resize', this.onResize)
    document.body.addEventListener('click', this.reset)
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

    const count = this.width * this.height * 0.0001
    for (var i = 0; i < count; i++) {
      this.dots.push(new AnimationDot(this, i))
    }

    for (var i = 0; i < this.predraw; i++) {
      this.dots.forEach((dot) => {
        dot.update()
      })
    }
  }

  draw = () => {
    if (!this.c) return
    this.frames++

    this.c.clearRect(
      0,
      0,
      this.width * this.pixelRatio,
      this.height * this.pixelRatio
    )

    this.c.save()
    this.c.scale(this.pixelRatio, this.pixelRatio)
    this.c.translate(this.width / 2, this.height / 2)

    this.dots.forEach((dot) => {
      dot.draw()
      // dot.update()
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
