import { LitElement, css, html, property } from 'lit-element'
import { defineCustomElement, logger } from './utilities'
import { render } from 'lit-html'
import * as events from './events'

// Import @tensorflow/tfjs or @tensorflow/tfjs-core
import * as tf from '@tensorflow/tfjs'
// import * as tf from '@tensorflow/tfjs-core'

// Adds the WASM backend to the global backend registry.
import '@tensorflow/tfjs-backend-wasm'

// Import model
import * as cocossd from '@tensorflow-models/coco-ssd'

import { setWasmPath } from '@tensorflow/tfjs-backend-wasm'

export * from './events'

export class XObjectDetector extends LitElement {
  @property({ type: String, reflect: true })
  imgUrl = IMG_URL
  @property({ type: String, reflect: true })
  strokeStyle = 'yellow'
  @property({ type: Number, reflect: true })
  lineWidth = 10
  @property({ type: Number, reflect: true })
  maxNumBoxes = 1
  @property({ type: String, reflect: true })
  base = 'lite_mobilenet_v2'
  @property({ type: String, reflect: false })
  wasmPath = WASM_PATH
  @property({ type: Boolean, reflect: false })
  isStreaming = false
  @property({ type: Boolean, reflect: false })
  isReadyToPredict = false
  @property({ type: Boolean, reflect: false })
  canPredictVideo = false
  @property({ type: Boolean, reflect: false })
  draw = false

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .canvas-flex-container {
        flex: auto;
      }

      #canvas-container {
        display: flex;
      }

      #loading-container {
        position: relative;
      }

      #loading {
        pointer-events: none;
        position: absolute;
        width: 100%;
      }

      canvas {
        background-color: var(--x-object-detector-canvas-background-color, transparent);
        width: var(--x-object-detector-canvas-width, 100%);
        height: var(--x-object-detector-canvas-height, auto);
      }

      video {
        width: var(--x-object-detector-video-width, 100%);
        height: var(--x-object-detector-video-height, auto);
      }
    `
  }

  _handlePrediction(ctx, image) {
    // Pass in an image or video to the model. The model returns an array of
    // bounding boxes, class, and score, one for each detected object.

    return this.model.detect(image, this.maxNumBoxes).then(predictions => {
      if (predictions.length > 0) {
        /*
        `predictions` is an array of objects describing each detected object, for example:
        [
          {
            bbox: [
              0: 97.1022516489029,
              1: 49.67673659324646,
              2: 61.446413397789,
              3: 103.5690850019455,
            ],
            class: 'person',
            score: 0.9899700880050659
          }
        ]
        */

        if (this.draw) {
          ctx.strokeStyle = this.strokeStyle
          ctx.lineWidth = this.lineWidth
        }

        for (let i = 0; i < predictions.length; i++) {
          const className = predictions[i].class
          const score = predictions[i].score
          const rectangle = predictions[i].bbox

          logger([ `Object detected: ${className} | score: ${score}`, rectangle ])
          this.dispatchEvent(events.XObjectDetectorObjectDetected(predictions[i]))

          if (this.draw) {
            // Render a rectangle over each detected object.
            ctx.strokeRect(...rectangle)
          }
        }

        return [ ctx, image ]
      }

      logger('No object detected')
      this.dispatchEvent(events.XObjectDetectorNoObjectDetected())

      return [ ctx, image ]
    })
  }

  _getImage(url) {
    return new Promise((res, rej) => {
      const image = new Image()
      image.crossOrigin = 'Anonymous'

      this.dispatchEvent(events.XObjectDetectorImageLoading())
      this._loadingElement.style.display = 'block'

      image.src = url

      image.addEventListener('error', e => {
        this.dispatchEvent(events.XObjectDetectorImageLoadingFailure(e))
      })

      image.addEventListener('load', e => {
        res(image)
      })
    })
  }

  _getUserMediaPromise() {
    return new Promise((res, rej) => {
      const canvas = this._canvasElement
      const video = this._videoElement

      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      })
        .then(stream => {
          video.srcObject = stream
          video.play()

          this.dispatchEvent(events.XObjectDetectorVideoLoaded())
        })
        .catch(error => {
          this.dispatchEvent(events.XObjectDetectorVideoLoadingFailure(error))

          process.env.NODE_ENV !== 'production' && console.error(error)
        })

      video.addEventListener('canplay', (event) => {
        if (!this.isStreaming) {
          res(true)
        }
      }, false)
    })
  }

  _handleDragEnter(event) {
    event.preventDefault()

    this.dispatchEvent(events.XObjectDetectorImageDragEnter(event))

    logger([ 'dragenter', event ])
  }

  _handleDragOver(event) {
    event.preventDefault()

    this.dispatchEvent(events.XObjectDetectorImageDragOver(event))

    logger([ 'dragover', event ])
  }

  _handleDragLeave(event) {
    event.preventDefault()

    this.dispatchEvent(events.XObjectDetectorImageDragLeave(event))

    logger([ 'dragleave', event ])
  }

  _handleImageDropPrediction(event) {
    event.preventDefault()

    this.dispatchEvent(events.XObjectDetectorImageDrop(event))

    logger([ 'drop', event ])

    for (let i = 0; i < event.dataTransfer.files.length; i++) {
      let droppedFile = event.dataTransfer.files[i]

      const filename = droppedFile.name

      const reader = new FileReader()

      reader.onload = event => {
        FS.writeFile('memfs', new Uint8Array(event.target.result), { encoding: 'binary' })

        const currentDocument = mupdf.openDocument('memfs')

        document.title = mupdf.documentTitle(currentDocument)

        const pageCount = mupdf.countPages(currentDocument)
        const fileAsPNG = mupdf.drawPageAsPNG(currentDocument, 1, 72)

        this._handleImageUrlPrediction(this._canvasElement, fileAsPNG)
      }

      reader.readAsArrayBuffer(droppedFile)

      // createImageBitmap(droppedFile).then(imageBitmap => {
      //   this._setupCanvas(this._canvasElement, { image: imageBitmap }).then(ctx => {
      //     const imageFromCanvas = new Image()

      //     imageFromCanvas.addEventListener('load', e => {
      //       this._handlePrediction(ctx, imageFromCanvas)
      //     })

      //     imageFromCanvas.src = this._canvasElement.toDataURL()
      //   })
      // }).catch(error => {
      //   this.dispatchEvent(events.XObjectDetectorImageLoadingFailure(error))

      //   process.env.NODE_ENV !== 'production' && console.error(error)
      // })
    }
  }

  _handleCanvasStylesForVideo(videoWidth) {
    this._canvasElement.style.width = '100%'
    this._canvasElement.style.height = 'auto'
  }

  _handleCanvasStylesForImages(imageWidth) {
    this._canvasElement.style.display = 'initial'

    if (imageWidth > document.documentElement.clientWidth) {
      this._canvasElement.style.width = '100%'
      this._canvasElement.style.height = 'auto'

      return
    }

    this._canvasElement.style.width = 'auto'
    this._canvasElement.style.height = 'auto'
  }

  _handleImageUrlPrediction(canvas, url) {
    return new Promise((res, rej) => {
      this._getImage(url).then(image => {
        this.dispatchEvent(events.XObjectDetectorImageLoaded())
        this._loadingElement.style.display = 'none'
        this._setupCanvas(canvas, { image }).then(ctx => {
          this._handlePrediction(ctx, image)
        })
      })
    })
  }

  _handleVideoPrediction(canvas, video) {
    this.canPredictVideo = true
    this._handleCanvasStylesForVideo()

    const taskResolution = period => {
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          this._setupCanvas(canvas, { video }).then(ctx => {
            this._handlePrediction(ctx, video).then(val => {
              if (!this.canPredictVideo) {
                resolve(interval)
              }
            })
          })
        }, period)
      })
    }

    return taskResolution(0).then(interval => {
      clearInterval(interval)
    })
  }

  _setupCanvas(canvas, { image, video }) {
    return new Promise((res, rej) => {
      const ctx = canvas.getContext('2d')

      let media = undefined
      let width = undefined
      let height = undefined

      if (video) {
        // video
        media = video
        width = video.videoWidth
        height = video.videoHeight
      } else {
        // image
        media = image
        width = image.width
        height = image.height

        this._handleCanvasStylesForImages(width)
      }

      // set the canvas to the media width and height
      canvas.width = width
      canvas.height = height

      ctx.drawImage(media, 0, 0, width, height)

      res(ctx)
    })
  }

  clearCanvas() {
    const canvas = this._canvasElement
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  fillCanvas(color = '#000000') {
    const canvas = this._canvasElement
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  startPredictions() {
    return new Promise((res, rej) => {
      this._handleVideoPrediction(this._canvasElement, this._videoElement)

      this._canvasElement.style.display = this.draw ? 'block' : 'none'
      this._videoElement.style.display = this.draw ? 'none' : 'block'
    }).then(() => {
      this.canPredictVideo
       ? res()
       : rej()
    })
  }

  stopPredictions() {
    return new Promise((res, rej) => {
      this.canPredictVideo = false
      this._canvasElement.style.display = this.draw ? 'none' : 'block'
      this._videoElement.style.display = this.draw ? 'block' : 'none'

      res()
    })
  }

  startVideo(event) {
    this.dispatchEvent(events.XObjectDetectorVideoLoading())
    this._loadingElement.style.display = 'block'

    if (event) {
      event.preventDefault()
    }

    if (this.isStreaming) {
      return new Promise((res, rej) => {
        res(true)
      })
    }

    return this._getUserMediaPromise().then(isStreaming => {
      this._loadingElement.style.display = 'none'
      this._canvasElement.style.display = isStreaming ? 'none' : 'block'
      this._videoElement.style.display = isStreaming ? 'block' : 'none'

      this.isStreaming = isStreaming

      return isStreaming
    })
  }

  stopVideo(event) {
    if (event) {
      event.preventDefault()
    }

    this._videoElement.style.display = 'none'

    if (!this.isStreaming) {
      return new Promise((res, rej) => {
        res(false)
      })
    }

    return new Promise((res, rej) => {
      const video = this._videoElement
      const stream = video.srcObject

      stream.getTracks().forEach(track => {
        track.stop()
      })

      this.isStreaming = false
      res(false)
    })
  }

  firstUpdated() {
<<<<<<< HEAD
=======
    const libmupdfScript = document.createElement('script')
    libmupdfScript.src = './libmupdf.js'

    document.body.appendChild(libmupdfScript)

>>>>>>> d18c290... initial commit
    if (!this.wasmPath) {
      return
    }

    this._canvasElement = this.shadowRoot.getElementById('canvas')
    this._loadingElement = this.shadowRoot.getElementById('loading')
    this._videoElement = this.shadowRoot.getElementById('video')

    setWasmPath(this.wasmPath)
    tf.setBackend('wasm').then(() => {
      return new Promise((res, rej) => {
        // Load the model.
        res(cocossd.load({
          base: this.base
        }))
      }).then(cocossd => {
        this.model = cocossd

        this.isReadyToPredict = true
        this.dispatchEvent(events.XObjectDetectorReadyToPredict(true))

        this._handleImageUrlPrediction(this._canvasElement, this.imgUrl)
      })
    })
  }

  updated(changedProperties) {
    changedProperties.forEach((oldVal, propName) => {
      if (this.isReadyToPredict && propName === 'imgUrl') {
        this._handleImageUrlPrediction(this._canvasElement, this.imgUrl)
      }
    })
  }

  render() {
    return this.wasmPath ? html`
      <div id="canvas-container"
        @drop="${this._handleImageDropPrediction}"
        @dragenter="${this._handleDragEnter}"
        @dragover="${this._handleDragOver}"
        @dragleave="${this._handleDragLeave}"
      >
        <div class="canvas-flex-container"></div>
        <div id="loading-container">
          <div id="loading"><slot></slot></div>
          <canvas id="canvas"></canvas>
          <video id="video"></video>
        </div>
        <div class="canvas-flex-container"></div>
      </div>
    ` : ''
  }
}

defineCustomElement('x-object-detector', XObjectDetector)
