import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  DialogActions, DialogContent, DialogContentText, Button,
  Slide, Dialog, DialogTitle
} from '@material-ui/core';

function Transition(props) { return <Slide direction="up" {...props} />; }

export default class PatientDetailCaseImageWidgetForLaptop extends Component {
  constructor(props){
    super(props);
    this.state = { showConfirmingDlg: false }
    
    this.naturalHeight = this.naturalWidth = this.canvasContainerHeight = this.canvasContainerWidth = 1
    this.bDrawAllImage = false;
    this.bFinishedSavingImage = false;
    this.bCroppingMode = false; this.bMouseDown = false; this.clippingStartPos = { X: 0, Y: 0}; this.clippingEndPos = { X: 0, Y: 0}

    this.canvasEleVisible = this.canvasEleInvisible = this.imageEle = this.canvasShadowEle = null;
    this.coloredImageData = null;

    this.bCanvasDragging = this.bCanvasDown = this.bMouseIn = false;
    this.startPos = { X: 0, Y: 0 };

    this.handleImageRect = this.handleImageRect.bind(this);
    this.handleRedrawCanvas = this.handleRedrawCanvas.bind(this);
    this.handleResizeCanvasContainer = this.handleResizeCanvasContainer.bind(this);
    this.handleSaveToSpecificURL = this.handleSaveToSpecificURL.bind(this);
    this.handleCopytoVisibleCanvas = this.handleCopytoVisibleCanvas.bind(this);
    this.canvasMouseMove = this.canvasMouseMove.bind(this)
    this.canvasMouseLeave = this.canvasMouseLeave.bind(this);
    this.handleToggleCropMode = this.handleToggleCropMode.bind(this);
    this.canvasMouseDown = this.canvasMouseDown.bind(this)
    this.canvasMouseUp = this.canvasMouseUp.bind(this)
    this.handleCloseConfirmDlg = this.handleCloseConfirmDlg.bind(this)
    this.handleConfirmCropImage = this.handleConfirmCropImage.bind(this)
    this.handleCropOriginalImage = this.handleCropOriginalImage.bind(this)
    this.handleCloseDraggingErrorSnack = this.handleCloseDraggingErrorSnack.bind(this)
  }

  componentDidUpdate(prevProps){
    if ( prevProps.src !== this.props.src ) this.handleImageRect();
    else if ( prevProps.grayscaled !== this.props.grayscaled || prevProps.rotation !== this.props.rotation || prevProps.reversed !== this.props.reversed ){
      // Technically call this only redraw function
      // this.handleRedrawCanvas()

      // but Call this for Saving when not fully loaded...
      this.handleImageRect();
    }
  }

  componentDidMount() {
    this.handleImageRect();
    window.addEventListener('resize', this.handleResizeCanvasContainer)
    document.getElementById('canvas-invisible').addEventListener('mousedown', this.canvasMouseDown, false)
    document.getElementById('canvas-invisible').addEventListener('mouseup', this.canvasMouseUp, false)
    document.getElementById('canvas-invisible').addEventListener('mousemove', this.canvasMouseMove, false)
    document.getElementById('canvas-invisible').addEventListener('mouseleave', this.canvasMouseLeave, false)
  }

  componentWillUnmount(){
    window.removeEventListener("resize", this.handleResizeCanvasContainer);
  }

  handleResizeCanvasContainer = () => {
    if (!this.canvasEleInvisible) return;
    this.bDrawAllImage = false;
    var DEFAULT_WIDTH = this.canvasEleInvisible.parentElement.offsetWidth / 2, DEFAULT_HEIGHT = DEFAULT_WIDTH;
    DEFAULT_WIDTH = Math.min(600, DEFAULT_WIDTH)
    DEFAULT_HEIGHT = Math.min(600, DEFAULT_HEIGHT)
    this.canvasEleInvisible.width = this.canvasEleVisible.width = this.canvasContainerWidth = DEFAULT_WIDTH;
    this.canvasEleInvisible.height = this.canvasEleVisible.height = this.canvasContainerHeight = DEFAULT_HEIGHT;
    this.handleRedrawCanvas();
  }

  handleRedrawCanvas = (newWidth = null, newHeight = null, cropWidth = null, cropHeight = null) => {
    this.bDrawAllImage = false;
    
    if ( this.canvasShadowEle.width < 1 ) return;

    var context2 = this.canvasShadowEle.getContext('2d');
    var shadowCanvasWidth = this.canvasShadowEle.width, shadowCanvasHeight = this.canvasShadowEle.height

    context2.clearRect(0, 0, shadowCanvasWidth, shadowCanvasHeight);

    if ( this.props.reversed || this.props.rotation > 0){
      context2.save();
      context2.translate(shadowCanvasWidth / 2, shadowCanvasHeight / 2);
      if ( this.props.reversed ) context2.scale(-1, 1);
      context2.rotate(this.props.rotation * Math.PI / 180);
      context2.drawImage(this.imageEle, -this.naturalWidth/2, -this.naturalHeight / 2)
      context2.restore();
    } else{
      context2.drawImage(this.imageEle, 0, 0, shadowCanvasWidth, shadowCanvasHeight)
    }
    if ( newWidth && newHeight && cropWidth && cropHeight ){
      let bufImageData = context2.getImageData(cropWidth, cropHeight, newWidth, newHeight)
      this.canvasShadowEle.width =  newWidth
      this.canvasShadowEle.height = newHeight
      context2.putImageData(bufImageData, 0, 0, 0, 0, newWidth, newHeight)
    }
    this.coloredImageData = this.canvasShadowEle.toDataURL();
    
    if ( this.props.grayscaled ){
      var originalImageData = context2.getImageData(0, 0, shadowCanvasWidth, shadowCanvasHeight);
      var data = originalImageData.data;

      for(var i = 0; i < data.length; i += 4) {
        var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
        data[i] = brightness;
        data[i + 1] = brightness;
        data[i + 2] = brightness;
      }
      context2.putImageData(originalImageData, 0, 0);
    }
    this.bDrawAllImage = true;

    //-------------------------- Draw Static Image --------------
    var startX = 0, startY = 0, WIDTH = this.canvasContainerWidth, HEIGHT = this.canvasContainerHeight;
    var offsetHeight = this.canvasContainerHeight - this.canvasContainerWidth / this.naturalWidth * this.naturalHeight

    if ( offsetHeight > 0 ){
      startY = offsetHeight / 2;
      HEIGHT = this.canvasContainerHeight - offsetHeight;
    } else {
      var offsetWidth = this.canvasContainerWidth - this.canvasContainerHeight / this.naturalHeight * this.naturalWidth;
      startX = offsetWidth / 2;
      WIDTH = this.canvasContainerWidth - offsetWidth;
    }
    if ( this.props.rotation % 180 !== 0) {
      let buf = startX; startX = startY; startY = buf;
      buf = WIDTH; WIDTH = HEIGHT; HEIGHT = buf;
    }
    var invisibleContext = this.canvasEleInvisible.getContext('2d');
    invisibleContext.clearRect(0, 0, this.canvasContainerWidth, this.canvasContainerHeight);
    invisibleContext.drawImage(this.canvasShadowEle, 0, 0, this.canvasShadowEle.width, this.canvasShadowEle.height,
      startX, startY, WIDTH, HEIGHT)
    this.handleCopytoVisibleCanvas();
  }

  handleImageRect = async () => {
    this.bDrawAllImage = false;
    this.canvasEleVisible = document.getElementById('canvas-visible');
    this.canvasEleInvisible = document.getElementById('canvas-invisible');
    this.canvasShadowEle = document.getElementById('canvas-shadow');

    var context = this.canvasEleInvisible.getContext('2d');
    if ( !this.canvasEleInvisible ) return;
    
    this.imageEle = new Image(this.canvasShadowEle);
    this.imageEle.crossOrigin = "Anonymous";
    
    // const CURRENT_WINDOW_RATIO = window.innerHeight / window.innerWidth;
    var DEFAULT_WIDTH = this.canvasEleInvisible.parentElement.offsetWidth/2, DEFAULT_HEIGHT = DEFAULT_WIDTH;
    DEFAULT_WIDTH = Math.min(600, DEFAULT_WIDTH)
    DEFAULT_HEIGHT = Math.min(600, DEFAULT_HEIGHT)
    context.clearRect(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    context.font = '48px serif';
    context.textAlign = "center";
    context.strokeText('Loading ...', DEFAULT_WIDTH / 2, DEFAULT_HEIGHT / 2);

    this.imageEle.src = this.props.src;
    this.offsetPos = { X: 0, Y: 0 }
    this.savedOffsetPos = { X: 0, Y: 0 }
    this.handleToggleCropMode('init')
    this.setState({ activeStep: 1 })
    
    var eventHandler = (event) => {
      this.bDrawAllImage = false;
      context.clearRect(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
      context.font = '48px serif';
      context.textAlign = "center";
      context.strokeText('Loading ...', DEFAULT_WIDTH / 2, DEFAULT_HEIGHT / 2);

      var naturalWidth = event.target.naturalWidth, naturalHeight = event.target.naturalHeight;
      this.naturalHeight = naturalHeight;
      this.naturalWidth = naturalWidth;

      if ( this.props.rotation % 180 === 0 ){
        this.canvasShadowEle.width = naturalWidth;
        this.canvasShadowEle.height = naturalHeight;
      }else {
        this.canvasShadowEle.width = naturalHeight;
        this.canvasShadowEle.height = naturalWidth;
      }
      this.canvasEleInvisible.width = this.canvasEleVisible.width = this.canvasContainerWidth = DEFAULT_WIDTH;
      this.canvasEleInvisible.height = this.canvasEleVisible.height = this.canvasContainerHeight = DEFAULT_HEIGHT;
      this.startPos = { X: 0, Y: 0 };
      
      this.handleRedrawCanvas();
    }

    this.imageEle.removeEventListener('load', eventHandler);
    this.imageEle.addEventListener('load', eventHandler);
  }

  handleSaveToSpecificURL = async (storageRef, exFileName, newFileName, dbRef, dbSavingObject, setProgressFunction) => {
    if ( !this.bDrawAllImage ) return false;
    function dataURItoBlob(dataURI) {
      // convert base64/URLEncoded data component to raw binary data held in a string
      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
          byteString = atob(dataURI.split(',')[1]);
      else
          byteString = unescape(dataURI.split(',')[1]);
      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      // write the bytes of the string to a typed array
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ia], {type:mimeString});
    }
    // setProgressFunction
    var file = dataURItoBlob(this.coloredImageData)
    if ( exFileName ) storageRef.child(exFileName).delete();
    
    
    var uploadTask = storageRef.child(newFileName).put(file);
    uploadTask.on('state_changed', snapshot => {
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setProgressFunction(progress);
    }, error => {
      console.log(error);
      this.bFinishedSavingImage = true;
    }, () => {
      uploadTask.snapshot.ref.getDownloadURL().then(url => {
        dbSavingObject.thumburl = url;
        dbRef.set(dbSavingObject);
        this.bFinishedSavingImage = true;
      })
    });

    var waitingHere = () => {
      console.log('Saving now........')
      if ( this.bFinishedSavingImage) return true;
      else setTimeout(() => waitingHere(), 500);
    }

    return waitingHere();
  }

  handleToggleCropMode = (setting = 'undefined') => {
    if (setting === 'init') this.bCroppingMode = false
    else this.bCroppingMode = !this.bCroppingMode
    if ( !this.bCroppingMode ) this.handleCopytoVisibleCanvas(true)
    if (this.props.setCropState) this.props.setCropState(this.bCroppingMode)
  }

  handleCopytoVisibleCanvas = (redrawInvisiableCanvas = false) => {
    if ( !this.canvasEleVisible ) return;
    var visibleContext = this.canvasEleVisible.getContext('2d');
    var invisibleContext = this.canvasEleInvisible.getContext('2d');
    visibleContext.clearRect(0, 0, this.canvasContainerWidth, this.canvasContainerHeight);
    var zoom = 3;
    
    var startX = 0, startY = 0, WIDTH = this.canvasContainerWidth, HEIGHT = this.canvasContainerHeight;
    var offsetHeight = this.canvasContainerHeight - this.canvasContainerWidth / this.naturalWidth * this.naturalHeight
    let aspect = 1
    if ( offsetHeight > 0 ){
      startY = offsetHeight / 2;
      HEIGHT = this.canvasContainerHeight - offsetHeight;
      aspect = this.naturalHeight / HEIGHT
    } else {
      var offsetWidth = this.canvasContainerWidth - this.canvasContainerHeight / this.naturalHeight * this.naturalWidth;
      startX = offsetWidth / 2;
      WIDTH = this.canvasContainerWidth - offsetWidth;
      aspect = this.naturalWidth / WIDTH
    }
    if ( this.props.rotation % 180 !== 0) {
      let buf = startX; startX = startY; startY = buf;
      buf = WIDTH; WIDTH = HEIGHT; HEIGHT = buf;
    }

    if (redrawInvisiableCanvas){
      invisibleContext.clearRect(0, 0, this.canvasContainerWidth, this.canvasContainerHeight);
      invisibleContext.drawImage(this.canvasShadowEle, 0, 0, this.canvasShadowEle.width, this.canvasShadowEle.height, startX, startY, WIDTH, HEIGHT)
    } else if (!this.bCroppingMode) {
      visibleContext.drawImage(this.canvasShadowEle,
        (this.startPos.X - startX - this.canvasContainerWidth / 2 / zoom ) * aspect, (this.startPos.Y - startY - this.canvasContainerHeight / 2 / zoom ) * aspect,
        this.canvasContainerWidth/zoom*aspect, this.canvasContainerHeight/zoom*aspect,
        0, 0, this.canvasContainerWidth, this.canvasContainerHeight)
    } else {
      let startPos = {
        X: Math.min(this.clippingEndPos.X, this.clippingStartPos.X),
        Y: Math.min(this.clippingEndPos.Y, this.clippingStartPos.Y)
      }
      let endPos = {
        X: Math.max(this.clippingEndPos.X, this.clippingStartPos.X),
        Y: Math.max(this.clippingEndPos.Y, this.clippingStartPos.Y)
      }
      let offsetX = endPos.X - startPos.X, offsetY = endPos.Y - startPos.Y
      let zoomX = this.canvasContainerWidth / offsetX, zoomY = this.canvasContainerHeight / offsetY

      invisibleContext.clearRect(0, 0, this.canvasContainerWidth, this.canvasContainerHeight);
      invisibleContext.drawImage(this.canvasShadowEle, 0, 0, this.canvasShadowEle.width, this.canvasShadowEle.height, startX, startY, WIDTH, HEIGHT)
      invisibleContext.strokeStyle = 'green';
      invisibleContext.strokeRect(startPos.X, startPos.Y, offsetX, offsetY);

      let visibleOffsetX = 0, visibleOffsetY = 0
      if ( offsetX > offsetY ){
        visibleOffsetY = this.canvasContainerHeight - this.canvasContainerWidth / offsetX * offsetY
      } else {
        visibleOffsetX = this.canvasContainerWidth - this.canvasContainerHeight / offsetY * offsetX
      }

      visibleContext.drawImage(this.canvasShadowEle, (startPos.X - startX) * aspect, (startPos.Y - startY) * aspect,
        this.canvasContainerWidth/zoomX*aspect, this.canvasContainerHeight/zoomY*aspect,
        visibleOffsetX / 2, visibleOffsetY / 2, this.canvasContainerWidth - visibleOffsetX, this.canvasContainerHeight - visibleOffsetY)
    }
  }

  canvasMouseDown = (event) => {
    if ( !this.bCroppingMode ) return;
    this.bMouseDown = true
    this.clippingStartPos.X = event.clientX - event.target.offsetLeft
    this.clippingStartPos.Y = event.clientY - event.target.offsetTop
    this.clippingEndPos.X = this.clippingStartPos.X
    this.clippingEndPos.Y = this.clippingStartPos.Y
    this.handleCopytoVisibleCanvas()
  }

  canvasMouseUp = (event) => {
    if ( !this.bCroppingMode ) return;
    this.bMouseDown = false
    this.clippingEndPos.X = event.clientX - event.target.offsetLeft
    this.clippingEndPos.Y = event.clientY - event.target.offsetTop
    if ( this.clippingEndPos.X === this.clippingStartPos.X && this.clippingEndPos.Y === this.clippingStartPos.Y ) {
      this.props.popupSnackBar();
    } else{
      this.setState({ showConfirmingDlg: true })
      this.handleCopytoVisibleCanvas()
    }
  }

  handleCloseDraggingErrorSnack = () => {
    this.setState({ draggingErrorSnack: false })
  }

  canvasMouseMove = (event) => {
    if ( this.bCroppingMode && this.bMouseDown ){
      this.clippingEndPos.X = event.clientX - event.target.offsetLeft
      this.clippingEndPos.Y = event.clientY - event.target.offsetTop
      this.handleCopytoVisibleCanvas()
    }
    else if ( !this.bCroppingMode ){
      this.startPos.X = event.clientX - event.target.offsetLeft
      this.startPos.Y = event.clientY - event.target.offsetTop
      this.handleCopytoVisibleCanvas()
    }
  }

  canvasMouseLeave = event => {
    if ( !this.canvasEleVisible ) return;
    if (this.bCroppingMode) return;
    var visibleContext = this.canvasEleVisible.getContext('2d');
    visibleContext.clearRect(0, 0, this.canvasContainerWidth, this.canvasContainerHeight);
  }

  handleCloseConfirmDlg = () => {
    this.setState({ showConfirmingDlg: false})
  }

  handleCropOriginalImage = () => {
    var context2 = this.canvasShadowEle.getContext('2d');

    var startX = 0, startY = 0, WIDTH = this.canvasContainerWidth, HEIGHT = this.canvasContainerHeight;
    var offsetHeight = this.canvasContainerHeight - this.canvasContainerWidth / this.naturalWidth * this.naturalHeight
    let aspect = 1
    if ( offsetHeight > 0 ){
      startY = offsetHeight / 2;
      HEIGHT = this.canvasContainerHeight - offsetHeight;
      aspect = this.naturalHeight / HEIGHT
    } else {
      var offsetWidth = this.canvasContainerWidth - this.canvasContainerHeight / this.naturalHeight * this.naturalWidth;
      startX = offsetWidth / 2;
      WIDTH = this.canvasContainerWidth - offsetWidth;
      aspect = this.naturalWidth / WIDTH
    }
    if ( this.props.rotation % 180 !== 0) {
      let buf = startX; startX = startY; startY = buf;
      buf = WIDTH; WIDTH = HEIGHT; HEIGHT = buf;
    }

    let startPos = {
      X: Math.min(this.clippingEndPos.X, this.clippingStartPos.X),
      Y: Math.min(this.clippingEndPos.Y, this.clippingStartPos.Y)
    }
    let endPos = {
      X: Math.max(this.clippingEndPos.X, this.clippingStartPos.X),
      Y: Math.max(this.clippingEndPos.Y, this.clippingStartPos.Y)
    }
    let offsetX = endPos.X - startPos.X, offsetY = endPos.Y - startPos.Y
    // let zoomX = this.canvasContainerWidth / offsetX, zoomY = this.canvasContainerHeight / offsetY

    let bufImageData = context2.getImageData((startPos.X - startX) * aspect, (startPos.Y - startY) * aspect, offsetX*aspect, offsetY*aspect)
    // this.canvasShadowEle.width =  aspect * offsetX
    // this.canvasShadowEle.height = aspect * offsetY
    if ( this.props.rotation % 180 !== 0) {
      this.naturalWidth = aspect * offsetY
      this.naturalHeight = aspect * offsetX
    } else {
      this.naturalWidth = aspect * offsetX
      this.naturalHeight = aspect * offsetY
    }

    this.handleRedrawCanvas(aspect * offsetX, aspect * offsetY, (startPos.X - startX) * aspect, (startPos.Y - startY) * aspect)

    // context2.putImageData(bufImageData, 0, 0, 0, 0, aspect * offsetX, aspect * offsetY)
    // this.coloredImageData = this.canvasShadowEle.toDataURL();
  }

  handleConfirmCropImage = (confirming) => {
    if ( confirming ) {
      this.handleCropOriginalImage()
      this.handleCloseConfirmDlg()
      this.handleToggleCropMode()
      this.props.saveImage()
    } else {
      this.handleCloseConfirmDlg()
    }
  }

  render() {
    return (
      <div style={{display: 'flex', justifyContent: 'space-around'}}>
        <canvas id="canvas-invisible" width="1" height="1" style={{ maxWidth: 600, maxHeight: 600, boxShadow: '1px 2px 3px gray'}}></canvas>
        <canvas id="canvas-visible" width="1" height="1" style={{ maxWidth: 600, maxHeight: 600, boxShadow: '1px 2px 3px gray'}}></canvas>
        <canvas id="canvas-shadow" width="1" height="1" style={{display: 'none'}}></canvas>
        <Dialog open={this.state.showConfirmingDlg} TransitionComponent={Transition} keepMounted
          onClose={this.handleCloseConfirmDlg} aria-labelledby="alert-crop-image" aria-describedby="alert-crop-image-detail" >
          <DialogTitle id="alert-crop-image"> Really Wanna Crop ? </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-crop-image-detail">
              Click YES to save, NO to leave this one.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.handleConfirmCropImage(false)} color="primary"> NO </Button>
            <Button onClick={() => this.handleConfirmCropImage(true)} color="primary"> YES </Button>
          </DialogActions>
        </Dialog>
      </div>
  )}
}

PatientDetailCaseImageWidgetForLaptop.propTypes = {
  src: PropTypes.string.isRequired,
  rotation: PropTypes.number.isRequired,
  reversed: PropTypes.bool.isRequired,
  grayscaled: PropTypes.bool.isRequired,
  mediaType: PropTypes.string.isRequired,
  setCropState: PropTypes.func.isRequired,
  popupSnackBar: PropTypes.func.isRequired,
  saveImage: PropTypes.func.isRequired
};
