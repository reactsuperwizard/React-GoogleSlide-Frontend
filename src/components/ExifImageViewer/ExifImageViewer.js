import React, { Component } from 'react'
import PropTypes from 'prop-types';
import loadImage from 'blueimp-load-image'
import PersonIcon from '@material-ui/icons/Person';

import './style.css'

// const EXIF_IMG_URL = 'https://firebasestorage.googleapis.com/v0/b/doctocases.appspot.com/o/patient_profile_image%2F-LUmqW_IBM2D2hdx2pKk.jpeg?alt=media&token=88cc47fb-da2c-4ebe-a81f-068b027bb178';
// const UN_EXIF_IMG_URL = 'https://firebasestorage.googleapis.com/v0/b/doctocases.appspot.com/o/patient_profile_image%2F-LVHFvu03OSDIk3RxSQ4?alt=media&token=f90d5aed-5862-405d-9f52-a18c5cd9fac0';

class ExifImageViewer extends Component {
  loadImage() {
    let imageURL = this.props.src;
    loadImage( imageURL, (img) => {
        if(img.type === "error" && this.refs.container ){
          if ( this.refs.container.children.length > 1 ) this.refs.container.lastChild.remove();
          this.refs.container.firstChild.style.cssText = 'display: block';
        }
        else if ( this.refs.container ){
          if ( this.refs.container.children.length > 0 ) this.refs.container.firstChild.style.cssText = 'display: none';
          if ( this.props.mediaSize === 'sm'){
            img.style.cssText = 'width: 40px; height: 40px; object-fit: cover; border-radius: 20px';
          } else if ( this.props.mediaSize === 'lg'){
            img.style.cssText = 'width: 200px; height: 200px; object-fit: cover; border-radius: 100px';
          }
          if ( this.refs.container.children.length > 1 ) this.refs.container.lastChild.remove();
          this.refs.container.appendChild(img);
        }
      }, {
        orientation: true,
       }
    ); 
  }
  
  componentDidMount() {
    this.loadImage();
  }

  componentDidUpdate(prevProps){
    if ( prevProps.src !== this.props.src ) this.loadImage()
    // else if ( this.props.mediaSize === 'sm' && this.props.src ) this.loadImage()
  }
  
  render() {
    const { mediaSize } = this.props;
    return (
      <div ref="container" className="customAvatar" >
        <PersonIcon className={"customAvatar-" + mediaSize}/>
      </div>
    );
  }
}

ExifImageViewer.propTypes = {
    src: PropTypes.string.isRequired,
    mediaSize: PropTypes.string.isRequired,
};

export default ExifImageViewer;
