import { randomInteger } from './utils'
import AnimationDot from './AnimationDot'

class Animation {
  canvas = undefined
  c = undefined
  width = undefined
  height = undefined
  pixelRatio = undefined

  frames = 0
  count = 50
  dots = []

  minSize = 20
  maxSize = 300
  margin = 5
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
    for (var i = 0; i < this.count; i++) {
      this.dots.push(new AnimationDot(this, i))
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

    this.dots.forEach((dot) => {
      dot.draw()
      dot.update()
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
