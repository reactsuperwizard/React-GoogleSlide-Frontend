import React, { Component } from 'react'
// import PropTypes from 'prop-types';
import loadImage from 'blueimp-load-image'

const EXIF_IMG_URL = 'https://firebasestorage.googleapis.com/v0/b/doctocases.appspot.com/o/patient_profile_image%2F-LUmqW_IBM2D2hdx2pKk.jpeg?alt=media&token=88cc47fb-da2c-4ebe-a81f-068b027bb178';
// const UN_EXIF_IMG_URL = 'https://firebasestorage.googleapis.com/v0/b/doctocases.appspot.com/o/patient_profile_image%2F-LVHFvu03OSDIk3RxSQ4?alt=media&token=f90d5aed-5862-405d-9f52-a18c5cd9fac0';

class AutoRotateImage extends Component {
  loadImage() {
    var imageURL = EXIF_IMG_URL
    loadImage( imageURL, (img) => {
        if(img.type === "error") console.log("Error loading image " + imageURL);
        else this.refs.container.appendChild(img);
      }, {
            orientation: true,
      }
    ); 
  }
  
  componentDidMount() {
    this.loadImage();
  }

  componentDidUpdate() {
    this.refs.container.removeChild(this.refs.container.firstChild);
    this.loadImage();
  }
  
  render() {
    return (
      <div ref="container" />
    );
  }
}


export default AutoRotateImage;
