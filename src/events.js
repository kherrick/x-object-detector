export const X_OBJECT_DETECTOR_IMAGE_DRAG_ENTER = 'x-object-detector-image-drag-enter'
export const X_OBJECT_DETECTOR_IMAGE_DRAG_LEAVE = 'x-object-detector-image-drag-leave'
export const X_OBJECT_DETECTOR_IMAGE_DRAG_OVER = 'x-object-detector-image-drag-over'
export const X_OBJECT_DETECTOR_IMAGE_DROP = 'x-object-detector-image-drop'
export const X_OBJECT_DETECTOR_IMAGE_LOADING = 'x-object-detector-image-loading'
export const X_OBJECT_DETECTOR_IMAGE_LOADING_FAILURE = 'x-object-detector-image-loading-failure'
export const X_OBJECT_DETECTOR_IMAGE_LOADED = 'x-object-detector-image-loaded'
export const X_OBJECT_DETECTOR_VIDEO_LOADING = 'x-object-detector-video-loading'
export const X_OBJECT_DETECTOR_VIDEO_LOADED = 'x-object-detector-video-loaded'
export const X_OBJECT_DETECTOR_VIDEO_LOADING_FAILURE = 'x-object-detector-video-loading-failure'
export const X_OBJECT_DETECTOR_OBJECT_DETECTED = 'x-object-detector-object-detected'
export const X_OBJECT_DETECTOR_NO_OBJECT_DETECTED = 'x-object-detector-no-object-detected'
export const X_OBJECT_DETECTOR_READY_TO_PREDICT = 'x-object-detector-ready-to-predict'

export const XObjectDetectorImageDragEnter = val =>
  new CustomEvent(X_OBJECT_DETECTOR_IMAGE_DRAG_ENTER, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XObjectDetectorImageDragLeave = val =>
  new CustomEvent(X_OBJECT_DETECTOR_IMAGE_DRAG_LEAVE, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XObjectDetectorImageDragOver = val =>
  new CustomEvent(X_OBJECT_DETECTOR_IMAGE_DRAG_OVER, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XObjectDetectorImageDrop = val =>
  new CustomEvent(X_OBJECT_DETECTOR_IMAGE_DROP, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XObjectDetectorImageLoading = val =>
  new CustomEvent(X_OBJECT_DETECTOR_IMAGE_LOADING, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XObjectDetectorImageLoadingFailure = val =>
  new CustomEvent(X_OBJECT_DETECTOR_IMAGE_LOADING_FAILURE, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XObjectDetectorImageLoaded = val =>
  new CustomEvent(X_OBJECT_DETECTOR_IMAGE_LOADED, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XObjectDetectorVideoLoading = val =>
  new CustomEvent(X_OBJECT_DETECTOR_VIDEO_LOADING, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XObjectDetectorVideoLoaded = val =>
  new CustomEvent(X_OBJECT_DETECTOR_VIDEO_LOADED, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XObjectDetectorVideoLoadingFailure = val =>
  new CustomEvent(X_OBJECT_DETECTOR_VIDEO_LOADING_FAILURE, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XObjectDetectorObjectDetected = val =>
  new CustomEvent(X_OBJECT_DETECTOR_OBJECT_DETECTED, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XObjectDetectorNoObjectDetected = val =>
  new CustomEvent(X_OBJECT_DETECTOR_NO_OBJECT_DETECTED, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XObjectDetectorReadyToPredict = val =>
  new CustomEvent(X_OBJECT_DETECTOR_READY_TO_PREDICT, {
    bubbles: true,
    composed: true,
    detail: val
  })
