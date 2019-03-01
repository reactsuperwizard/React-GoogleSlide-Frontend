import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Grid,
        ExpansionPanel,
        ExpansionPanelDetails,
        ExpansionPanelSummary,
        Typography,
        Fab, 
        Input,
        Zoom
} from '@material-ui/core'
import ColorPicker from 'material-ui-color-picker'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import { Auth, Database } from '../../firebase';
import styles from './style.js';

const STATICS = {
  ADD_PANEL_ID: 'tagwidget-expansionpanel-addpanel'
}

class TagWidget extends Component {
  constructor(props){
    super(props);
    this.state = {
      expanded: null, newDescription: '', newColor: '#000000',
      editingDescription: '', editingColor: '#000000', tagsList: []
    }

    this.tagRef = null;

    this.handleExpansionChange = this.handleExpansionChange.bind(this);
    this.handleChangeState = this.handleChangeState.bind(this);
    this.handleNewColorSet = this.handleNewColorSet.bind(this);
    this.handleEditColorSet = this.handleEditColorSet.bind(this);
    this.handleAddNewTag = this.handleAddNewTag.bind(this);
    this.handleEditTag = this.handleEditTag.bind(this);
    this.handleRemoveTags = this.handleRemoveTags.bind(this);
  }

  componentDidUpdate(prevProps){
    if ( prevProps.tags === this.props.tags ) return;
    var tagsList = Object.assign([], this.props.tags);
    var justCreatedOne = null;
    if ( tagsList.length - prevProps.tags.length === 1 ) {
      for ( var i in tagsList ){
        let index = prevProps.tags.findIndex(element => element.id === tagsList[i].id);
        if ( index === -1 ) {
          justCreatedOne = tagsList.splice(i, 1)[0];
          break;
        }
      }
    }
    tagsList.sort((former, latter) => {
      var descriptionA = former.value.description.toUpperCase(); // ignore upper and lowercase
      var descriptionB = latter.value.description.toUpperCase(); // ignore upper and lowercase
      if (descriptionA < descriptionB) return -1;
      else if (descriptionA > descriptionB) return 1;
      return 0;
    })
    if ( justCreatedOne ) tagsList.unshift(justCreatedOne);
    this.setState({ tagsList });
  }

  componentDidMount(){
    if ( !Auth.currentUser ) return;
    
    var userId = Auth.currentUser.uid;
    this.tagRef = Database.ref('/tags').child(userId);
    var tagsList = Object.assign([], this.props.tags);
    tagsList.sort((former, latter) => {
      var descriptionA = former.value.description.toUpperCase(); // ignore upper and lowercase
      var descriptionB = latter.value.description.toUpperCase(); // ignore upper and lowercase
      if (descriptionA < descriptionB) return -1;
      else if (descriptionA > descriptionB) return 1;
      return 0;
    })
    this.setState({ tagsList });
  }

  handleNewColorSet = color => { this.setState({ newColor: color}); }
  handleEditColorSet = color => { this.setState({ editingColor: color}); }
  
  handleEditTag = tagId => {
    this.tagRef.child(tagId).set({
      description: this.state.editingDescription,
      color: this.state.editingColor,
      checked: false,
      timestamp: Date.now()
    });
  }
  handleRemoveTags = tagId => {
    this.tagRef.child(tagId).remove();
  }

  handleChangeState = prop => event => { this.setState({ [prop]: event.target.value });};
  handleExpansionChange = panel => (event, expanded) => {
    if ( panel === STATICS.ADD_PANEL_ID ) { this.setState({ expanded: expanded ? panel : false, }); return; }
    var editingIndex = this.props.tags.findIndex(element => element.id === panel);
    this.setState({
      expanded: expanded ? panel : false,
      editingDescription: this.props.tags[editingIndex].value.description,
      editingColor: this.props.tags[editingIndex].value.color,
    });
  };

  handleAddNewTag = () => {
    this.tagRef.push({
      description: this.state.newDescription,
      color: this.state.newColor,
      checked: false,
      timestamp: Date.now()
    });
  }

  render() {
    const { classes, theme } = this.props;
    const { expanded, tagsList } = this.state;
    
    const transitionDuration = {
      enter: theme.transitions.duration.enteringScreen,
      exit: theme.transitions.duration.leavingScreen,
    };

    return (
      <Grid className={classes.root}>
        <ExpansionPanel expanded={expanded === STATICS.ADD_PANEL_ID} className={classes.addNewTag} onChange={this.handleExpansionChange(STATICS.ADD_PANEL_ID)}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>Add New Tag</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container spacing={16}>
              <Grid item xs={12} sm={6} md={7} lg={7} xl={7}>
                <Input placeholder="Description" className={classes.input} inputProps={{ 'aria-label': 'Description', }}
                  value={this.state.newDescription} onChange={this.handleChangeState('newDescription')} fullWidth/>
              </Grid>
              <Grid item xs={8} sm={3} md={3} lg={3} xl={3}>
                <ColorPicker name='color' defaultValue='#000000' onChange={color => this.handleNewColorSet(color) } fullWidth/>
              </Grid>
              <Grid item xs={4} sm={3} md={2} lg={2} xl={2}>
                <Fab color="primary" aria-label="Add" className={classes.fab} size="small" onClick={this.handleAddNewTag}> <AddIcon /> </Fab>
              </Grid>
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        {
          tagsList.map((eachOne, index) => (
            <ExpansionPanel key={index} expanded={expanded === eachOne.id} onChange={this.handleExpansionChange(eachOne.id)}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.heading}>{eachOne.value.description}</Typography>
                <Typography className={classes.secondaryHeading}>{eachOne.value.color}</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Grid container spacing={16}>
                  <Grid item xs={12} sm={6} md={7} lg={7} xl={7}>
                    <Input placeholder="Description" className={classes.input} inputProps={{ 'aria-label': 'Description', }}
                      value={this.state.editingDescription} onChange={this.handleChangeState('editingDescription')} fullWidth/>
                  </Grid>
                  <Grid item xs={8} sm={3} md={3} lg={3} xl={3}>
                    <ColorPicker name='Color' defaultValue={eachOne.value.color} onChange={color => this.handleEditColorSet(color) } fullWidth/>
                  </Grid>
                  <Grid item xs={4} sm={3} md={2} lg={2} xl={2}>
                    <Zoom key={'ZoomEdit-' + index} in={expanded === eachOne.id} timeout={transitionDuration}
                      style={{ transitionDelay: `${expanded === eachOne.id ? transitionDuration.exit : 0}ms`, }} unmountOnExit>
                      <Fab size="small" className={classes.fabGreen} color='secondary' onClick={() => this.handleEditTag(eachOne.id)}> <EditIcon/> </Fab>
                    </Zoom>
                    <Zoom key={'ZoomDelete-' + index} in={expanded === eachOne.id} timeout={transitionDuration}
                      style={{ transitionDelay: `${expanded === eachOne.id ? transitionDuration.exit : 0}ms`, }} unmountOnExit>
                      <Fab size="small" className={classes.fabRed} onClick={() => this.handleRemoveTags(eachOne.id)}> <DeleteIcon /> </Fab>
                    </Zoom>
                  </Grid>
                </Grid>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          )
        )}
      </Grid>
    )
  }
}

TagWidget.propTypes = {
  classes: PropTypes.object.isRequired,
  tags: PropTypes.array,
  setter: PropTypes.object,
};

export default withStyles(styles, { withTheme: true })(TagWidget);