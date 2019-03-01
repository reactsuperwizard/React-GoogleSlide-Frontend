const styles = theme => ({
  imgContainerFlipImage: {
    '-webkit-transform': 'rotateY(180deg)',
    'transform': 'rotateY(180deg)'
  },
  imgContainerRotate90Image: {
    transformOrigin: 'top left',
    WebKitTransformOrigin: 'top left',
    MsTransformOrigin: 'top left',
    transform: 'rotate(90deg) translateY(-100%)',
    WebKitTransform: 'rotate(90deg) translateY(-100%)',
    MsTransform: 'rotate(90deg) translateY(-100%)'
  },
  imgContainerRotate90FlipImage: {
    transformOrigin: 'top left',
    WebKitTransformOrigin: 'top left',
    MsTransformOrigin: 'top left',
    transform: 'rotateY(180deg) rotate(90deg)',
    WebKitTransform: 'rotateY(180deg) rotate(90deg)',
    MsTransform: 'rotateY(180deg) rotate(90deg)'
  },
  imgContainerRotate180Image: {
    transformOrigin: 'top left',
    WebKitTransformOrigin: 'top left',
    MsTransformOrigin: 'top left',
    transform: 'rotate(180deg) translate(-100%, -100%)',
    WebKitTransform: 'rotate(180deg) translate(-100%, -100%)',
    MsTransform: 'rotate(180deg) translateX(-100%, -100%)'
  },
  imgContainerRotate180ImageFlip: {
    transformOrigin: 'top left',
    WebKitTransformOrigin: 'top left',
    MsTransformOrigin: 'top left',
    transform: 'rotateY(180deg) rotate(180deg) translateY(-100%)',
    WebKitTransform: 'rotateY(180deg) rotate(180deg) translateY(-100%)',
    MsTransform: 'rotateY(180deg) rotate(180deg) translateY(-100%)'
  },
  imgContainerRotate270Image: {
    transformOrigin: 'top left',
    WebKitTransformOrigin: 'top left',
    MsTransformOrigin: 'top left',
    transform: 'rotate(270deg) translateX(-100%)',
    WebKitTransform: 'rotate(270deg) translateX(-100%)',
    MsTransform: 'rotate(270deg) translateX(-100%)'
  },
  imgContainerRotate270ImageFlip: {
    transformOrigin: 'top left',
    WebKitTransformOrigin: 'top left',
    MsTransformOrigin: 'top left',
    transform: 'rotateY(180deg) rotate(270deg) translateX(-100%) translateY(-100%)',
    WebKitTransform: 'rotateY(180deg) rotate(270deg) translateX(-100%) translateY(-100%)',
    MsTransform: 'rotateY(180deg) rotate(270deg) translateX(-100%) translateY(-100%)'
  },

  imgGrayScaled: {
    filter: 'grayscale(100%)',
    WebkitFilter: 'grayscale(100%)'
  }
});

// 'rotateY(180deg) rotate(90deg)'    90 rotate + flip

export default styles;