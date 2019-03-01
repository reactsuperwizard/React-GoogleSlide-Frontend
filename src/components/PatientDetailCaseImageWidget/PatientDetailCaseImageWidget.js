import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import MobileStepper from '@material-ui/core/MobileStepper';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import ZoomInIcon from '@material-ui/icons/ZoomIn';

export default class PatientDetailCaseImageWidget extends Component {
  constructor(props){
    super(props);
    this.state = { activeStep: 1 }
    
    this.naturalHeight = this.naturalWidth = this.canvasContainerHeight = this.canvasContainerWidth = 1
    this.bDrawAllImage = false;
    this.bFinishedSavingImage = false;

    this.canvasSourceEle = this.canvasEleVisible = this.imageEle = this.canvasShadowEle = null;
    this.coloredImageData = null;

    this.bCanvasDragging = this.bCanvasDown = this.bMouseIn = false;
    this.startPos = { X: 0, Y: 0 }; this.offsetPos = { X: 0, Y: 0 }; this.savedOffsetPos = { X: 0, Y: 0 };

    this.handleImageRect = this.handleImageRect.bind(this);
    this.handleRedrawCanvas = this.handleRedrawCanvas.bind(this);
    this.handleResizeCanvasContainer = this.handleResizeCanvasContainer.bind(this);
    this.handleSaveToSpecificURL = this.handleSaveToSpecificURL.bind(this);
    this.handleCopytoVisibleCanvas = this.handleCopytoVisibleCanvas.bind(this);
    this.handleZoomIn = this.handleZoomIn.bind(this);
    this.handleZoomOut = this.handleZoomOut.bind(this);
    this.canvasTouchStart = this.canvasTouchStart.bind(this);
    this.canvasTouchEnd = this.canvasTouchEnd.bind(this);
    this.canvasTouchMove = this.canvasTouchMove.bind(this);
    this.canvasTouchCancel = this.canvasTouchCancel.bind(this);
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
    // For PC
    document.getElementById('canvas-visible').addEventListener('mousemove', this.canvasMouseMove, false)
    document.getElementById('canvas-visible').addEventListener('mousedown', this.canvasMouseDown, false)
    document.getElementById('canvas-visible').addEventListener('mouseup', this.canvasMouseUp, false)
    document.getElementById('canvas-visible').addEventListener('mouseleave', this.canvasMouseLeave, false)
    // For Mobile
    document.getElementById('canvas-visible').addEventListener('touchstart', this.canvasTouchStart, { passive: false })
    document.getElementById('canvas-visible').addEventListener('touchend', this.canvasTouchCancel, { passive: false })
    document.getElementById('canvas-visible').addEventListener('touchmove', this.canvasTouchMove, { passive: false })
    document.getElementById('canvas-visible').addEventListener('touchcancel', this.canvasTouchCancel, { passive: false })
  }

  componentWillUnmount(){
    window.removeEventListener("resize", this.handleResizeCanvasContainer);
  }

  handleResizeCanvasContainer = () => {
    if (!this.canvasEleVisible) return;
    this.bDrawAllImage = false;
    var DEFAULT_WIDTH = this.canvasEleVisible.parentElement.offsetWidth, DEFAULT_HEIGHT = DEFAULT_WIDTH;
    this.canvasEleVisible.width = this.canvasContainerWidth = DEFAULT_WIDTH;
    this.canvasEleVisible.height = this.canvasContainerHeight = DEFAULT_HEIGHT;
    this.handleRedrawCanvas();
  }

  handleRedrawCanvas = () => {
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
    this.handleCopytoVisibleCanvas();
  }

  handleImageRect = async () => {
    this.bDrawAllImage = false;
    this.canvasEleVisible = document.getElementById('canvas-visible');
    this.canvasShadowEle = document.getElementById('canvas-shadow');

    var context = this.canvasEleVisible.getContext('2d');
    if ( !this.canvasEleVisible ) return;
    
    this.imageEle = new Image(this.canvasShadowEle);
    this.imageEle.crossOrigin = "Anonymous";
    
    // const CURRENT_WINDOW_RATIO = window.innerHeight / window.innerWidth;
    var DEFAULT_WIDTH = this.canvasEleVisible.parentElement.offsetWidth, DEFAULT_HEIGHT = DEFAULT_WIDTH;
    context.clearRect(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    context.font = '48px serif';
    context.textAlign = "center";
    context.strokeText('Loading ...', DEFAULT_WIDTH / 2, DEFAULT_HEIGHT / 2);

    this.imageEle.src = this.props.src;
    this.offsetPos = { X: 0, Y: 0 }
    this.savedOffsetPos = { X: 0, Y: 0 }
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

      this.canvasEleVisible.width = DEFAULT_WIDTH;
      this.canvasEleVisible.height = DEFAULT_HEIGHT;
      this.canvasContainerHeight = DEFAULT_HEIGHT;
      this.canvasContainerWidth = DEFAULT_WIDTH;
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
      if ( this.bFinishedSavingImage) return true;
      else setTimeout(() => waitingHere(), 500);
    }

    return waitingHere();
  }

  handleCopytoVisibleCanvas = () => {
    if ( !this.canvasEleVisible ) return;

    var visibleContext = this.canvasEleVisible.getContext('2d');
    visibleContext.clearRect(0, 0, this.canvasContainerWidth, this.canvasContainerHeight);
    var zoom = 1 + (this.state.activeStep - 1) / 3;
    
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

    visibleContext.drawImage(this.canvasShadowEle,
      0, 0,
      this.canvasShadowEle.width, this.canvasShadowEle.height,
      startX / zoom + this.savedOffsetPos.X + this.offsetPos.X, startY / zoom + this.savedOffsetPos.Y + this.offsetPos.Y,
      WIDTH*zoom, HEIGHT*zoom)
  }
  canvasTouchStart = (event) => {
    event.preventDefault();
    this.startPos = { X: event.touches[0].clientX, Y: event.touches[0].clientY }
    this.savedOffsetPos.X += this.offsetPos.X; this.savedOffsetPos.Y += this.offsetPos.Y
    this.offsetPos = { X: 0, Y: 0 }
    this.bCanvasDown = true;
    this.bMouseIn = true;
  }
  canvasTouchEnd = (event) => { event.preventDefault(); this.bCanvasDown = false; }
  canvasTouchCancel = (event) => { event.preventDefault(); this.bMouseIn = false; this.bCanvasDown = false; }
  canvasTouchMove = (event) => {
    event.preventDefault();
    if (!this.bCanvasDown) return;
    this.offsetPos.X = event.touches[0].clientX - this.startPos.X
    this.offsetPos.Y = event.touches[0].clientY - this.startPos.Y
    this.handleRedrawCanvas()
  }

  canvasMouseDown = (event) => {
    this.startPos = { X: event.clientX, Y: event.clientY }
    this.savedOffsetPos.X += this.offsetPos.X; this.savedOffsetPos.Y += this.offsetPos.Y
    this.offsetPos = { X: 0, Y: 0 }
    this.bCanvasDown = true;
    this.bMouseIn = true;
  }
  canvasMouseUp = () => { this.bCanvasDown = false; /*this.savedOffsetPos.X += this.offsetPos.X; this.savedOffsetPos.Y += this.offsetPos.Y;*/ }
  canvasMouseLeave = () => { this.bMouseIn = false; this.bCanvasDown = false; /*this.savedOffsetPos.X += this.offsetPos.X; this.savedOffsetPos.Y += this.offsetPos.Y;*/ }
  canvasMouseMove = (event) => {
    if (!this.bCanvasDown) return;
    this.offsetPos.X = event.clientX - this.startPos.X
    this.offsetPos.Y = event.clientY - this.startPos.Y
    this.handleRedrawCanvas()
  }

  handleZoomOut = () => {
    this.setState(state => ({ activeStep: state.activeStep - 1 }), this.handleCopytoVisibleCanvas);
  }
  handleZoomIn = () => {
    this.setState(state => ({ activeStep: state.activeStep + 1 }), this.handleCopytoVisibleCanvas);
  }
  render() {

    return (
      <div>
        <canvas id="canvas-visible" width="1" height="1" style={{ boxShadow: '1px 2px 3px gray'}}></canvas>
        <canvas id="canvas-shadow" width="1" height="1" style={{ display: 'none'}} ></canvas>
        <MobileStepper variant="progress" steps={11} position="static" activeStep={this.state.activeStep} style={{flexGrow: 1}}
          nextButton={
            <Button size="small" onClick={this.handleZoomIn} disabled={this.state.activeStep === 10}> Zoom In&nbsp; <ZoomInIcon /> </Button>
          }
          backButton={
            <Button size="small" onClick={this.handleZoomOut} disabled={this.state.activeStep === 1}> <ZoomOutIcon />&nbsp; Zoom Out </Button>
          }
        />
      </div>
      
  )}
}

PatientDetailCaseImageWidget.propTypes = {
  src: PropTypes.string,
  rotation: PropTypes.number,
  reversed: PropTypes.bool,
  grayscaled: PropTypes.bool,
  mediaType: PropTypes.string
};
