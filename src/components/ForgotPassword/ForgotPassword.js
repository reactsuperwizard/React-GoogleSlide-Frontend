import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {  CardContent,
          Card, 
          CardHeader, 
          CardActions, 
          Button,
          TextField,
          Avatar
} from '@material-ui/core';
import * as EmailValidator from 'email-validator';
import { Redirect } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import DoctorCasesLogo from '../../assets/images/logo.png'
import { withSnackbar } from 'notistack';
import styles from './style';
import { Auth } from '../../firebase';

// const SGMAIL_API_KEY = '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';
// const SGMAIL_API_KEY = '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';


class ForgotPassword extends Component {
  constructor(props){
    super(props);
    this.state = {
      invalidEmail: false,
      email: '',
      redirectURL: null
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSendCodeToEmail = this.handleSendCodeToEmail.bind(this);
    this.handleToGoBack = this.handleToGoBack.bind(this);
  }

  componentDidMount(){
    // console.log(this.props);
  }

  handleChange = prop => event => {
    var validated = true;
    var currentValue = event.target.value;
    if ( prop === 'email') {
      validated = EmailValidator.validate(currentValue);
      this.setState({ [prop]: currentValue }, () => {
        this.setState({ invalidEmail: validated });
      });
    }
  };
  
  handleSendCodeToEmail = () => {
    var emailAddress = this.state.email;
    
    Auth.sendPasswordResetEmail(emailAddress).then(() => {
      this.props.enqueueSnackbar('Email has been sent successfully.', { variant: 'success' });
    }).catch(function(error) {
      this.props.enqueueSnackbar('Error while sending email. Try again...', { variant: 'error' });
    });
  }

  handleToGoBack = () => {
    this.setState({ redirectURL: '/signin'});
  }

  render() {
    const { classes, theme } = this.props;

    if (this.state.redirectURL) return <Redirect to={this.state.redirectURL}/>;

    return (
      <Card className={classes.ForgotPasswordCard} >
        <Avatar alt="DoctorCases" src={DoctorCasesLogo} className={classes.bigAvatar} />
        <CardHeader className={classes.ForgotPasswordCardheader} title="Did you forgot password?"/>
        <CardContent style={{paddingTop: theme.spacing.unit * 5}}>
          <TextField fullWidth id="standard-email" label="Email" error={!this.state.invalidEmail}
                      type="email" value={this.state.email} onChange={this.handleChange('email')}/>
        </CardContent>
        <CardActions style={{paddingTop: theme.spacing.unit * 10}}>
          <Button variant="contained" color="primary" size="large" onClick={this.handleToGoBack}> Back </Button>
          <div style={{flex: 'auto'}}></div>
          <Button disabled={!this.state.invalidEmail} variant="contained" color="secondary" size="large" onClick={this.handleSendCodeToEmail}> Send Email </Button>
        </CardActions>
      </Card>
    );
  }
}

ForgotPassword.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  enqueueSnackbar: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(withSnackbar(ForgotPassword));
