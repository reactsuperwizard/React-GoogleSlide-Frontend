import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Redirect } from 'react-router-dom';

import {
  Drawer, List, Menu, MenuItem, TableRow, TableCell, TableHead,
  CssBaseline, Table, Badge, FormControl, CircularProgress, 
  AppBar, Divider, IconButton, InputLabel, Select, 
  Toolbar, Button, Avatar, ListItem, Fab, ListItemIcon, ListItemText,
  Input, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Grid, Typography, TableBody
} from '@material-ui/core'

import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import FindInPageIcon from '@material-ui/icons/FindInPage';
import ContactMail from '@material-ui/icons/ContactMail';
import VerifiedUser from '@material-ui/icons/VerifiedUser';
import MoreIcon from '@material-ui/icons/MoreVert';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import MoodBad from '@material-ui/icons/MoodBad';
import PersonIcon from '@material-ui/icons/Person';
import HomeIcon from '@material-ui/icons/Home';
import DeleteIcon from '@material-ui/icons/Delete';

import DateFnsUtils from '@date-io/date-fns';
import { DatePicker, MuiPickersUtilsProvider  } from 'material-ui-pickers';
import { withStyles } from '@material-ui/core/styles';
import { UserAgent } from 'react-useragent';
import { withSnackbar } from 'notistack';

import { Auth, Database, Storage } from '../../firebase';
import styles from './style.js';

import PatientDetailWidget from '../PatientDetailWidget/PatientDetailWidget';
import PatientDetailMobileWidget from '../PatientDetailMobileWidget/PatientDetailMobileWidget';
import TagWidget from '../TagWidget/TagWidget';
import DiagnosticsWidget from '../DiagnosticsWidget/DiagnosticsWidget';
import ExifImageViewer from '../ExifImageViewer/ExifImageViewer'

import PatientAvatar from '../../assets/images/PatientAvatar.jpg';
import DoctorAvatar from '../../assets/images/DoctorAvatar.png';
import CONSTANTS from './constants';

import DiagnosticsBlueImg from '../../assets/images/Diagnostics.png'
import TagsBlueImg from '../../assets/images/Tags.png'
import DiagnosticsGrayImg from '../../assets/images/DiagnosticsGray.png'
import TagsGrayImg from '../../assets/images/TagsGray.png'
// import PresentationImg from '../../assets/images/google-presentation.png'

const arrWidgetList = [
  { label: 'Diagnostics', value: 'diagnosticsList', component: (content, setter) => <DiagnosticsWidget diagnostics={content} setter={setter}/>,
    icon: (classes) => <div> <img alt="diagnosticsImg" className={classes.sectionMobile} src={DiagnosticsGrayImg} style={{width: 24, height: 24, borderRadius: '50%'}}/> <img alt="diagnosticsImg" className={classes.sectionDesktop} src={DiagnosticsBlueImg} style={{width: 24, height: 24, borderRadius: '50%'}}/> </div> },
  { label: 'Tags', value: 'tagsList', component: (content, setter) => <TagWidget tags={content} setter={setter}/>,
    icon: (classes) => <div> <img alt="tagsImg" className={classes.sectionMobile} src={TagsGrayImg} style={{width: 24, height: 24, borderRadius: '50%'}}/> <img alt="tagsImg" className={classes.sectionDesktop} src={TagsBlueImg} style={{width: 24, height: 24, borderRadius: '50%'}}/> </div> },
  { label: 'Detail of Patient', value: 'patientDetail', component: (content, setter) => {
      return <UserAgent>
      {({ ua }) => { return ua.mobile ? <PatientDetailMobileWidget {...content} setter={setter}/> : <PatientDetailWidget {...content} setter={setter}/>; }}
    </UserAgent> }, icon: <MoodBad /> },
  { label: 'Empty Widget', value: 'empty', component: (content, setter) => null, icon: <MoodBad /> },
  // { label: 'MobileMenu', value: 'MobileMenu', component: null, icon: <AccountCircle /> },
]

const arrAdvancedFilteringItem = [
  { value: 'searchBoxtextForPatients', label: 'Name'},
  { value: 'diagnosticsArray', label: 'Diagnostics'},
  { value: 'tagsArray', label: 'Tag'},
  { value: 'bed', label: 'Bed' },
  { value: 'phone', label: 'Telephone'},
  { value: 'email', label: 'E-mail'},
  { value: 'notes', label: 'Notes'},
  { value: 'observation', label: 'Observation'}
];
      
const arrAdvancedFilteringOperand = [ '=', '<>' ];
const arrAdvancedFilteringLogic = [ 'AND'/*, 'OR' */];

// function getDDMMYYYYFormatFromDate(date){
//   var today = new Date(date);
//   var dd = today.getDate() + 1;
//   var mm = today.getMonth() + 1;
//   var yyyy = today.getFullYear();

//   if (dd < 10) dd = '0' + dd;
//   if (mm < 10) mm = '0' + mm
//   return today = dd + '/' + mm + '/' + yyyy;
// }

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

class DoctorPage extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      usernameFromDB: '', editDoctorProfileDlg: false, savingDoctorProfile: false, nameOfDoctor: '', emailOfDoctor: '', doctorAvatarSrc: '', avatarOfDoctor: null,
      toggledDrawer: false, anchorEl: null, mobileMoreAnchorEl: null, authenticated: false,
      tags: null, currentWidget: '', newPatientDialogVisible: false, filteredPatientsList: [], 
      tagsList: [], diagnosticsList: [], patientDetail: {}, searchBoxtextForPatients: '',
      observationOfNewPatient: '', emailOfNewPatient: '', telOfNewPatient: '', birthdayOfNewPatient: new Date(),
      bedOfNewPatient: '', nameOfNewPatient: '', notesOfNewPatient: '', avatarOfNewPatient: null,
      avatarSrc: '', selectedPatientIndex: 0, currentHelpDialog: null, curLanguageEn: true, creatingPatient: false,
      bAdvancedSearchDlgVisible: false, newFilterItem: arrAdvancedFilteringItem[0].value, newFilterOperand: arrAdvancedFilteringOperand[0],
      newFilterValue: '', newFilterLogic: arrAdvancedFilteringLogic[0], advancedFilteringArray: [], advancedFilteringFlag: false, bIndexing: true
    };
    this.patientsList = []
    this.userRef = this.patientRef = this.tagRef = this.patientTagsRef = 
    this.patientDiagnosticsRef = this.patientAvatarRef = this.diagnosticsRef = null;
    this.googleLogin = false;
    /*
      ('/patients'), ('/patienttags'), ('/patientdiagnosis'), ('/patientimages'), ('/tags'), ('/diagnosis'), ('/users'), ('/username')
      ('/patient_profile_image'), ('/patientimages'), ('/user_image'), 
    */

    this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
    this.handleDrawerClose = this.handleDrawerClose.bind(this);
    this.handleProfileMenuOpen = this.handleProfileMenuOpen.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.handleSetCurrentWidget = this.handleSetCurrentWidget.bind(this);
    this.handleNewPatient = this.handleNewPatient.bind(this);
    this.handleNewPatientDialogClose = this.handleNewPatientDialogClose.bind(this);
    this.handleSaveNewPatient = this.handleSaveNewPatient.bind(this);
    this.handleChangeSpecificState = this.handleChangeSpecificState.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleClickOnePatient = this.handleClickOnePatient.bind(this);
    this.handleUploadFiles = this.handleUploadFiles.bind(this);
    this.handleTryToUploadAvatar = this.handleTryToUploadAvatar.bind(this);
    this.handleTypeSearchBox= this.handleTypeSearchBox.bind(this);
    this.filteringPatient = this.filteringPatient.bind(this);
    this.handleClickTermsOfUse = this.handleClickTermsOfUse.bind(this);
    this.handleClickPrivacyPolicy = this.handleClickPrivacyPolicy.bind(this);
    this.handleClickContactUs = this.handleClickContactUs.bind(this);
    this.handleCloseHelpDialog = this.handleCloseHelpDialog.bind(this);
    this.handleToggleHelpLanguageSetting = this.handleToggleHelpLanguageSetting.bind(this);
    this.handleResetFilteredPatientsList = this.handleResetFilteredPatientsList.bind(this);
    this.handleCloseDoctorProfileDlg = this.handleCloseDoctorProfileDlg.bind(this);
    this.handleModifyDoctorProfile = this.handleModifyDoctorProfile.bind(this);
    this.handleSaveDoctorProfile = this.handleSaveDoctorProfile.bind(this);
    this.handleTryToUploadDoctorAvatar = this.handleTryToUploadDoctorAvatar.bind(this);
    this.handleAdvancedSearch = this.handleAdvancedSearch.bind(this);
    this.handleCloseAdvancedSearchDialog = this.handleCloseAdvancedSearchDialog.bind(this);
    this.handleSaveAdvancedSearchFiltering = this.handleSaveAdvancedSearchFiltering.bind(this);
    this.handleRemoveOneAdvancedFilter = this.handleRemoveOneAdvancedFilter.bind(this);
    this.handleClearAdvancedSearchFiltering = this.handleClearAdvancedSearchFiltering.bind(this);
    this.handleStartAdvancedSearchDialog = this.handleStartAdvancedSearchDialog.bind(this);
    this.handleDoDiagnosticsInitialIndexing = this.handleDoDiagnosticsInitialIndexing.bind(this);
    this.handleDoTagsInitialIndexing = this.handleDoTagsInitialIndexing.bind(this);
    this.clearSearchNameFilteringValue = this.clearSearchNameFilteringValue.bind(this);
    this.handleClearAdvancedSearchValue = this.handleClearAdvancedSearchValue.bind(this);
    this.searchNameStarting = this.searchNameStarting.bind(this);
    this.handleMakePresentationofCurrentPatient = this.handleMakePresentationofCurrentPatient.bind(this);
  }

  componentWillMount(){
    if ( !Auth.currentUser ) return;
    this.setState({ authenticated: true });
    this.googleLogin = Auth.currentUser.emailVerified;
  }

  componentDidMount(){
    if ( !this.state.authenticated ) return;
    var userId = Auth.currentUser.uid;
    this.userRef = Database.ref('/users').child(userId);
    this.userAvatarRef = Storage.ref('user_image');
    this.tagRef = Database.ref('/tags').child(userId);
    this.diagnosticsRef = Database.ref('/diagnosis').child(userId);;
    this.patientRef = Database.ref('/patients').child(userId);
    this.patientTagsRef = Database.ref('/patienttags');
    this.patientDiagnosticsRef = Database.ref('/patientdiagnosis');

    this.patientAvatarRef = Storage.ref('patient_profile_image');    

    this.userRef.on('value', (snapshot) => {
      var currentUserInfo = {};

      snapshot.forEach(function(child) {
        currentUserInfo[child.key] = child.val();
      });

      if ( this.googleLogin ){
        this.setState({ 
          nameOfDoctor: Auth.currentUser.displayName || '',
          emailOfDoctor: Auth.currentUser.email || '',
          doctorAvatarSrc: Auth.currentUser.photoURL || DoctorAvatar,
         });
      } else{
        this.setState({ 
          usernameFromDB: currentUserInfo['name'] || '',
          nameOfDoctor: currentUserInfo['name'] || '',
          emailOfDoctor: Auth.currentUser.email || '',
          doctorAvatarSrc: currentUserInfo['thumburl'] || DoctorAvatar,
         });
      }
      
      var avatarURL = this.googleLogin ? Auth.currentUser.photoURL : currentUserInfo['thumburl']
      
      if ( avatarURL ){
        fetch(avatarURL)
          .then(res => res.blob()) // Gets the response and returns it as a blob
          .then(blob => {
            this.setState({ avatarOfDoctor: blob });
        });
      }else {
        this.setState({ avatarOfDoctor: dataURItoBlob(DoctorAvatar) });
      }
    });

    this.tagRef.orderByChild('timestamp').on('value', (snapshot) => {
      var tagsList = [];

      snapshot.forEach(function(child) {
        tagsList.unshift({ id: child.key, value: child.val() } );
      });

      this.setState({ tagsList });
    });
    
    this.diagnosticsRef.orderByChild('timestamp').on('value', (snapshot) => {
      var diagnosticsList = [];
      snapshot.forEach(function(child) {
        diagnosticsList.unshift({ id: child.key, value: child.val() } );
      });

      this.setState({ diagnosticsList });
    });

    this.patientRef.once('value', (snapshot) => {
      var keys = Object.keys(snapshot.val() || {});
      var allPatientsCount = keys.length;
      if (allPatientsCount < 1) this.setState({bIndexing: false});
      this.patientRef.orderByChild('lastupdate').on("child_added", (newMessSnapshot) => {
        var newObj = { id: newMessSnapshot.key, value: newMessSnapshot.val() }
        newObj.value.diagnosticsArray = [];
        newObj.value.tagsArray = [];
        this.patientsList.unshift(newObj)
        
        if (this.state.bIndexing){
          allPatientsCount--;
          if (allPatientsCount <= 0) this.setState({bIndexing: false}, () => { this.handleDoDiagnosticsInitialIndexing(); this.handleResetFilteredPatientsList(0) });
        } else if ( !this.state.bIndexing ){
          if ( this.state.creatingPatient ){
            this.setState({ creatingPatient: false, searchBoxtextForPatients: ''}, () => {
              this.handleClearAdvancedSearchFiltering();
              this.handleResetFilteredPatientsList(0);
              this.handleNewPatientDialogClose();
            })
          }else {
            var currentPatientId = null
            if ( this.state.filteredPatientsList.length > 0) currentPatientId = this.state.filteredPatientsList[this.state.selectedPatientIndex].id;
            this.handleResetFilteredPatientsList(currentPatientId);
          }
        }
      })
    });

    this.patientRef.on('child_changed', (data) => {
      var currentPatientId = this.state.filteredPatientsList[this.state.selectedPatientIndex].id
      let index = this.patientsList.findIndex(element => element.id === data.key);
      if ( index < 0 ) return;
      var bufObj = Object.assign({}, { id: data.key, value: data.val() });
      bufObj.value.diagnosticsArray = this.patientsList[index].value.diagnosticsArray;
      bufObj.value.tagsArray = this.patientsList[index].value.tagsArray;
      this.patientsList.splice(index, 1);
      this.patientsList.unshift(bufObj);
      this.handleResetFilteredPatientsList(currentPatientId);
    })

    this.patientRef.on('child_removed', (data) => {
      var currentPatientId = this.state.filteredPatientsList[this.state.selectedPatientIndex].id
      var index = this.patientsList.findIndex( element => element.id === data.key );
      this.patientsList.splice(index, 1);
      var nextIndex = this.patientsList.findIndex( element => element.id === currentPatientId)
      if ( nextIndex < 0 && this.patientsList.length < 1) this.setState({selectedPatientIndex: 0, patientDetail: null }, this.handleSetCurrentWidget('empty'));
      else if ( nextIndex < 0 && this.patientsList.length > 0 ) this.handleResetFilteredPatientsList(0)
      else this.handleResetFilteredPatientsList(currentPatientId)
    })
  }

  componentWillUnmount(){
    this.tagRef && this.tagRef.off(); this.tagRef = null;
    this.patientRef && this.patientRef.off(); this.patientRef = null;
    this.diagnosticsRef && this.diagnosticsRef.off(); this.diagnosticsRef = null;
  }

  handleDoTagsInitialIndexing = () => {
    for ( let i = 0; i < this.patientsList.length; i++){
      this.patientTagsRef.child(this.patientsList[i].id).once('value', async (snapshot) => {
        let tagsArray = [];
        await snapshot.forEach(function(child) {
          tagsArray.push(child.val().description );
        });
        this.patientsList[i].value.tagsArray = tagsArray;
        if ( i === this.patientsList.length - 1 ) this.setState({ bIndexing: false })
      })
    }
  }

  handleDoDiagnosticsInitialIndexing = () => {
    for ( let i = 0; i < this.patientsList.length; i++){
      this.patientDiagnosticsRef.child(this.patientsList[i].id).once('value', async (snapshot) => {
        let diagnosticsArray = [];
        await snapshot.forEach(function(child) {
          diagnosticsArray.push(child.val().description );
        });
        this.patientsList[i].value.diagnosticsArray = diagnosticsArray;
        if ( i === this.patientsList.length - 1 ) this.handleDoTagsInitialIndexing()
      })
    }
  }

  handleTryToUploadAvatar = () => { document.getElementById('avatarUploadInput').click(); }

  handleSaveNewPatient = () => {
    if ( !this.state.nameOfNewPatient ) {
      this.props.enqueueSnackbar('Patient Name is necessary.', { variant: 'warning' });
      return;
    }
    // var birthdayOfNewPatient = this.state.birthdayOfNewPatient || new Date();
    // var strBirthday = getDDMMYYYYFormatFromDate(birthdayOfNewPatient);
    var birthdayTimestamp = new Date(this.state.birthdayOfNewPatient).getTime()
    var objNewPatient = {
      bed: this.state.bedOfNewPatient,
      birthday: birthdayTimestamp,
      email: this.state.emailOfNewPatient,
      lastupdate: String(Date.now()),
      name: this.state.nameOfNewPatient,
      observation: this.state.observationOfNewPatient,
      notes: this.state.notesOfNewPatient,
      phone: this.state.telOfNewPatient,
      thumburl: "",
      url: ""
    }
    
    if ( !this.state.avatarOfNewPatient ) {
      this.props.enqueueSnackbar('Patient Avatar is necessary.', { variant: 'warning' });
      return;
    }
    
    this.setState({ creatingPatient: true });
    // pushedResultKey
    const pushedResultKey = this.patientRef.push().key;

    const fileExtention = this.state.avatarOfNewPatient.type.split('/')[1] || 'jpeg';
    this.patientAvatarRef.child(pushedResultKey).put(this.state.avatarOfNewPatient)
    .then(snapshot => {
        snapshot.ref.getDownloadURL()
        .then(url => {
          objNewPatient.thumburl = url;
          objNewPatient.url = "gs://" + snapshot.ref.bucket + "/patient_profile_image/" + pushedResultKey + '.' + fileExtention
          this.patientRef.child(pushedResultKey).set(objNewPatient);
        })
    })
    .catch( error => console.log(error) );
  }

  handleDateChange = date => { this.setState({ birthdayOfNewPatient: date }); };

  handleNewPatientDialogClose = () => { this.setState({ newPatientDialogVisible: false }); }

  handleNewPatient = () => {
    var imageBlob = dataURItoBlob(PatientAvatar);
    
    this.setState({ observationOfNewPatient: '', emailOfNewPatient: '', telOfNewPatient: '', avatarSrc: PatientAvatar,
                    birthdayOfNewPatient: new Date(), bedOfNewPatient: '', nameOfNewPatient: '',
                    notesOfNewPatient: '', avatarOfNewPatient: imageBlob }
      , this.setState({ newPatientDialogVisible: true }))
  }

  handleSetCurrentWidget = ( widgetValue ) => { this.setState({ currentWidget: widgetValue }); }

  handleDrawerOpen = () => { this.setState({ toggledDrawer: true }); };

  handleDrawerClose = () => { this.setState({ toggledDrawer: false }); };

  handleSignOut = () => {
    Auth.signOut()
    .then(res => { this.setState({ authenticated: false }); })
    .catch(err => { console.log(err); })
  }

  handleProfileMenuOpen = event => { this.setState({ anchorEl: event.currentTarget }); }

  handleMenuClose = () => { this.setState({ anchorEl: null }); this.handleMobileMenuClose(); };

  handleMobileMenuOpen = event => { this.setState({ mobileMoreAnchorEl: event.currentTarget }); };

  handleMobileMenuClose = () => { this.setState({ mobileMoreAnchorEl: null }); };

  handleChangeSpecificState = prop => event => {
    if (prop === 'newFilterItem' || prop === 'newFilterOperand') {
      let initSelectedValue = ''
      if ( prop === 'newFilterItem' && event.target.value === 'diagnosticsArray') initSelectedValue = ''//this.state.diagnosticsList[0].value.description
      else if ( prop === 'newFilterItem' && event.target.value === 'tagsArray') initSelectedValue = ''//this.state.tagsList[0].value.description
      else if ( prop === 'newFilterOperand' && this.state.newFilterItem === 'diagnosticsArray' ) initSelectedValue = ''//this.state.diagnosticsList[0].value.description
      else if ( prop === 'newFilterOperand' && this.state.newFilterItem === 'tagsArray') initSelectedValue = ''//this.state.tagsList[0].value.description
      this.setState({ [prop]: event.target.value, newFilterValue: initSelectedValue });
    }
    else  this.setState({ [prop]: event.target.value });
  }

  handleClickOnePatient = indexOrId => event => {
    var index = 0;
    if ( typeof indexOrId === 'number' ) index = indexOrId;
    else index = this.state.filteredPatientsList.findIndex( element => element.id === indexOrId )
    var patientDetail = this.state.filteredPatientsList[index]
    if ( !patientDetail ) this.setState({selectedPatientIndex: index, patientDetail }, this.handleSetCurrentWidget('empty'));
    else this.setState({selectedPatientIndex: index, patientDetail }, this.handleSetCurrentWidget('patientDetail'));
    
  }

  handleUploadFiles = event => {
    if ( event.target.files && event.target.files[0] ){
      var reader = new FileReader();
      reader.onload = e => {
        this.setState({ avatarSrc: e.target.result });
      }
      reader.readAsDataURL(event.target.files[0]);
      this.setState({ avatarOfNewPatient: event.target.files[0] });
    }
  }

  filterPatientWithTags(){
  }

  handleTypeSearchBox = event => {
    var bufferingAdvancedFilteringArray = Object.assign([], this.state.advancedFilteringArray);
    var nameIndexFromAdvancedSearchArray = bufferingAdvancedFilteringArray.findIndex( element => element.item === 'searchBoxtextForPatients' && element.operand === '=')

    if ( nameIndexFromAdvancedSearchArray >= 0 ){      
      bufferingAdvancedFilteringArray[nameIndexFromAdvancedSearchArray].value = event.target.value
      if ( !event.target.value ) bufferingAdvancedFilteringArray.splice(nameIndexFromAdvancedSearchArray, 1)
    }else {
      const newAdvancedSearchObj = {
        item: 'searchBoxtextForPatients',
        operand: '=',
        label: 'Name',
        value: event.target.value,
        logic: 'AND'
      }
      bufferingAdvancedFilteringArray.push(newAdvancedSearchObj);
    }
    this.setState({ searchBoxtextForPatients: event.target.value, advancedFilteringArray: bufferingAdvancedFilteringArray }, () => { this.handleResetFilteredPatientsList(0); } )
  }

  filteringPatient(){    
  }   

  handleClickTermsOfUse = () => { this.setState({ currentHelpDialog: 'Terms of Use'}, this.handleMenuClose); }
  handleClickPrivacyPolicy = () => { this.setState({ currentHelpDialog: 'Privacy Policy'}, this.handleMenuClose); }
  handleCloseHelpDialog = () => { this.setState({ currentHelpDialog: null }); }

  handleResetFilteredPatientsList = (selection = -1) => {
    var filteredPatientsListAll = Object.assign([], this.patientsList);
    var filteredPatientsList = []

    if ( this.state.searchBoxtextForPatients || this.state.advancedFilteringFlag ){
      filteredPatientsListAll.sort((former, latter) => {
        if (former.value.name > latter.value.name) return 1
        else if (former.value.name < latter.value.name) return -1
        else return 0;
      })
    }
    
    for ( var i = 0; i < filteredPatientsListAll.length; i++){
      let eachPatientInfo = filteredPatientsListAll[i].value
      if ( String(eachPatientInfo.name).toLowerCase().indexOf(String(this.state.searchBoxtextForPatients).toLowerCase()) >= 0 ) {
        if ( this.state.advancedFilteringFlag ){
          var advancedFilteringFlag = true;
          for ( var j = 0; j < this.state.advancedFilteringArray.length; j++){
            let eachOne = Object.assign({}, this.state.advancedFilteringArray[j]);
            if (eachOne.item === 'searchBoxtextForPatients' && eachOne.operand === '=') continue;
            if (eachOne.item === 'searchBoxtextForPatients') eachOne.item = 'name'
            var operand = eachOne.operand
            if ( eachPatientInfo[eachOne.item] ){
              if ( operand === '=') {
                if (typeof eachPatientInfo[eachOne.item] === 'string' && eachPatientInfo[eachOne.item].includes(eachOne.value) === false ) { advancedFilteringFlag = false; break; }
                else if (Array.isArray(eachPatientInfo[eachOne.item])){
                  const arrItems = Object.assign([], eachPatientInfo[eachOne.item])
                  let arrFlag = false;
                  for ( var ii = 0; ii < arrItems.length; ii++){
                    if (arrItems[ii].includes(eachOne.value)) { arrFlag = true; break; }
                  }
                  if ( !arrFlag ) { advancedFilteringFlag = false; break; }
                }
              } 
              else if ( operand === '<>'){
                if (typeof eachPatientInfo[eachOne.item] === 'string' && eachPatientInfo[eachOne.item].includes(eachOne.value) ) { advancedFilteringFlag = false; break; }
                else if (Array.isArray(eachPatientInfo[eachOne.item])){
                  const arrItems = Object.assign([], eachPatientInfo[eachOne.item])
                  let arrFlag = false;
                  for ( var jj = 0; jj < arrItems.length; jj++){
                    if (arrItems[jj].includes(eachOne.value)) {
                      arrFlag = true; break;
                    }
                  }
                  if ( arrFlag ) { advancedFilteringFlag = false; break; }
                }
              } 
            }else {
              advancedFilteringFlag = false; break;
            }
          }
          if ( !advancedFilteringFlag ) continue;
        }
        filteredPatientsList.push(filteredPatientsListAll[i]);
        if ( !this.state.searchBoxtextForPatients && filteredPatientsList.length >= 15 ) break;
        else if ( this.state.searchBoxtextForPatients && filteredPatientsList.length >= 30 ) break;
      }
    }

    if ( typeof selection === 'number' && selection < 0) this.setState({ filteredPatientsList });
    else  this.setState({ filteredPatientsList }, this.handleClickOnePatient(selection) );
  }

  handleToggleHelpLanguageSetting = event => { this.setState({ curLanguageEn: event.target.checked }); };

  handleModifyDoctorProfile = () => { this.setState({ editDoctorProfileDlg: true }, this.handleMenuClose) }
  handleCloseDoctorProfileDlg = () => {
    if ( this.googleLogin ) this.setState({ editDoctorProfileDlg: false, nameOfDoctor: Auth.currentUser.displayName || ''});
    else this.setState({ editDoctorProfileDlg: false, nameOfDoctor: this.state.usernameFromDB })
  }
  handleSaveDoctorProfile = () => {
    if ( !this.state.emailOfDoctor || !this.state.nameOfDoctor ) {
      this.props.enqueueSnackbar('Input information correctly...', { variant: 'warning' });
      return;
    }
    
    this.setState({ savingDoctorProfile: true });

    var userId = Auth.currentUser.uid;

    var doctorProfile = {
      email: this.state.emailOfDoctor,
      name: this.state.nameOfDoctor,
      thumburl: '',
      url: '',
      timestamp: String(Date.now())
    }
    
    this.userAvatarRef.child(userId + '.jpeg').delete().catch(error => console.log('File not exist...'));
    this.userAvatarRef.child(userId + '.jpeg').put(this.state.avatarOfDoctor)
    .then(snapshot => {
      snapshot.ref.getDownloadURL()
      .then(url => {
        doctorProfile.thumburl = url;
        doctorProfile.url = "gs://" + snapshot.ref.bucket + "/user_image/" + userId + '.jpeg'
        this.userRef.set(doctorProfile)
        this.setState({ savingDoctorProfile: false }, this.handleCloseDoctorProfileDlg);
      })
      .catch( error => { this.setState({ savingDoctorProfile: false }); console.log(error);} );
    })
    .catch( error => { this.setState({ savingDoctorProfile: false }); console.log(error);} );
  }
  handleTryToUploadDoctorAvatar = () => { document.getElementById('doctorAvatarUploadInput').click(); }
  handleUploadDoctorAvatar = event => {
    if ( event.target.files && event.target.files[0] ){
      var reader = new FileReader();
      reader.onload = e => {
        this.setState({ doctorAvatarSrc: e.target.result });
      }
      reader.readAsDataURL(event.target.files[0]);
      this.setState({ avatarOfDoctor: event.target.files[0] });
    }
  }

  handleClickContactUs = () => {
    window.location.assign("mailto:suportedoctorcases@gmail.com?Subject=" + encodeURIComponent("Contato usuário " + this.state.nameOfDoctor));
    this.handleMenuClose();
  }

  handleAdvancedSearch = () => { this.setState({ advancedFilteringFlag: false, bAdvancedSearchDlgVisible: true }) };
  handleCloseAdvancedSearchDialog = () => {
    var advancedFilteringFlag = false;
    if ( this.state.advancedFilteringArray.length > 0) advancedFilteringFlag = true
    var nameIndex = this.state.advancedFilteringArray.findIndex( element => element.item === 'searchBoxtextForPatients' )
    if ( nameIndex < 0 ) this.setState({ bAdvancedSearchDlgVisible: false, advancedFilteringFlag, searchBoxtextForPatients: '' }, () => { this.handleResetFilteredPatientsList(0); })
    else this.setState({ bAdvancedSearchDlgVisible: false, advancedFilteringFlag }, () => { this.handleResetFilteredPatientsList(0); })
    
  }
  handleSaveAdvancedSearchFiltering = () => {
    if ( !this.state.newFilterValue ) {
      this.props.enqueueSnackbar('Incorrect Value Field.', { variant: 'warning' });
      return;
    }
    let itemInStaticArray = arrAdvancedFilteringItem.find(element => element.value === this.state.newFilterItem)
    if (!itemInStaticArray) return;

    const newAdvancedSearchObj = {
      item: this.state.newFilterItem,
      label: itemInStaticArray.label,
      operand: this.state.newFilterOperand,
      value: this.state.newFilterValue,
      logic: this.state.newFilterLogic
    }

    var advanedFiltering = Object.assign([], this.state.advancedFilteringArray);
    var nameIndex = -1;
    if ( newAdvancedSearchObj.item === 'searchBoxtextForPatients' && newAdvancedSearchObj.operand === '=') {
      nameIndex = advanedFiltering.findIndex( element => element.item === 'searchBoxtextForPatients' && element.operand === '=')
      if ( nameIndex >= 0) advanedFiltering.splice(nameIndex, 1)
      this.setState({ searchBoxtextForPatients: newAdvancedSearchObj.value })
    }
    advanedFiltering.push(newAdvancedSearchObj);

    this.setState({ advancedFilteringArray: advanedFiltering, newFilterValue: ''});
  }
  handleRemoveOneAdvancedFilter = index => {
    var advanedFiltering = Object.assign([], this.state.advancedFilteringArray);
    advanedFiltering.splice(index, 1);
    this.setState({ advancedFilteringArray: advanedFiltering })
  }
  handleClearAdvancedSearchFiltering = () => { this.setState({ advancedFilteringArray: [], newFilterValue: '' }); }
  handleStartAdvancedSearchDialog = () => {
    if (this.state.advancedFilteringArray.length < 1 && this.state.newFilterValue) {
      this.handleSaveAdvancedSearchFiltering()
    } 
    this.setState({ advancedFilteringFlag: true }, this.handleCloseAdvancedSearchDialog)
  }

  clearSearchNameFilteringValue = () => { this.setState({ searchBoxtextForPatients: '' }, this.handleResetFilteredPatientsList) }
  handleClearAdvancedSearchValue = () => { this.setState({ newFilterValue: '' }) }

  searchNameStarting = () => {
    this.setState({ toggledDrawer: true });
  }
  handleMakePresentationofCurrentPatient = () => {
    console.log('asfdafds')
    this.handleMenuClose();
  }

  render() {
    var { classes, theme } = this.props;
    var { anchorEl, mobileMoreAnchorEl, toggledDrawer, authenticated, selectedPatientIndex, filteredPatientsList, doctorAvatarSrc, nameOfDoctor, emailOfDoctor, 
            currentWidget, tagsList, diagnosticsList, avatarSrc, birthdayOfNewPatient, currentHelpDialog, curLanguageEn, searchBoxtextForPatients } = this.state;
    var { advancedFilteringArray, bIndexing, newFilterItem } = this.state;
    
    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl); 

    if ( !authenticated ) return <Redirect to="/signin"/>;

    const renderMenu = (
      <Menu anchorEl={anchorEl} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }} open={isMenuOpen} onClose={this.handleMenuClose}>
        <MenuItem onClick={this.handleModifyDoctorProfile}>
          <IconButton>{doctorAvatarSrc?<Avatar  alt="Avatar" src={doctorAvatarSrc} className={classes.smallAvatar}/>: <PersonIcon/>}</IconButton>
          <p>Profile</p>
        </MenuItem>
        <MenuItem onClick={this.handleClickContactUs}><IconButton><ContactMail/></IconButton><p>Contact us</p></MenuItem>
        <MenuItem onClick={this.handleClickTermsOfUse}><IconButton><VerifiedUser/></IconButton><p>Terms of Use</p></MenuItem>
        <MenuItem onClick={this.handleClickPrivacyPolicy}><IconButton><VerifiedUser/></IconButton><p>Privacy Policy</p></MenuItem>
        <MenuItem onClick={this.handleSignOut}><IconButton><HomeIcon/></IconButton><p>Sign Out</p></MenuItem>
      </Menu>
    );

    const renderMobileMenu = (
      <Menu anchorEl={mobileMoreAnchorEl} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }} open={isMobileMenuOpen} onClose={this.handleMobileMenuClose}>
        <MenuItem onClick={this.handleModifyDoctorProfile}>
          <IconButton>{doctorAvatarSrc?<Avatar  alt="Avatar" src={doctorAvatarSrc} className={classes.smallAvatar}/>: <PersonIcon/>}</IconButton>
          <p>Profile</p>
        </MenuItem>
        {
          arrWidgetList.map((eachOne, index) => {
            if ( eachOne.value === 'patientDetail') return null;
            if ( eachOne.value === 'empty') return null;
            return <MenuItem key={index} onClick={() => this.handleSetCurrentWidget(eachOne.value)}><IconButton>
                {eachOne.icon(classes)}
                {/* <Badge badgeContent={this.state[eachOne.value].length || 0} color="secondary"> {eachOne.icon(classes)} </Badge> */}
              </IconButton><p>{eachOne.label}</p></MenuItem>
          })
        }
        {/* <MenuItem onClick={this.handleMakePresentationofCurrentPatient}><IconButton><ContactMail/></IconButton><p>Make Presentation</p></MenuItem> */}
        <MenuItem onClick={this.handleClickContactUs}><IconButton><ContactMail/></IconButton><p>Contact us</p></MenuItem>
        <MenuItem onClick={this.handleClickTermsOfUse}><IconButton><VerifiedUser/></IconButton><p>Terms of Use</p></MenuItem>
        <MenuItem onClick={this.handleClickPrivacyPolicy}><IconButton><VerifiedUser/></IconButton><p>Privacy Policy</p></MenuItem>
        <MenuItem onClick={this.handleSignOut}><IconButton><HomeIcon/></IconButton><p>Sign Out</p></MenuItem>
      </Menu>
    );
    
    var bDropdownListAvaliable = false, arrDropdownList = []
    if ( newFilterItem  === 'diagnosticsArray' || newFilterItem === 'tagsArray') {
      bDropdownListAvaliable = true;
      var bufferingArray = []
      if (newFilterItem  === 'diagnosticsArray') bufferingArray = this.state.diagnosticsList
      else bufferingArray = this.state.tagsList
      for ( var i = 0; i < bufferingArray.length; i++){
        arrDropdownList.push(bufferingArray[i].value.description)
      }
      arrDropdownList.sort()
    }

    const curWidgetIndex = arrWidgetList.findIndex( element => { return element.value === currentWidget; });
    var subWidgetContent = this.state[currentWidget] || [], subWidgetSetter = {};
    if ( currentWidget === 'patientDetail' ) subWidgetContent = { patient: subWidgetContent, tagsList, diagnosticsList }
    const mainWidget = curWidgetIndex < 0 ? null : arrWidgetList[curWidgetIndex].component(subWidgetContent, subWidgetSetter);
    
    var helpingContent = '';
    if ( currentHelpDialog === 'Terms of Use' ) helpingContent = CONSTANTS['txtTermsOfUse_' + (!curLanguageEn?'en':'br')]
    else if ( currentHelpDialog === 'Privacy Policy' ) helpingContent = CONSTANTS['txtPrivacyPolicy_' + (!curLanguageEn?'en':'br')]
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" className={classNames(classes.appBar, { [classes.appBarShift]: this.state.toggledDrawer, })}>
          <Toolbar disableGutters={!toggledDrawer}>
            <IconButton color="inherit" aria-label="Open drawer" onClick={this.handleDrawerOpen}
              className={classNames(classes.menuButton, toggledDrawer && classes.hide)}>
              <MenuIcon />
            </IconButton>
            <Fab color="primary" aria-label="Add" className={classes.fabAddNewPatient} size="small" onClick={this.handleNewPatient}> <AddIcon /> </Fab>
            <Fab disabled={bIndexing} color="primary" aria-label="Advanced Search" className={classes.fabAddNewPatient} size="small" onClick={this.handleAdvancedSearch}>
              <Badge badgeContent={this.state.advancedFilteringArray.length || 0} color="secondary"><FindInPageIcon /></Badge>
            </Fab>
            
            <div className={classes.search}>
              <div className={classes.searchIcon}> <SearchIcon /> </div>
              <Input disabled={bIndexing} value={searchBoxtextForPatients} onChange={event => this.handleTypeSearchBox(event)} disableUnderline
                placeholder="Search Patients …" classes={{ root: classes.inputRoot, input: classes.inputInput }} onFocus={this.searchNameStarting}/>
              <div className={classes.clearIcon} onClick={this.clearSearchNameFilteringValue}> <ClearIcon /> </div>
            </div>
            <div className={classes.grow} />
            {bIndexing && <div style={{display: 'flex'}}><CircularProgress color="secondary" style={{margin: 10}}/><span style={{margin: 'auto'}}>Indexing...</span></div>}
            <Typography variant="h6" className={classes.nameInAppBar}>{filteredPatientsList[selectedPatientIndex] && filteredPatientsList[selectedPatientIndex].value.name}</Typography>
            <div className={classes.sectionDesktop}>
            {/* <IconButton onClick={this.handleMakePresentationofCurrentPatient}><Avatar  alt="presentation" src={PresentationImg} className={classes.smallAvatar}/></IconButton> */}
            {
              arrWidgetList.map((eachOne, index) => {
                if ( eachOne.value === 'patientDetail') return null;
                if ( eachOne.value === 'empty') return null;
                return <IconButton color="inherit" key={eachOne.value} onClick={() => this.handleSetCurrentWidget(eachOne.value)}>
                    {eachOne.icon(classes)}
                    {/* <Badge badgeContent={this.state[eachOne.value].length || 0} color="secondary"> {eachOne.icon(classes)} </Badge> */}
                  </IconButton>
              })
            }
            <IconButton aria-owns={isMenuOpen ? 'material-appbar' : undefined} aria-haspopup="true" onClick={this.handleProfileMenuOpen} color="inherit">
              {doctorAvatarSrc?<Avatar  alt="Avatar" src={doctorAvatarSrc} className={classes.smallAvatar}/>: <PersonIcon/>}
            </IconButton>
            </div>
            <div className={classes.sectionMobile}>
              <IconButton aria-haspopup="true" onClick={this.handleMobileMenuOpen} color="inherit">
                <MoreIcon />
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>
        {renderMenu}
        {renderMobileMenu}
        <Drawer variant="permanent" open={this.state.toggledDrawer} 
          className={classNames(classes.drawer, { [classes.drawerOpen]: this.state.toggledDrawer, [classes.drawerClose]: !this.state.toggledDrawer, })}
          classes={{ paper: classNames({ [classes.drawerOpen]: this.state.toggledDrawer, [classes.drawerClose]: !this.state.toggledDrawer, }), }} >
          <div className={classes.toolbar}>
            <IconButton onClick={this.handleDrawerClose}>
              {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </div>
          <Divider />
          <List>
            {filteredPatientsList.map((eachPatient, index) => {
              let avatarSrc = eachPatient.value.thumburl;
              return <ListItem button key={eachPatient.id} onClick={this.handleClickOnePatient(eachPatient.id)} selected={selectedPatientIndex === index}>
                <ListItemIcon>
                  <ExifImageViewer src={avatarSrc?avatarSrc:''} mediaSize="sm"/>
                </ListItemIcon>
                <ListItemText className={classes.patientNameListItem} primary={eachPatient.value.name} />
              </ListItem>
            })}
          </List>
        </Drawer>
        
        <main className={classNames(classes.content, {[classes.contentShift]: toggledDrawer})}>
          <div className={classes.drawerHeader} />
          {mainWidget}
        </main>

        <Dialog open={this.state.newPatientDialogVisible} onClose={this.handleNewPatientDialogClose} aria-labelledby="new-patient-form-dialog-title" >
          <DialogTitle id="new-patient-form-dialog-title">Type a new Patient Profile</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To ADD a new patient, please enter the detailed profile here.
            </DialogContentText>
            <Grid container alignItems="center">
              <Grid item xs={12} sm={5} md={4} lg={4} xl={4}>
                <Avatar alt="Avatar" src={avatarSrc} className={classes.bigAvatar} onClick={this.handleTryToUploadAvatar}/>
                <input id="avatarUploadInput" type="file" accept="image/*" style={{'display': 'none'}} onChange={event => this.handleUploadFiles(event)}/>
              </Grid>
              <Grid item xs={12} sm={7} md={8} lg={8} xl={8}>
                <FormControl className={classes.formControl} fullWidth>
                  <InputLabel htmlFor="formatted-text-mask-input-name">Name</InputLabel>
                  <Input id="formatted-text-mask-input-name" value={this.state.nameOfNewPatient} onChange={this.handleChangeSpecificState('nameOfNewPatient')} fullWidth/>
                </FormControl>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <Fragment>
                    <div className={classes.formControl}>
                      <DatePicker keyboard label="Birthday" format="dd/MM/yyyy" placeholder="10/10/2018" showTodayButton  fullWidth
                        mask={value => value ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/] : [] } value={birthdayOfNewPatient}
                        onChange={this.handleDateChange} disableOpenOnEnter animateYearScrolling={false} />
                    </div>
                  </Fragment>  
                </MuiPickersUtilsProvider>    
                <FormControl className={classes.formControl} fullWidth>
                  <InputLabel htmlFor="formatted-text-mask-input-tel">Telephone No</InputLabel>
                  <Input value={this.state.telOfNewPatient} onChange={this.handleChangeSpecificState('telOfNewPatient')} id="formatted-text-mask-input-tel"/>
                </FormControl>
              </Grid>
            </Grid>
            
            <FormControl className={classes.formControl} fullWidth>
              <InputLabel htmlFor="formatted-text-mask-input-bed">Bed</InputLabel>
              <Input id="formatted-text-mask-input-bed" value={this.state.bedOfNewPatient} onChange={this.handleChangeSpecificState('bedOfNewPatient')}/>
            </FormControl>
            <FormControl className={classes.formControl} fullWidth>
              <InputLabel htmlFor="formatted-text-mask-input-email">Email</InputLabel>
              <Input value={this.state.emailOfNewPatient} onChange={this.handleChangeSpecificState('emailOfNewPatient')} id="formatted-text-mask-input-email"/>
            </FormControl>
            <FormControl className={classes.formControl} fullWidth>
              <InputLabel htmlFor="formatted-text-mask-input-notes">Notes</InputLabel>
              <Input value={this.state.notesOfNewPatient} onChange={this.handleChangeSpecificState('notesOfNewPatient')} id="formatted-text-mask-input-notes" multiline/>
            </FormControl>
            <FormControl className={classes.formControl} fullWidth>
              <InputLabel htmlFor="formatted-text-mask-input-observation">Observation</InputLabel>
              <Input value={this.state.observationOfNewPatient} onChange={this.handleChangeSpecificState('observationOfNewPatient')} id="formatted-text-mask-input-observation" multiline/>
            </FormControl>
            
          </DialogContent>
          <DialogActions>
            <Button disabled={this.state.creatingPatient} onClick={this.handleNewPatientDialogClose} color="primary"> CANCEL </Button>
            <div className={classes.wrapper}>
              <Button disabled={this.state.creatingPatient} onClick={this.handleSaveNewPatient} color="primary"> SAVE </Button>
              {this.state.creatingPatient && <CircularProgress size={24} className={classes.buttonProgress} />}
            </div>
            
          </DialogActions>
        </Dialog>
        
        <Dialog open={!!currentHelpDialog} onClose={this.handleCloseHelpDialog} scroll={'paper'} aria-labelledby="help-dialog-title" >
          <DialogTitle id="help-dialog-title">{currentHelpDialog || ''}</DialogTitle>
          <DialogContent>
            {/* <FormControlLabel control={ <Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} value="curLanguageEn" checked={this.state.curLanguageEn} onChange={this.handleToggleHelpLanguageSetting}/> }
              label="Do you like Portuguese Support?" /> */}
            <DialogContentText dangerouslySetInnerHTML={{__html: helpingContent}}/>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseHelpDialog} color="primary"> Cancel </Button>
          </DialogActions>
        </Dialog>
        
        <Dialog open={this.state.editDoctorProfileDlg} onClose={this.handleCloseDoctorProfileDlg} aria-labelledby="edit-doctor-profile" >
          <DialogTitle id="edit-doctor-profile">Profile</DialogTitle>
          <DialogContent>
            <Grid container alignItems="center">
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Avatar alt="Avatar" src={doctorAvatarSrc} className={classes.bigAvatar} onClick={this.handleTryToUploadDoctorAvatar}/>
                <input id="doctorAvatarUploadInput" type="file" accept="image/*" style={{'display': 'none'}} onChange={event => this.handleUploadDoctorAvatar(event)}/>
                <Typography component="h6" variant="h6" gutterBottom style={{textAlign: 'center'}}>{nameOfDoctor}</Typography>
                <Typography component="h6" variant="h6" gutterBottom style={{textAlign: 'center'}}>{emailOfDoctor}</Typography>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <FormControl disabled={this.googleLogin} className={classes.formControl} fullWidth>
                  <InputLabel htmlFor="formatted-text-mask-input-doctor-name">Name</InputLabel>
                  <Input id="formatted-text-mask-input-doctor-name" value={nameOfDoctor} onChange={this.handleChangeSpecificState('nameOfDoctor')} fullWidth/>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button disabled={this.state.savingDoctorProfile} onClick={this.handleCloseDoctorProfileDlg} color="primary"> CANCEL </Button>
            <div className={classes.wrapper}>
              <Button disabled={this.googleLogin || this.state.savingDoctorProfile} onClick={this.handleSaveDoctorProfile} color="primary"> SAVE </Button>
              {this.state.savingDoctorProfile && <CircularProgress size={24} className={classes.buttonProgress} />}
            </div>
            
          </DialogActions>
        </Dialog>
              
        <Dialog open={this.state.bAdvancedSearchDlgVisible} onClose={this.handleCloseAdvancedSearchDialog}
              scroll={'paper'} aria-labelledby="advanced-search-dialog-title" fullWidth maxWidth="lg">
          <DialogTitle id="advanced-search-dialog-title">{'Advanced Search'}</DialogTitle>
          <DialogContent>
            <form style={{display: 'flex', flexWrap: 'wrap'}}>
              <div>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="new-filtering-item">Item</InputLabel>
                  <Select native value={this.state.newFilterItem} onChange={this.handleChangeSpecificState('newFilterItem')} inputProps={{ id: "new-filtering-item" }} >
                    { arrAdvancedFilteringItem.map((eachOne, index) => <option key={eachOne.value} value={eachOne.value}>{eachOne.label}</option>) }
                  </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="new-filtering-operand">Operand</InputLabel>
                  <Select native value={this.state.newFilterOperand} onChange={this.handleChangeSpecificState('newFilterOperand')} inputProps={{ id: "new-filtering-operand" }} >
                    { arrAdvancedFilteringOperand.map((eachOne, index) => <option key={index} value={eachOne}>{eachOne}</option>) }
                  </Select>
                </FormControl>
              </div>
              <div style={{flex: 'auto'}}>
                { bDropdownListAvaliable ?
                  <FormControl className={classes.formControl} fullWidth>
                    <InputLabel htmlFor="new-filter-value-array">Select Value from List</InputLabel>
                    <Select native value={this.state.newFilterValue} onChange={this.handleChangeSpecificState('newFilterValue')} inputProps={{ name: 'newFilterValue', id: 'new-filter-value-array', }}>
                    <option key={-1} value={''}>{''}</option>
                    {arrDropdownList.map((eachOne, index) => <option key={index} value={eachOne}>{eachOne}</option>)}
                  </Select></FormControl> :
                  <FormControl className={classes.formControl} fullWidth>
                    <InputLabel htmlFor="new-filtering-value">Type Value here</InputLabel>
                    <Input id="new-filtering-value" value={this.state.newFilterValue} onChange={this.handleChangeSpecificState('newFilterValue')} onKeyPress={(event) => { if (event.which === 13) { event.preventDefault(); this.handleSaveAdvancedSearchFiltering(); } }} />
                  </FormControl> }
              </div>
              <Fab color="secondary" size="small" style={{margin: 'auto 10px'}} onClick={this.handleClearAdvancedSearchValue}><ClearIcon /></Fab>
              <Fab variant="extended" aria-label="Delete" size="small" style={{width: 'auto', margin: 'auto'}} onClick={this.handleSaveAdvancedSearchFiltering}>
                <AddIcon style={{marginRight: theme.spacing.unit}}/>Add Item
              </Fab>
            </form>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Field Name</TableCell>
                  <TableCell align="center">Operand</TableCell>
                  <TableCell align="center">Value</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {advancedFilteringArray.map((eachOne, index) => (
                <TableRow key={index}>
                  <TableCell align="center" component="th" scope="row"> {eachOne.label} </TableCell>
                  <TableCell align="center">{eachOne.operand}</TableCell>
                  <TableCell align="center">{eachOne.value}</TableCell>
                  <TableCell align="center">
                    <IconButton aria-label="Delete" onClick={() => this.handleRemoveOneAdvancedFilter(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions style={{paddingLeft: 20, paddingRight: 20}}>
            <div style={{display: 'flex', flexWrap: 'wrap'}}>
              <Button onClick={this.handleCloseAdvancedSearchDialog} color="secondary" style={{marginRight: 'auto'}}> Cancel </Button>
              <Button onClick={this.handleClearAdvancedSearchFiltering} color="secondary"> Clear </Button>
              <Button onClick={this.handleStartAdvancedSearchDialog} color="primary"> Start Filtering </Button>
            </div>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

DoctorPage.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  enqueueSnackbar: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(withSnackbar(DoctorPage));
