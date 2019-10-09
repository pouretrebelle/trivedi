'use strict'

import Animation from './Animation'
const pixelRatio = window.devicePixelRatio || 1

const width = window ? pixelRatio * window.innerWidth : 1000
const height = window ? pixelRatio * window.innerHeight : 1000

let canvas = document.createElement('canvas')
document.body.appendChild(canvas)

new Animation(canvas)
