import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {  CardContent,
          Card,  CardHeader,  CardActions,  Button, TextField,
          InputAdornment, FormControl, Input, InputLabel, IconButton,
          Avatar, Slide, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import * as EmailValidator from 'email-validator';
import { Redirect } from 'react-router-dom';
import { Auth } from '../../firebase';
import { withStyles } from '@material-ui/core/styles';
import { withSnackbar } from 'notistack';
import DoctorCasesLogo from '../../assets/images/logo.png'
import styles from './style';



function Transition(props) { return <Slide direction="up" {...props} />; }

class SignUp extends Component {
  constructor(props){
    super(props);
    this.state = {
      invalidEmail: false,
      invalidPassword: false,
      invalidName: false,
      email: '',
      password: '',
      confirmPassword: '',
      gender: '',
      name: '',
      showPassword: false,
      redirectURL: null,
      showForgotPasswordDlg: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleClickShowPassword = this.handleClickShowPassword.bind(this);
    this.handleSignUp = this.handleSignUp.bind(this);
    this.handleToGoBack = this.handleToGoBack.bind(this);
    this.handleCloseForgotPasswordDlg = this.handleCloseForgotPasswordDlg.bind(this);
    this.handleConfirmForgotPassword = this.handleConfirmForgotPassword.bind(this);
  }

  componentDidMount(){
  }

  handleClickShowPassword = () => { this.setState(state => ({ showPassword: !state.showPassword })); };
  
  handleChange = prop => event => {
    var validated = true;
    var currentValue = event.target.value;
    if ( prop === 'email') {
      validated = EmailValidator.validate(currentValue);
      this.setState({ [prop]: currentValue }, () => {
        this.setState({ invalidEmail: validated });
      });
    }
    else if ( prop === "password" || prop === "confirmPassword" ){
      if ( !currentValue || !this.state.password || !this.state.confirmPassword ) validated = false;
      else if ( prop === "password" && currentValue !== this.state.confirmPassword ) validated = false;
      else if ( prop === "confirmPassword" && this.state.password !== currentValue ) validated = false;
      this.setState({ [prop]: currentValue }, () => {
        this.setState({ invalidPassword: validated });
      });
    }
    else if ( prop === 'name'){
      validated = !!currentValue;
      this.setState({ [prop]: currentValue }, () => {
        this.setState({ invalidName: validated });
      });
    }
  };
  
  handleSignUp = () => {
    Auth.createUserWithEmailAndPassword(this.state.email, this.state.password)
    .catch(error => {
      this.props.enqueueSnackbar(error.message, { variant: 'error' });
      if ( error.code === 'auth/email-already-in-use' ) this.setState({ showForgotPasswordDlg: true })
    })
    .then( res => { if ( res ) this.setState({ redirectURL: '/doctor'}) });
  }

  handleToGoBack = () => {
    this.setState({ redirectURL: '/signin'});
  }

  handleCloseForgotPasswordDlg = () => { this.setState({ showForgotPasswordDlg: false }) }
  handleConfirmForgotPassword = confirming => {
    if ( confirming ) this.setState({ redirectURL: '/forgotpassword'})
    else this.handleCloseForgotPasswordDlg();
  }

  render() {
    const { classes } = this.props;

    if (this.state.redirectURL) return <Redirect to={this.state.redirectURL}/>;

    return (
      <Card className={classes.signUnCard} >
        <Avatar alt="DoctorCases" src={DoctorCasesLogo} className={classes.bigAvatar} />
        <CardHeader className={classes.signUpCardheader} title="Sign Up"/>
        <CardContent>
          <TextField fullWidth id="standard-name" label="Name" error={!this.state.invalidName}
                    value={this.state.name} onChange={this.handleChange('name')}/>
          <TextField fullWidth id="standard-email" label="Email" error={!this.state.invalidEmail}
                      type="email" value={this.state.email} onChange={this.handleChange('email')}/>
          <FormControl fullWidth className={classes.formControl}>
            <InputLabel htmlFor="adornment-password">Password</InputLabel>
            <Input
              error={!this.state.invalidPassword}
              id="adornment-password"
              type={this.state.showPassword ? 'text' : 'password'}
              value={this.state.password}
              onChange={this.handleChange('password')}
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
          <FormControl fullWidth className={classes.formControl}>
            <InputLabel htmlFor="adornment-confirm-password">Confirm Password</InputLabel>
            <Input 
              error={!this.state.invalidPassword}
              id="adornment-confirm-password"
              type={this.state.showPassword ? 'text' : 'password'}
              value={this.state.confirmPassword}
              onChange={this.handleChange('confirmPassword')}
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
        </CardContent>
        <CardActions>
          <Button variant="contained" color="primary" onClick={this.handleToGoBack}> Back </Button>
          <div style={{flex: 'auto'}}></div>
          <Button disabled={!this.state.invalidEmail || !this.state.invalidName || !this.state.invalidPassword}
                  variant="contained" color="primary" onClick={this.handleSignUp}> Sign Up </Button>
        </CardActions>

        <Dialog open={this.state.showForgotPasswordDlg} TransitionComponent={Transition} keepMounted
          onClose={this.handleCloseForgotPasswordDlg} aria-labelledby="alert-dialog-slide-title" aria-describedby="alert-dialog-slide-description" >
          <DialogTitle id="alert-dialog-slide-title"> Sign Up Failed. </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              This Email address is already exist. Did you forget your password?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.handleConfirmForgotPassword(false)} color="primary"> No </Button>
            <Button onClick={() => this.handleConfirmForgotPassword(true)} color="primary"> Yes </Button>
          </DialogActions>
        </Dialog>

      </Card>
    );
  }
}

SignUp.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  enqueueSnackbar: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(withSnackbar(SignUp));
