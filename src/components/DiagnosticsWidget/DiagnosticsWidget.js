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
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import { Auth, Database } from '../../firebase';
import styles from './style.js';

const STATICS = {
  ADD_PANEL_ID: 'diagnosticswidget-expansionpanel-addpanel'
}

class DiagnosticsWidget extends Component {
  constructor(props){
    super(props);
    this.state = {
      expanded: null, newDescription: '', newCid10: '',
      editingDescription: '', editingCid10: '', diagnosticsList: []
    }

    this.diagnosticsRef = null;

    this.handleExpansionChange = this.handleExpansionChange.bind(this);
    this.handleChangeState = this.handleChangeState.bind(this);
    this.handleAddNewDiagnostic = this.handleAddNewDiagnostic.bind(this);
    this.handleEditDiagnostics = this.handleEditDiagnostics.bind(this);
    this.handleRemoveDiagnostics = this.handleRemoveDiagnostics.bind(this);
  }

  componentDidUpdate(prevProps){
    if ( prevProps.diagnostics === this.props.diagnostics ) return;
    var diagnosticsList = Object.assign([], this.props.diagnostics);

    var justCreatedOne = null;
    if ( diagnosticsList.length - prevProps.diagnostics.length === 1 ) {
      for ( var i in diagnosticsList ){
        let index = prevProps.diagnostics.findIndex(element => element.id === diagnosticsList[i].id);
        if ( index === -1 ) {
          justCreatedOne = diagnosticsList.splice(i, 1)[0];
          break;
        }
      }
    }

    diagnosticsList.sort((former, latter) => {
      var descriptionA = former.value.description.toUpperCase(); // ignore upper and lowercase
      var descriptionB = latter.value.description.toUpperCase(); // ignore upper and lowercase
      if (descriptionA < descriptionB) return -1;
      else if (descriptionA > descriptionB) return 1;
      return 0;
    })

    if ( justCreatedOne ) diagnosticsList.unshift(justCreatedOne);

    this.setState({ diagnosticsList });
  }

  componentDidMount(){
    if ( !Auth.currentUser ) return;
    var userId = Auth.currentUser.uid;
    this.diagnosticsRef = Database.ref('/diagnosis').child(userId);
    var diagnosticsList = Object.assign([], this.props.diagnostics);
    diagnosticsList.sort((former, latter) => {
      var descriptionA = former.value.description.toUpperCase(); // ignore upper and lowercase
      var descriptionB = latter.value.description.toUpperCase(); // ignore upper and lowercase
      if (descriptionA < descriptionB) return -1;
      else if (descriptionA > descriptionB) return 1;
      return 0;
    })
    this.setState({ diagnosticsList });
  }

  handleChangeState = prop => event => { this.setState({ [prop]: event.target.value });};
  handleExpansionChange = panel => (event, expanded) => {
    if ( panel === STATICS.ADD_PANEL_ID ) { this.setState({ expanded: expanded ? panel : false, }); return; }
    
    var editingIndex = this.props.diagnostics.findIndex(element => element.id === panel);
    this.setState({
      expanded: expanded ? panel : false,
      editingDescription: this.props.diagnostics[editingIndex].value.description,
      editingCid10: this.props.diagnostics[editingIndex].value.cid10,
    });
  };
  
  handleEditDiagnostics = diagnosticsId => {
    this.diagnosticsRef.child(diagnosticsId).set({
      description: this.state.editingDescription,
      cid10: this.state.editingCid10,
      checked: false,
      timestamp: Date.now()
    });
  }

  handleRemoveDiagnostics = diagnosticsId => {
    this.diagnosticsRef.child(diagnosticsId).remove();
  }

  handleAddNewDiagnostic = () => {
    this.diagnosticsRef.push({
      description: this.state.newDescription,
      cid10: this.state.newCid10,
      checked: false,
      timestamp: Date.now()
    });
  }

  render() {
    const { classes, theme } = this.props;
    const { expanded, diagnosticsList } = this.state;

    const transitionDuration = {
      enter: theme.transitions.duration.enteringScreen,
      exit: theme.transitions.duration.leavingScreen,
    };

    return (
      <Grid className={classes.root}>
        <ExpansionPanel expanded={expanded === STATICS.ADD_PANEL_ID} className={classes.addNewDiagnostic} onChange={this.handleExpansionChange(STATICS.ADD_PANEL_ID)}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>Add New Diagnostic</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container spacing={16}>
              <Grid item xs={12} sm={6} md={5} lg={5} xl={5}>
                <Input placeholder="Description" className={classes.input} inputProps={{ 'aria-label': 'Description', }}
                  value={this.state.newDescription} onChange={this.handleChangeState('newDescription')} fullWidth/>
              </Grid>
              <Grid item xs={8} sm={3} md={5} lg={5} xl={5}>
                <Input placeholder="Cid" className={classes.input} inputProps={{ 'aria-label': 'Cid', }}
                  value={this.state.newCid10} onChange={this.handleChangeState('newCid10')} fullWidth/>
              </Grid>
              <Grid item xs={4} sm={3} md={2} lg={2} xl={2}>
                <Fab color="primary" aria-label="Add" className={classes.fab} size="small" onClick={this.handleAddNewDiagnostic}> <AddIcon /> </Fab>
              </Grid>
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        {
          diagnosticsList.map((eachOne, index) => (
            <ExpansionPanel key={index} expanded={expanded === eachOne.id} onChange={this.handleExpansionChange(eachOne.id)}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.heading}>{eachOne.value.description}</Typography>
                <Typography className={classes.secondaryHeading}>{eachOne.value.cid10}</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Grid container spacing={16}>
                  <Grid item xs={12} sm={6} md={7} lg={7} xl={7}>
                    <Input placeholder="Description" className={classes.input} inputProps={{ 'aria-label': 'Description', }}
                      value={this.state.editingDescription} onChange={this.handleChangeState('editingDescription')} fullWidth/>
                  </Grid>
                  <Grid item xs={8} sm={3} md={3} lg={3} xl={3}>
                    <Input placeholder="CID" className={classes.input} inputProps={{ 'aria-label': 'CID', }}
                      value={this.state.editingCid10} onChange={this.handleChangeState('editingCid10')} fullWidth/>
                  </Grid>
                  <Grid item xs={4} sm={3} md={2} lg={2} xl={2}>
                    <Zoom key={'ZoomEdit-' + index} in={expanded === eachOne.id} timeout={transitionDuration}
                      style={{ transitionDelay: `${expanded === eachOne.id ? transitionDuration.exit : 0}ms`, }} unmountOnExit>
                      <Fab size="small" className={classes.fabGreen} onClick={() => this.handleEditDiagnostics(eachOne.id)}> <EditIcon/> </Fab>
                    </Zoom>
                    <Zoom key={'ZoomDelete-' + index} in={expanded === eachOne.id} timeout={transitionDuration}
                      style={{ transitionDelay: `${expanded === eachOne.id ? transitionDuration.exit : 0}ms`, }} unmountOnExit>
                      <Fab size="small" className={classes.fabRed} onClick={() => this.handleRemoveDiagnostics(eachOne.id)}> <DeleteIcon /> </Fab>
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

DiagnosticsWidget.propTypes = {
  classes: PropTypes.object.isRequired,
  diagnostics: PropTypes.array,
  setter: PropTypes.object,
};

export default withStyles(styles, { withTheme: true })(DiagnosticsWidget);