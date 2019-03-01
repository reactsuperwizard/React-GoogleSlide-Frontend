import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import { Redirect } from 'react-router-dom';
import styles from './style.js';

class HomePage extends Component {
  constructor(props){
    super(props);
    this.state = {
      auth: true,
      anchorEl: null,
      nextPage: '',

    }
    this.handleChange = this.handleChange.bind(this);
    this.handleMenu = this.handleMenu.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleAnotherPage = this.handleAnotherPage.bind(this);
  }
  handleAnotherPage = prop => event => {
    this.handleClose();
    this.setState({ nextPage: prop });
  }
  handleChange = event => { this.setState({ auth: event.target.checked }); };
  handleMenu = event => { this.setState({ anchorEl: event.currentTarget }); };
  handleClose = () => { this.setState({ anchorEl: null }); };

  render() {
    const { classes } = this.props;
    const { auth, anchorEl } = this.state;
    const open = Boolean(anchorEl);
    if (this.state.nextPage) return <Redirect to={this.state.nextPage}/>;

    return (
      <div className={classes.root}>
        <FormGroup>
          <FormControlLabel
            control={ <Switch checked={auth} onChange={this.handleChange} aria-label="LoginSwitch" /> }
            label={auth ? 'Signed Out' : 'Signed In'} />
        </FormGroup>
        <AppBar position="static">
          <Toolbar>
            <IconButton className={classes.menuButton} color="inherit" aria-label="Menu"> <MenuIcon /> </IconButton>
            <Typography variant="h6" color="inherit" className={classes.grow}> Doctor Cases </Typography>

            <div className={classes.search}>
              <div className={classes.searchIcon}> <SearchIcon /> </div>
              <InputBase placeholder="Search…" classes={{ root: classes.inputRoot, input: classes.inputInput }} />
            </div>

            {auth && (
              <div>
                <IconButton aria-owns={open ? 'menu-appbar' : undefined} aria-haspopup="true" onClick={this.handleMenu} color="inherit">
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right', }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right', }}
                  open={open}
                  onClose={this.handleClose}>
                  <MenuItem onClick={this.handleAnotherPage('/signin')}>Sign In</MenuItem>
                  <MenuItem onClick={this.handleAnotherPage('/signup')}>Sign Up</MenuItem>
                  <MenuItem onClick={this.handleAnotherPage('/doctor')}>Main Page</MenuItem>
                </Menu>
              </div>
            )}
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

HomePage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(HomePage);