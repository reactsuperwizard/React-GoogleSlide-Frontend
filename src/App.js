import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { SnackbarProvider, withSnackbar } from 'notistack';
import './App.css';
import routes from './routes';

class AppContent extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            { routes.map(route => ( <Route key={route.name} exact={route.exact} path={route.path} component={route.component} name={route.name}/> )) }
            <Redirect from="/*" to="/signin"></Redirect>
          </Switch>
        </Router>
      </div>
    );
  }
}

AppContent.propTypes = {
  enqueueSnackbar: PropTypes.func.isRequired,
};

const MyApp = withSnackbar(AppContent);

function IntegrationNotistack() {
  return (
    <SnackbarProvider maxSnack={3} action={[ <IconButton key={Date.now()} aria-label="Close"> <CloseIcon fontSize="small" /> </IconButton> ]}>
      <MyApp />
    </SnackbarProvider>
  );
}

export default IntegrationNotistack;