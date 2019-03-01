import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import {  CardContent, Card,  CardHeader,  CardActions,  Button,
          TextField, InputAdornment, FormControl, Input,
          InputLabel, IconButton, Typography,
          Avatar, Grid, Fab, Snackbar, Fade
} from '@material-ui/core';


import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import * as EmailValidator from 'email-validator';
import styles from './style';
import { Auth, googleAuthProvider } from '../../firebase';
import GoogleImage from '../../assets/images/google-logo.png'
import DoctorCasesLogo from '../../assets/images/logo.png'

// const FAKE_USERAGENT_CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36";

class SignIn extends Component {
  constructor(props){
    super(props);
    this.state = {
      invalidEmail: false,
      email: '',
      password: '',
      gender: '',
      showPassword: false,
      redirectTo: '',
      authenticated: false,
      bSnackBarOpen: false,
      strSnackBarText: ''
    };
    this.firebaseAuthListener = null;

    this.handleChange = this.handleChange.bind(this);
    this.handleClickShowPassword = this.handleClickShowPassword.bind(this);
    this.handleSignUp = this.handleSignUp.bind(this);
    this.handleSignIn = this.handleSignIn.bind(this);
    this.handleSignInWithGoogle = this.handleSignInWithGoogle.bind(this);
    this.handlePressEnter = this.handlePressEnter.bind(this);
    this.handleShowLoginFailureSnackBar = this.handleShowLoginFailureSnackBar.bind(this);
    this.handleCloseSnackBar = this.handleCloseSnackBar.bind(this);
    this.handleForgotPassword = this.handleForgotPassword.bind(this);
  }

  componentDidMount() {
    // if ( !this.state.authenticated && !Auth.currentUser ) return;
    this.firebaseAuthListener = Auth.onAuthStateChanged((currentUser) => {
      if ( currentUser /* && this.state.authenticated*/ ) this.setState({ redirectTo: '/doctor' });
    })
  }

  componentWillUnmount(){
    this.firebaseAuthListener && this.firebaseAuthListener();
  }

  handleClickShowPassword = () => { this.setState(state => ({ showPassword: !state.showPassword })); };
  handleChange = prop => event => {
    var currentValue = event.target.value;
    if ( prop === 'email') {
      var validated = EmailValidator.validate(currentValue);
      this.setState({ [prop]: currentValue }, () => {
        this.setState({ invalidEmail: validated });
      });
    } else {
      this.setState({ [prop]: event.target.value });
    }
  };

  handlePressEnter = (event) => {
    if ( event.which === 13 ) {
      this.handleSignIn();
    }
  }

  handleSignUp = () => { this.setState({ redirectTo: '/signup' }); };

  handleSignIn = () => {
    if ( !this.state.password || !this.state.email ){
      this.handleShowLoginFailureSnackBar();
      return;
    } 
    Auth.signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => {})
      .catch(error => {
        this.handleShowLoginFailureSnackBar(error.message);
      });
  }

  handleShowLoginFailureSnackBar = (errMsg = 'Login Failure') => {
    this.setState({
      bSnackBarOpen: true,
      strSnackBarText: errMsg
    })
  }

  handleCloseSnackBar = () => {
    this.setState({ bSnackBarOpen: false, strSnackBarText: '' })
  }

  handleSignInWithGoogle = () => {
    // Object.defineProperty(navigator, 'userAgent', { get: function () { return FAKE_USERAGENT_CHROME; } });    
    Auth.signInWithPopup(googleAuthProvider).then( res => {
      // Auth.currentUser.googleLogin = true;
    }).catch(err => console.log(err));
  }

  handleForgotPassword = () => {
    this.setState({ redirectTo: '/forgotpassword' }); 
  }

  render() {
    const { classes } = this.props;

    if (this.state.redirectTo) return <Redirect to={this.state.redirectTo}/>;

    return (
      <Card className={classes.signInCard} >
        <Avatar alt="DoctorCases" src={DoctorCasesLogo} className={classes.bigAvatar} />
        <CardHeader className={classes.signInCardHeader} title="Sign In"/>
        <CardActions>
          <Grid container>
            <Grid container justify="center">
              <Fab variant="extended" aria-label="Login With Google" className={classes.fab} onClick={this.handleSignInWithGoogle}>
                <Avatar alt="Google Login" src={GoogleImage} className={classes.googleIcon}></Avatar>
                <Typography> Log in with Google </Typography>
              </Fab>
            </Grid>    
          </Grid>
        </CardActions>
        <CardContent style={{paddingTop: 0}}>
          <TextField fullWidth id="standard-email" label="Email" error={!this.state.invalidEmail}
            type="email" value={this.state.email} 
            onChange={this.handleChange('email')}/>
          <FormControl fullWidth className={classes.signInFormControl}>
            <InputLabel htmlFor="adornment-password">Password</InputLabel>
            <Input
              id="adornment-password"
              type={this.state.showPassword ? 'text' : 'password'}
              value={this.state.password}
              onChange={this.handleChange('password')}
              onKeyUp={(event) => this.handlePressEnter(event)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Toggle password visibility"
                    onClick={this.handleClickShowPassword}>
                    {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <Grid container>
            <Grid item xs={12} sm={5} md={5} lg={5} xl={5}>
              <Button variant="text" color="primary" size="large" style={{padding: 5}} onClick={this.handleForgotPassword}> Forgot Password? </Button>
            </Grid>
            <Grid item xs={12} sm={7} md={7} lg={7} xl={7}>
              <Button variant="contained" color="primary" style={{float: 'right'}} size="small" onClick={this.handleSignIn}> Sign In </Button>
              <Button variant="contained" color="secondary" style={{marginRight: 20, float: 'right'}} size="small" onClick={this.handleSignUp}> Sign Up </Button>
            </Grid>
            <Grid className={classes.spaceBox}></Grid>
          </Grid>
        </CardContent>
        
        <Snackbar
          open={this.state.bSnackBarOpen}
          onClose={this.handleCloseSnackBar}
          TransitionComponent={Fade}
          ContentProps={{ 'aria-describedby': 'error-login', }}
          message={<span id="error-login">{this.state.strSnackBarText}</span>}
        />
      </Card>
    );
  }
}

SignIn.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(SignIn);
