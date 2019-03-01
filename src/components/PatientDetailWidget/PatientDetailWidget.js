import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withSnackbar } from 'notistack';
import classNames from 'classnames';

import {
  Grid, Typography, Card, CardContent, DialogActions, DialogContent, DialogContentText,
  CardActions, Button, Avatar, CardHeader, Input, InputLabel,
  FormControl, Tabs, Tab, Chip, Slide, Dialog, DialogTitle, Fab,
  GridList, GridListTile, GridListTileBar, IconButton, CircularProgress, MobileStepper,
  Tooltip, Paper, LinearProgress, TextField, ListItem, ListItemText, ListItemSecondaryAction, List,
  RadioGroup, Radio, FormControlLabel, Switch
} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import PersonPinIcon from '@material-ui/icons/PersonPin';
import ClearIcon from '@material-ui/icons/Clear';
import DoneIcon from '@material-ui/icons/Done';
import RotateIcon from '@material-ui/icons/RotateRight';
import FormatShapes from '@material-ui/icons/FormatShapes';
import DeleteIcon from '@material-ui/icons/Delete';
import CropIcon from '@material-ui/icons/Crop';
import CropFreeIcon from '@material-ui/icons/CropFree';
import SwapHoriz from '@material-ui/icons/SwapHoriz';
import InvertColors from '@material-ui/icons/InvertColors';
import RightIcon from '@material-ui/icons/KeyboardArrowRight';
import LeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import ListAltIcon from '@material-ui/icons/ListAlt';
import EventNoteIcon from '@material-ui/icons/EventNote';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import SaveIcon from '@material-ui/icons/Save';
import SearchIcon from '@material-ui/icons/Search';

import { Player } from 'video-react';

import SwipeableViews from 'react-swipeable-views';
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker, TimePicker, MuiPickersUtilsProvider } from 'material-ui-pickers';

import styles from './style';
import PatientDetailCaseImageWidget from '../PatientDetailCaseImageWidget/PatientDetailCaseImageWidget';
import PatientDetailCaseImageWidgetForLaptop from '../PatientDetailCaseImageWidgetForLaptop/PatientDetailCaseImageWidget';
import { Database, Storage, Auth } from '../../firebase';
import VideoPoster from '../../assets/images/VideoPoster.png'
import ExifImageViewer from '../ExifImageViewer/ExifImageViewer'
import DiagnosticsImg from '../../assets/images/DiagnosticsGray.png'
// import TagsImg from '../../assets/images/TagsGray.png'
import DoctorCasesLogo from '../../assets/images/logo.png'
import UploadIcon from '../../assets/images/UploadIcon.png'
import PresentationImg from '../../assets/images/google-presentation.png'
/// jts added
import gapi from 'gapi-client';
import UserAuthorizer from 'md2gslides';
import SlideGenerator from 'md2gslides';

const CLIENT_ID = 'oBx7TP8qg0srYNtCch0PXtQO' // CLIENT SECRET KEY
const API_KEY = 'AIzaSyCrY9x48XFqps__RTdGITT3Ng44rfgMVZ0'

function TabContainer({ children, dir }) {
  return (
    <Typography component="div" dir={dir} style={{ padding: 8 * 3 }}>
      {children}
    </Typography>
  );
}

const STATIC_TAB_INDEX = {
  PROFILE: 0,
  DIAGNOSTICS_AND_TAGS: 1,
  IMAGE_AND_VIDEO: 2,
  DOCUMENTS: 3,
  EVOLUTION: 4
}
// const AutoPlaySwipeableViews = autoPlay(SwipeableViews);
// function getDDMMYYYYFormatFromDate(date){
//   var today = new Date(date);
//   var dd = today.getDate() + 1;
//   var mm = today.getMonth() + 1;
//   var yyyy = today.getFullYear();

//   if (dd < 10) dd = '0' + dd;
//   if (mm < 10) mm = '0' + mm
//   return today = dd + '/' + mm + '/' + yyyy;
// }

function Transition(props) { return <Slide direction="up" {...props} />; }

class PatientDetailWidget extends Component {
  constructor (props) {
    super(props);
    this.state = {
      editingProfile: {}, chosenPatientTagsList: [], showConfirmingDlg: false, chosenPatientImagesList: [], chosenPatientDocumentsList: [],
      tabIndex: 0, galleryTabIndex: 0, chosenPatientDiagnosticsList: [], disabledEditingStatue: true, editButtonLabel: 'Edit Profile',
      birthdayforComponent: new Date(), bed: '', name: '', email: '', notes: '', phone: '', observation: '', uploadingProgress: 0,
      uploadingImageType: 'CASE', thumburl: '', url: '', currentDetailCaseIndex: 0, notesContent: '', currentUser: '',
      rotate: 0, reversed: false, greyscale: false, description: '', openDetailCaseDlg: false, mediaType: 'image', case_date: new Date(),
      currentRemovingItem: 'NONE', uploadingMedia: false, openDetailDocumentDlg: false, currentDetailDocumentIndex: 0, currentDoumentDescription: '', currentDocumentFilename: '',
      savingPatientProfile: false, savingDetailCaseImage: false, diagFilterName: '', tagFilterName: '', chosableDiagnosticsList: [], chosableTagsList: [],
      draggingFilesToUplaod: false, droppedFilesToUpload: false, uploadingFileList: [], activeStep: 0, currentDroppedOneImage: null, detailCaseImageCropping: false,
      detailImageButtonEnable: true, presentationSettingDlg: false, presentationLogoSetting: 'top-left', presentationEvolutionVisible: false
    }

    this.clipboardForDate = new Date();
    this.pDocListener = null;

    this.detailCaseImageViewCanvasRef = React.createRef();

    this.patientAvatarStorageRef = this.patientImageStorageRef = this.patientImagesRef = this.patientDocumentRef = this.userNotesRef =
      this.patientsRef = this.patientTagsRef = this.patientDiagnosticsRef = this.tagRef = this.diagnosticsRef = null;

    this.googleLogin = this.googleAccessToken = this.googleRefreshToken = null;

    this.handleChangeSpecificState = this.handleChangeSpecificState.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleDetailCaseTimeChange = this.handleDetailCaseTimeChange.bind(this);
    this.handleDetailCaseDateChange = this.handleDetailCaseDateChange.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleTabIndexChange = this.handleTabIndexChange.bind(this);
    this.handleGalleryTabChange = this.handleGalleryTabChange.bind(this);
    this.handleGalleryTabIndexChange = this.handleGalleryTabIndexChange.bind(this);
    this.handleToggleDiagnostics = this.handleToggleDiagnostics.bind(this);
    this.handleToggleTags = this.handleToggleTags.bind(this);
    this.saveChangedItems = this.saveChangedItems.bind(this);
    this.handleConfirmRemoveItem = this.handleConfirmRemoveItem.bind(this);
    this.handleRemoveItem = this.handleRemoveItem.bind(this);
    this.handleEditPatientProfile = this.handleEditPatientProfile.bind(this);
    this.uploadSelectedProfileAvatar = this.uploadSelectedProfileAvatar.bind(this);
    this.handleUploadFiles = this.handleUploadFiles.bind(this);
    this.handleTryToUploadAvatar = this.handleTryToUploadAvatar.bind(this);
    this.handleTryToUploadCaseImage = this.handleTryToUploadCaseImage.bind(this);
    this.handleTryToUploadCaseDocument = this.handleTryToUploadCaseDocument.bind(this);
    this.handleUploadDocFiles = this.handleUploadDocFiles.bind(this);
    this.saveChangedPatientProfile = this.saveChangedPatientProfile.bind(this);
    this.handleViewDetailCase = this.handleViewDetailCase.bind(this);
    this.handleCloseDetailView = this.handleCloseDetailView.bind(this);
    this.handleDeleteCurrentPatient = this.handleDeleteCurrentPatient.bind(this);
    this.handleDeleteCurrentCaseImage = this.handleDeleteCurrentCaseImage.bind(this);
    this.handleRotateCurrentCaseImage = this.handleRotateCurrentCaseImage.bind(this);
    this.handleReverseCurrentCaseImage = this.handleReverseCurrentCaseImage.bind(this);
    this.handleToggleCropImage = this.handleToggleCropImage.bind(this);
    this.handleMakeGreyCurrentCaseImage = this.handleMakeGreyCurrentCaseImage.bind(this);
    this.handleSaveDetail = this.handleSaveDetail.bind(this);
    this.handleCancelEditPatientProfile = this.handleCancelEditPatientProfile.bind(this);
    this.handleViewPreviousCaseImage = this.handleViewPreviousCaseImage.bind(this);
    this.handleViewNextCaseImage = this.handleViewNextCaseImage.bind(this);
    this.autoCheckSize = this.autoCheckSize.bind(this);
    this.handleSetCurrentCaseImage = this.handleSetCurrentCaseImage.bind(this);
    this.handleSaveNotes = this.handleSaveNotes.bind(this);
    this.handleViewDetailDocument = this.handleViewDetailDocument.bind(this);
    this.handleCloseDetailDocumentDlg = this.handleCloseDetailDocumentDlg.bind(this);
    this.handleTryToRemoveCurrentDocument = this.handleTryToRemoveCurrentDocument.bind(this);
    this.handleDeleteCurrentDocument = this.handleDeleteCurrentDocument.bind(this);
    this.handleSaveCurrentDocument = this.handleSaveCurrentDocument.bind(this);
    this.handleEditDetailDocument = this.handleEditDetailDocument.bind(this);
    this.handleChangeDiagsFilterName = this.handleChangeDiagsFilterName.bind(this);
    this.handleChangeTagsFilterName = this.handleChangeTagsFilterName.bind(this);
    this.handleResetChosableDiagsList = this.handleResetChosableDiagsList.bind(this);
    this.handleResetChosableTagsList = this.handleResetChosableTagsList.bind(this);
    this.clearSearchNameFilteringValue = this.clearSearchNameFilteringValue.bind(this);
    this.handleDropMediaFiles = this.handleDropMediaFiles.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.handleStepChange = this.handleStepChange.bind(this);
    this.handleUploadingMediaFileDateChange = this.handleUploadingMediaFileDateChange.bind(this);
    this.handleSetCurrentDroppedImage = this.handleSetCurrentDroppedImage.bind(this);
    this.handleSaveAllDroppedImages = this.handleSaveAllDroppedImages.bind(this);
    this.handleCopyDateToClipboard = this.handleCopyDateToClipboard.bind(this);
    this.handlePasteDateFromClipboard = this.handlePasteDateFromClipboard.bind(this);
    this.handleSetCropState = this.handleSetCropState.bind(this);
    this.handlePopupDetailCaseSnackBar = this.handlePopupDetailCaseSnackBar.bind(this);
    this.handleMakeGooglePresentation = this.handleMakeGooglePresentation.bind(this);
    this.handleSavePresentationSetting = this.handleSavePresentationSetting.bind(this);
    this.handlePresentationCreattingNo = this.handlePresentationCreattingNo.bind(this);
    this.handlePresentationCreattingYes = this.handlePresentationCreattingYes.bind(this);
    this.handleChangeSpecificCheckState = this.handleChangeSpecificCheckState.bind(this);
  }

  componentDidUpdate(prevProps) {
    // console.log(prevProps.patient.id, ' VS ', this.props.patient.id)
    if (prevProps.patient.id === this.props.patient.id &&
      prevProps.patient.value.bed === this.props.patient.value.bed &&
      prevProps.patient.value.name === this.props.patient.value.name &&
      prevProps.patient.value.email === this.props.patient.value.email &&
      prevProps.patient.value.notes === this.props.patient.value.notes &&
      prevProps.patient.value.observation === this.props.patient.value.observation &&
      prevProps.patient.value.phone === this.props.patient.value.phone &&
      prevProps.patient.value.thumburl === this.props.patient.value.thumburl &&
      prevProps.patient.value.url === this.props.patient.value.url) return

    this.invalidateDatabaseRefs();
  }

  initializeAllVariables() {
    var timestamp = this.props.patient.value.birthday;
    if (typeof timestamp === 'string') {
      var strTime = timestamp.split('/').join('.');
      var pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
      timestamp = new Date(strTime.replace(pattern, '$3-$2-$1'));
    }

    this.setState((prevState, props) => ({
      chosenPatientTagsList: [],
      chosenPatientImagesList: [],
      chosenPatientDocumentsList: [],
      checkedChosableTagsItems: [],
      checkedChosableDiagnosticsItems: [],
      chosenPatientDiagnosticsList: [],
      expanded: null,
      birthdayforComponent: new Date(timestamp),
      bed: props.patient.value.bed,
      name: props.patient.value.name,
      email: props.patient.value.email,
      notes: props.patient.value.notes,
      observation: props.patient.value.observation || '',
      phone: props.patient.value.phone,
      thumburl: props.patient.value.thumburl || '',
      url: props.patient.value.url,
      currentDetailCaseIndex: 0,
    }));
  }

  handleCancelEditPatientProfile = () => {
    var timestamp = this.props.patient.value.birthday;
    if (typeof timestamp === 'string') {
      var strTime = timestamp.split('/').join('.');
      var pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
      timestamp = new Date(strTime.replace(pattern, '$3-$2-$1'));
    }

    this.setState((prevState, props) => ({
      birthdayforComponent: new Date(timestamp),
      bed: props.patient.value.bed,
      name: props.patient.value.name,
      email: props.patient.value.email,
      notes: props.patient.value.notes,
      observation: props.patient.value.observation || '',
      phone: props.patient.value.phone,
      thumburl: props.patient.value.thumburl || '',
      url: props.patient.value.url,
    }))
    this.handleEditPatientProfile(false);
  }

  invalidateDatabaseRefs() {
    this.initializeAllVariables();
    this.patientTagsRef = Database.ref('/patienttags').child(this.props.patient.id);
    this.patientDiagnosticsRef = Database.ref('/patientdiagnosis').child(this.props.patient.id);;
    this.patientsRef = Database.ref('/patients').child(Auth.currentUser.uid).child(this.props.patient.id);
    this.patientImagesRef = Database.ref('patientimages').child(this.props.patient.id);
    this.patientDocumentRef = Database.ref('patientdocuments').child(this.props.patient.id);
    this.patientImageStorageRef = Storage.ref('patientimages').child(this.props.patient.id);
    this.patientDocumentStorageRef = Storage.ref('patientdocuments').child(this.props.patient.id);
    this.patientAvatarStorageRef = Storage.ref('patient_profile_image').child(this.props.patient.id);

    this.patientDocumentRef.orderByChild('timestamp').on('value', (snapshot) => {
      if (this.props.patient.id !== snapshot.key) return;
      let chosenPatientDocumentsList = [];
      snapshot.forEach(function (child) {
        chosenPatientDocumentsList.unshift({ id: child.key, value: child.val() });
      });
      this.setState({ chosenPatientDocumentsList });
    })

    this.patientImagesRef.orderByChild('case_date').on('value', async (snapshot) => {
      if (this.props.patient.id !== snapshot.key) return;
      let chosenPatientImagesList = [];
      /**
       *  case_date: "1545607869498"
          description: ""
          filename: "-LUSYc_4h-JdqLySef6P.jpeg"
          greyscale: 0
          reversed: 0
          rotation: 0
          media: 'video'
          thumburl: "https://firebasestorage.googleapis.com/v0/b/doctocases.appspot.com/o/patientimages%2F-LUReJSWvN88K62m7XYq%2F-LUSYc_4h-JdqLySef6P.jpeg?alt=media&token=b014862d-4764-47de-9ac6-0228db5046d6"
          timestamp: "1545607869498"
          url: "gs://.........."
       */
      await snapshot.forEach(function (child) {
        // console.log('Patient Images :', child.val());
        chosenPatientImagesList.push({ id: child.key, value: child.val() });
      });

      if (chosenPatientImagesList.length > 0) {
        var showingCaseIndex = 0;
        if (this.state.chosenPatientImagesList.length > 0) {
          const curCaseImage = this.state.chosenPatientImagesList[this.state.currentDetailCaseIndex];
          curCaseImage && (showingCaseIndex = chosenPatientImagesList.findIndex(element => element.id === curCaseImage.id));
        }
        if (showingCaseIndex > -1) this.setState({ chosenPatientImagesList }, () => this.handleSetCurrentCaseImage(showingCaseIndex));
        else this.setState({ chosenPatientImagesList });
      } else {
        this.setState({ chosenPatientImagesList }, this.handleCloseDetailView);
      }
    })

    this.patientTagsRef.orderByChild('timestamp').on('value', (snapshot) => {
      if (this.props.patient.id !== snapshot.key) return;
      let chosenPatientTagsList = [];

      snapshot.forEach(function (child) {
        chosenPatientTagsList.unshift({ id: child.key, value: child.val() });
      });
      this.setState({ chosenPatientTagsList }, this.handleResetChosableTagsList);
    })

    this.patientDiagnosticsRef.orderByChild('timestamp').on('value', (snapshot) => {
      if (this.props.patient.id !== snapshot.key) return;
      let chosenPatientDiagnosticsList = [];

      snapshot.forEach(function (child) {
        chosenPatientDiagnosticsList.unshift({ id: child.key, value: child.val() });
      });
      this.setState({ chosenPatientDiagnosticsList }, this.handleResetChosableDiagsList);
    })
  }

  componentWillMount() {
    this.invalidateDatabaseRefs();
    if (!Auth.currentUser) return;
    var userId = Auth.currentUser.uid;

    this.googleLogin = Auth.currentUser.emailVerified
    this.googleRefreshToken = Auth.currentUser.refreshToken
    this.googleAccessToken = Auth.currentUser.ra

    this.tagRef = Database.ref('/tags').child(userId);
    this.diagnosticsRef = Database.ref('/diagnosis').child(userId);

    Object.assign(document.body, {
      ondragend: e => this.handleDragEnd(e),
      ondragleave: e => this.handleDragLeave(e),
      ondragover: e => this.handleDragOver(e),
      ondragstart: e => { console.log(e); },
      ondrop: e => this.handleDropMediaFiles(e)
    });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.autoCheckSize);
    this.tagRef = this.diagnosticsRef = this.patientImagesRef = this.patientTagsRef = this.patientDiagnosticsRef = null;
  }

  componentDidMount() {
    window.removeEventListener("resize", this.autoCheckSize);
  }

  handleSaveNotes = () => {
    this.saveChangedPatientProfile();
  }

  saveChangedItems = (ref, child, addMethod = true) => {
    var selectedItemRefName = 'diagnosticsRef', selectedItemOrigin = null; // tagRef
    var addingValue = {};

    if (!addMethod) {
      this[ref].child(child.id).remove();
      if (ref === 'patientTagsRef') selectedItemRefName = 'tagRef';
    }
    else {
      if (ref === 'patientDiagnosticsRef') {
        addingValue = {
          checked: true,
          cid10: child.value.cid10,
          code: "",
          description: child.value.description,
          key: child.id,
          severity: '',
          timestamp: String(Date.now())
        }
      } else if (ref === 'patientTagsRef') {
        selectedItemRefName = 'tagRef';
        addingValue = {
          checked: true,
          color: child.value.color,
          description: child.value.description,
          key: child.id,
          selectedstatus: false,
          timestamp: String(Date.now())
        }
      }
    }

    this[ref].child(child.id).set(addingValue);

    this.saveChangedPatientProfile();

    if (ref === 'patientDiagnosticsRef') selectedItemOrigin = this.props.diagnosticsList.find(element => element.id === child.id);
    else if (ref === 'patientTagsRef') selectedItemOrigin = this.props.tagsList.find(element => element.id === child.id);

    if (!selectedItemOrigin) return;
    var nextItemContent = Object.assign({}, selectedItemOrigin.value);
    nextItemContent.timestamp = String(Date.now())
    this[selectedItemRefName].child(child.id).set(nextItemContent)
  }

  handleToggleDiagnostics = itemID => () => {
    var chosenItemIndex = this.state.chosenPatientDiagnosticsList.findIndex(element => element.id === itemID);
    if (chosenItemIndex > -1) {
      var array = [...this.state.chosenPatientDiagnosticsList];
      array.splice(chosenItemIndex, 1);
      this.saveChangedItems('patientDiagnosticsRef', this.state.chosenPatientDiagnosticsList[chosenItemIndex], false);
      this.setState({ chosenPatientDiagnosticsList: array });
    }
    else {
      var allItemsIndex = this.props.diagnosticsList.findIndex(element => element.id === itemID);
      this.setState({ chosenPatientDiagnosticsList: [...this.state.chosenPatientDiagnosticsList, this.props.diagnosticsList[allItemsIndex]] });
      this.saveChangedItems('patientDiagnosticsRef', this.props.diagnosticsList[allItemsIndex]);
    }
  }

  handleToggleTags = itemID => () => {
    var chosenItemIndex = this.state.chosenPatientTagsList.findIndex(element => element.id === itemID);
    if (chosenItemIndex > -1) {
      var array = [...this.state.chosenPatientTagsList];
      array.splice(chosenItemIndex, 1);
      this.saveChangedItems('patientTagsRef', this.state.chosenPatientTagsList[chosenItemIndex], false);
      this.setState({ chosenPatientTagsList: array });
    }
    else {
      var allItemsIndex = this.props.tagsList.findIndex(element => element.id === itemID);
      this.setState({ chosenPatientTagsList: [...this.state.chosenPatientTagsList, this.props.tagsList[allItemsIndex]] });
      this.saveChangedItems('patientTagsRef', this.props.tagsList[allItemsIndex]);
    }
  }

  handleTabChange = (event, tabIndex) => { this.setState({ tabIndex }); }
  handleTabIndexChange = tabIndex => { this.setState({ tabIndex: tabIndex }); }

  handleGalleryTabChange = (event, galleryTabIndex) => { this.setState({ galleryTabIndex }); }
  handleGalleryTabIndexChange = galleryTabIndex => { this.setState({ galleryTabIndex }); }

  handleDateChange = date => { this.setState({ birthdayforComponent: date }); };
  handleDetailCaseDateChange = date => {
    var time = (new Date(this.state.case_date).getTime() - new Date().getTimezoneOffset() * 60 * 1000) % (1000 * 60 * 60 * 24)
    this.setState({ case_date: new Date(new Date(date).getTime() + time) })
  };

  handleDetailCaseTimeChange = date => { this.setState({ case_date: date }) }

  handleChangeSpecificState = prop => event => { this.setState({ [prop]: event.target.value }); }
  handleChangeSpecificCheckState = prop => event => { this.setState({ [prop]: event.target.checked }); }

  handleConfirmRemoveItem = confirming => {
    if (confirming && this.state.currentRemovingItem === 'PATIENT') this.handleDeleteCurrentPatient();
    else if (confirming && this.state.currentRemovingItem === 'CASE') this.handleDeleteCurrentCaseImage();
    else if (confirming && this.state.currentRemovingItem === 'DOCUMENT') this.handleDeleteCurrentDocument();
    this.setState({ showConfirmingDlg: false });
  }

  handleRemoveItem = (category) => { this.setState(prevState => ({ currentRemovingItem: category, showConfirmingDlg: !prevState.showConfirmingDlg })); }

  handleEditPatientProfile = (bSaving = true) => {
    var nextEditButtonLabel = this.state.disabledEditingStatue ? "Save Profile" : "Edit Profile";
    if (bSaving && !this.state.disabledEditingStatue) {
      this.saveChangedPatientProfile()
    }
    this.setState(prevState => ({ disabledEditingStatue: !prevState.disabledEditingStatue, editButtonLabel: nextEditButtonLabel }));
  }

  handleTryToUploadAvatar = () => {
    if (this.state.disabledEditingStatue) return;
    this.setState({ uploadingImageType: 'AVATAR' }, () => {
      document.getElementById('photoUploadInput').click();
    })
  }

  handleTryToUploadCaseImage = () => {
    this.setState({ uploadingImageType: 'CASE' }, () => {
      document.getElementById('photoUploadInput').click();
    })
  }

  handleTryToUploadCaseDocument = () => {
    document.getElementById('documentUploadInput').click();
  }

  handleUploadDocFiles = event => {
    const fileList = event.target.files || event.dataTransfer.files;

    const length = fileList.length;
    for (var i = 0; i < length; i++) {
      let file = fileList[i];
      if (String(file.type).indexOf('pdf') < 0) {
        this.props.enqueueSnackbar('Only pdf files are acceptable...', { variant: 'warning' });
        continue;
      }
      let filenames = file.name.split('.');
      filenames.pop();
      var fileExtention = 'pdf';
      const newPostKey = this.patientDocumentRef.push().key;
      this.setState({ uploadingMedia: true, uploadingProgress: 0 });
      var uploadTask = this.patientDocumentStorageRef.child(newPostKey + '.' + fileExtention).put(file);
      uploadTask.on('state_changed', snapshot => {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.setState({ uploadingProgress: progress });
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case 'paused': // or 'paused'
            console.log('Upload is paused');
            break;
          case 'running': // or 'running'
            console.log('Upload is running');
            break;
          default:
            break;
        }
      }, error => {
        this.setState({ uploadingMedia: false });
        console.log(error);
      }, () => {
        uploadTask.snapshot.ref.getDownloadURL().then(url => {
          this.patientDocumentRef.child(newPostKey).set({
            description: "",
            filename: filenames.join('.'),
            thumburl: url,
            timestamp: String(Date.now()),
            url: "gs://" + uploadTask.snapshot.ref.bucket + "/patientdocuments/" + this.props.patient.id + "/" + newPostKey + '.' + fileExtention
          });
          this.saveChangedPatientProfile();
        })
        this.setState({ uploadingMedia: false, uploadingProgress: 0 });
      });
    }
  }

  handleUploadFiles = event => {
    const fileList = event.target.files || event.dataTransfer.files;

    if (fileList && fileList[0] && this.state.uploadingImageType === 'CASE') {
      const length = fileList.length;
      for (var i = 0; i < length; i++) {
        let file = fileList[i];
        if (String(file.type).indexOf('image') < 0) {
          this.props.enqueueSnackbar('Only image files are acceptable...', { variant: 'warning' });
          continue;
        }
        let fileExtention = file.type.split('/')[1] || 'jpeg', mediaType = file.type.split('/')[0];
        if (file.type.indexOf('/') < 0) {
          fileExtention = file.name.split('.')[1]
          mediaType = 'video'
        }
        const newPostKey = this.patientImagesRef.push().key;

        this.setState({ uploadingMedia: true, uploadingProgress: 0 });
        let uploadTask = this.patientImageStorageRef.child(newPostKey + '.' + fileExtention).put(file);
        uploadTask.on('state_changed', snapshot => {
          var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.setState({ uploadingProgress: progress });
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused': // or 'paused'
              console.log('Upload is paused');
              break;
            case 'running': // or 'running'
              console.log('Upload is running');
              break;
            default:
              break;
          }
        }, error => {
          this.setState({ uploadingMedia: false });
          console.log(error);
        }, () => {
          uploadTask.snapshot.ref.getDownloadURL().then(url => {
            this.patientImagesRef.child(newPostKey).set({
              case_date: String(Math.floor(new Date().getTime())),
              description: "",
              filename: newPostKey + '.' + fileExtention,
              greyscale: 0,
              reversed: 0,
              rotation: 0,
              media: mediaType,
              thumburl: url,
              timestamp: String(Date.now()),
              url: "gs://" + uploadTask.snapshot.ref.bucket + "/patientimages/" + this.props.patient.id + "/" + newPostKey + '.' + fileExtention
            });
            this.saveChangedPatientProfile();
          })
          this.setState({ uploadingMedia: false });
        });
      }
    } else if (fileList && fileList[0] && this.state.uploadingImageType === 'AVATAR') {
      const file = fileList[0];
      this.setState({ tempAvatarfile: file });
      var reader = new FileReader();
      reader.onload = e => { this.setState({ thumburl: e.target.result }); }
      reader.readAsDataURL(file);
    }
  }

  uploadSelectedProfileAvatar = () => {
    var file = this.state.tempAvatarfile;
    this.patientAvatarStorageRef.put(file)
      .then(snapshot => {
        snapshot.ref.getDownloadURL().then(url => {
          this.setState({
            thumburl: url,
            url: "gs://" + snapshot.ref.bucket + "/patient_profile_image/" + this.props.patient.id
          }, this.saveChangedPatientProfile);
        })
      })
      .catch(error => console.log(error));
  }

  saveChangedPatientProfile = () => {
    var { bed, name, email, notes, phone, observation, thumburl, url } = this.state;
    // var birthdayforComponent = this.state.birthdayforComponent || new Date();
    // var strBirthday = getDDMMYYYYFormatFromDate(birthdayforComponent);
    var birthdayTimestamp = new Date(this.state.birthdayforComponent).getTime()

    this.setState({ savingPatientProfile: true });

    var changedProfile = {
      bed: bed,
      birthday: birthdayTimestamp,
      email: email,
      lastupdate: String(Date.now()),
      name: name,
      observation: observation || '',
      notes: notes,
      phone: phone,
      thumburl: thumburl,
      url: url || ''
    }
    this.patientsRef.set(changedProfile, (error) => {
      if (error) {
        // The write failed...
      } else {
        // Data saved successfully!
      }
      this.setState({ savingPatientProfile: false, savingDetailCaseImage: false });
    })
  }

  handleViewDetailCase = (patientCaseIndex) => {
    this.setState({ openDetailCaseDlg: true }, this.handleSetCurrentCaseImage(patientCaseIndex));
  }

  handleViewDetailDocument = (patientDocumentIndex) => {
    window.open(this.state.chosenPatientDocumentsList[patientDocumentIndex].value.thumburl);
  }

  handleEditDetailDocument = (index) => {
    this.setState(prevState => ({
      openDetailDocumentDlg: true,
      currentDetailDocumentIndex: index,
      currentDoumentDescription: prevState.chosenPatientDocumentsList[index].value.description,
      currentDocumentFilename: prevState.chosenPatientDocumentsList[index].value.filename,
    }));
  }

  handleCloseDetailDocumentDlg = () => {
    this.setState({ openDetailDocumentDlg: false, currentDetailDocumentIndex: 0 });
  }

  handleTryToRemoveCurrentDocument = (index) => {
    this.setState({
      currentRemovingItem: 'DOCUMENT',
      showConfirmingDlg: true,
      currentDetailDocumentIndex: index
    });
  }

  handleDeleteCurrentDocument = () => {
    var index = this.state.currentDetailDocumentIndex;
    this.patientDocumentRef.child(this.state.chosenPatientDocumentsList[index].id).remove();
    this.patientDocumentStorageRef.child(this.state.chosenPatientDocumentsList[index].id + '.pdf').delete().catch(error => { });
    this.setState({ openDetailDocumentDlg: false, currentDetailDocumentIndex: index - 1 });
  }

  onDocumentLoadSuccess = ({ numPages }) => { this.setState({ numPages }); }

  handleCloseDetailView = () => { this.setState({ openDetailCaseDlg: false }); };

  handleDeleteCurrentCaseImage = () => {
    if (this.state.chosenPatientImagesList.length === 1) this.handleCloseDetailView()
    this.patientImagesRef.child(this.state.chosenPatientImagesList[this.state.currentDetailCaseIndex].id).remove();
    this.patientImageStorageRef.child(this.state.chosenPatientImagesList[this.state.currentDetailCaseIndex].value.filename).delete().catch(error => { });
    this.handleViewDetailCase(Math.max(this.state.currentDetailCaseIndex - 1, 0));
  }

  handleSaveDetail = async () => {
    this.setState({ detailImageButtonEnable: false });
    const curCaseImage = this.state.chosenPatientImagesList[this.state.currentDetailCaseIndex];
    if (curCaseImage.value.media === 'video') {
      const objSavingData = {
        case_date: String(Date.parse(this.state.case_date)),
        description: this.state.description,
        filename: curCaseImage.value.filename,
        greyscale: curCaseImage.value.greyscale,
        reversed: 0,
        media: curCaseImage.value.media,
        rotation: 0,
        thumburl: curCaseImage.value.thumburl,
        timestamp: String(Date.now()),
        url: curCaseImage.value.url
      };
      this.setState({ savingDetailCaseImage: true });
      this.patientImagesRef.child(curCaseImage.id).set(objSavingData)
        .then(res => {
          this.setState({ savingDetailCaseImage: false });
        }).catch(err => { console.log(err); })
      return;
    }

    let arrNewFileName = ''
    if (curCaseImage.value && curCaseImage.value.filename) arrNewFileName = curCaseImage.value.filename.split('.')
    else arrNewFileName = String('patient-image-' + Date.now() + '.png').split('.')

    arrNewFileName.pop(); arrNewFileName.push('.png');
    let strNewFileName = arrNewFileName.join('')

    let newGsURL = curCaseImage.value.url.split('/')
    newGsURL.pop(); newGsURL.push(strNewFileName)

    this.setState({ savingDetailCaseImage: true });

    const objSavingData = {
      case_date: String(Date.parse(this.state.case_date)),
      description: this.state.description,
      filename: strNewFileName,
      greyscale: this.state.greyscale,
      reversed: 0,
      media: this.state.mediaType,
      rotation: 0,
      thumburl: curCaseImage.value.thumburl,
      timestamp: String(Date.now()),
      url: newGsURL.join('')
    };
    console.log('Start....')
    var result = await this.detailCaseImageViewCanvasRef.current.handleSaveToSpecificURL(this.patientImageStorageRef, curCaseImage.value.filename, strNewFileName, this.patientImagesRef.child(curCaseImage.id), objSavingData, (progress) => { this.setState({ uploadingProgress: progress }) });
    // if ( !result ) this.props.enqueueSnackbar('Avoid to save Case Image. Try again...', { variant: 'warning' });
    console.log('Finished....')
    this.saveChangedPatientProfile();
  }

  handleSaveCurrentDocument = () => {
    const curDocument = this.state.chosenPatientDocumentsList[this.state.currentDetailDocumentIndex];
    if (!curDocument.id) return;
    this.patientDocumentRef.child(curDocument.id).set({
      description: this.state.currentDoumentDescription,
      filename: this.state.currentDocumentFilename,
      thumburl: curDocument.value.thumburl,
      timestamp: String(Date.now()),
      url: curDocument.value.url
    });
    this.saveChangedPatientProfile();
  }

  handleViewPreviousCaseImage = () => {
    var showingCaseIndex = (this.state.currentDetailCaseIndex - 1 + this.state.chosenPatientImagesList.length) % this.state.chosenPatientImagesList.length;
    this.handleSetCurrentCaseImage(showingCaseIndex);
  }

  handleViewNextCaseImage = () => {
    var showingCaseIndex = (this.state.currentDetailCaseIndex + 1) % this.state.chosenPatientImagesList.length;
    this.handleSetCurrentCaseImage(showingCaseIndex);
  }

  handleSetCurrentCaseImage(index) {
    this.setState(prevState => ({
      currentDetailCaseIndex: index,
      rotate: prevState.chosenPatientImagesList[index].value.rotation || 0,
      description: prevState.chosenPatientImagesList[index].value.description || '',
      reversed: prevState.chosenPatientImagesList[index].value.reversed || false,
      greyscale: prevState.chosenPatientImagesList[index].value.greyscale || false,
      mediaType: prevState.chosenPatientImagesList[index].value.media || 'image',
      case_date: new Date(parseInt(prevState.chosenPatientImagesList[index].value.case_date))
    }));
  }

  handleRotateCurrentCaseImage = () => { this.setState(prevProps => ({ rotate: (prevProps.rotate + 90) % 360 })); }
  handleReverseCurrentCaseImage = () => { this.setState(prevProps => ({ reversed: !prevProps.reversed })); }
  handleMakeGreyCurrentCaseImage = () => { this.setState(prevProps => ({ greyscale: !prevProps.greyscale })); }
  handleToggleCropImage = () => {
    if (!this.detailCaseImageViewCanvasRef.current) return;
    this.detailCaseImageViewCanvasRef.current.handleToggleCropMode()
  }
  handleDeleteCurrentPatient = () => {
    // Storage Deleting.
    // this.patientImageStorageRef.delete();
    var { chosenPatientImagesList, chosenPatientDocumentsList } = this.state;
    var eachOne = chosenPatientImagesList.pop();
    while (eachOne) {
      this.patientImageStorageRef.child(eachOne.value.filename).delete();
      eachOne = chosenPatientImagesList.pop();
    }
    // this.patientDocumentStorageRef.delete();
    eachOne = chosenPatientDocumentsList.pop();
    while (eachOne) {
      this.patientDocumentStorageRef.child(eachOne.id + '.pdf').delete();
      eachOne = chosenPatientDocumentsList.pop();
    }

    this.patientAvatarStorageRef.delete();
    // DB Deleting
    this.patientTagsRef.remove();
    this.patientDiagnosticsRef.remove();
    this.patientImagesRef.remove();
    this.patientDocumentRef.remove();
    this.patientsRef.remove();
  }

  autoCheckSize = () => {
    console.log(' resizing.....')
  }

  handleResetChosableDiagsList = () => {
    var chosableDiagnosticsList = [];
    var { diagnosticsList } = this.props;
    var { diagFilterName, chosenPatientDiagnosticsList } = this.state;
    diagnosticsList.forEach(eachDiagnostic =>
      chosenPatientDiagnosticsList.findIndex(element => element.id === eachDiagnostic.id) < 0 &&
      String(eachDiagnostic.value.description).toLowerCase().indexOf(String(diagFilterName).toLowerCase()) >= 0 &&
      chosableDiagnosticsList.push(eachDiagnostic));
    this.setState({ chosableDiagnosticsList });
  }

  handleResetChosableTagsList = () => {
    var chosableTagsList = [];
    var { tagsList } = this.props;
    var { chosenPatientTagsList, tagFilterName } = this.state;
    tagsList.forEach(eachTag =>
      chosenPatientTagsList.findIndex(element => element.id === eachTag.id) < 0 &&
      String(eachTag.value.description).toLowerCase().indexOf(String(tagFilterName).toLowerCase()) >= 0 &&
      chosableTagsList.push(eachTag));
    this.setState({ chosableTagsList });
  }

  handleChangeDiagsFilterName = event => {
    this.setState({ diagFilterName: event.target.value }, this.handleResetChosableDiagsList);
  }

  handleChangeTagsFilterName = event => {
    this.setState({ tagFilterName: event.target.value }, this.handleResetChosableTagsList);
  }

  clearSearchNameFilteringValue = (item) => {
    if (item === 'Diagnostics') this.setState({ diagFilterName: '' }, this.handleResetChosableDiagsList);
    else if (item === 'Tags') this.setState({ tagFilterName: '' }, this.handleResetChosableTagsList);
  }

  handleSetCurrentDroppedImage = (inputIndex = -1) => {
    var index = this.state.activeStep
    if (inputIndex > -1) index = inputIndex

    if (this.state.uploadingFileList.length > 0) {
      if (this.state.uploadingFileList[index].file) {
        let reader = new FileReader();
        reader.onload = e => {
          this.setState({ currentDroppedOneImage: e.target.result });
        }
        reader.readAsDataURL(this.state.uploadingFileList[index].file);
      } else if (this.state.uploadingFileList[index].url) {
        this.setState({ currentDroppedOneImage: this.state.uploadingFileList[index].url });
        fetch(this.state.uploadingFileList[index].url)
          .then(res => res.blob()) // Gets the response and returns it as a blob
          .then(blob => {
            let objectURL = URL.createObjectURL(blob);
            console.log(blob, objectURL)
          });
      }
    }
  }
  handleDropMediaFiles = (event) => {
    event.stopPropagation();
    event.preventDefault();
    var targetId = event.target.id || event.target.parentElement.id
    // document.getElementById('add-document-button').classList.remove('dragging');
    //   document.getElementById('add-media-button').classList.remove('dragging');
    if (targetId === 'add-media-button' && this.state.galleryTabIndex === STATIC_TAB_INDEX.IMAGE_AND_VIDEO) {
      document.getElementById('add-media-button').classList.remove('dragging');

      const fileList = event.dataTransfer.files;
      var uploadingFileList = []
      for (let i = 0; i < fileList.length; i++) {
        let fileType = fileList[i].type;
        if (String(fileType).indexOf('image') < 0 && String(fileType).indexOf('video') < 0) {
          this.props.enqueueSnackbar('Only image/video files are acceptable...', { variant: 'warning' });
          continue;
        }
        var type = 'image'
        if (String(fileType).indexOf('image') < 0) type = 'video'
        uploadingFileList.push({
          filename: fileList[i].name,
          case_date: new Date(),
          mediaType: type,
          file: fileList[i],
          blob: ''
        })
      }
      // if ( uploadingFileList.length < 1 ){
      //   let fileURL = event.dataTransfer.getData('URL');
      //   console.log(fileURL)
      //   uploadingFileList.push({
      //     filename: 'From Browser',
      //     case_date: new Date(),
      //     url: fileURL,
      //     blob: ''
      //   })
      // }
      this.setState({ /*draggingFilesToUplaod: false, */uploadingFileList, droppedFilesToUpload: true }, () => { this.handleSetCurrentDroppedImage(0); })
    } else if (targetId === 'add-document-button' && this.state.galleryTabIndex === STATIC_TAB_INDEX.DOCUMENTS) {
      document.getElementById('add-document-button').classList.remove('dragging');
      this.setState({ /*draggingFilesToUplaod: false,*/ droppedFilesToUpload: false })
      this.handleUploadDocFiles(event);
    } else {
      document.getElementById('add-media-button').classList.remove('dragging');
      document.getElementById('add-document-button').classList.remove('dragging');
      this.setState({ /*draggingFilesToUplaod: false, */droppedFilesToUpload: false })
    }
  }
  handleDragEnd = event => {
    this.setState({ draggingFilesToUplaod: false })
  }
  handleDragOver = event => {
    event.stopPropagation();
    event.preventDefault();

    var targetId = event.target.id || event.target.parentElement.id
    if (this.state.galleryTabIndex === STATIC_TAB_INDEX.IMAGE_AND_VIDEO && targetId === 'add-media-button') {
      // this.setState({ draggingFilesToUplaod: 'Media'})
      document.getElementById('add-media-button').classList.add('dragging');
    } else if (this.state.galleryTabIndex === STATIC_TAB_INDEX.DOCUMENTS && targetId === 'add-document-button') {
      // this.setState({ draggingFilesToUplaod: 'Document'})
      document.getElementById('add-document-button').classList.add('dragging');
    } else {
      document.getElementById('add-document-button').classList.remove('dragging');
      document.getElementById('add-media-button').classList.remove('dragging');
    }
  }
  handleDragLeave = event => {
    var targetId = event.target.id || event.target.parentElement.id
    if (targetId === 'add-media-button' || targetId === 'add-document-button') {
      // this.setState({ draggingFilesToUplaod: false})
      document.getElementById('add-document-button').classList.remove('dragging');
      document.getElementById('add-media-button').classList.remove('dragging');
    }
  }

  handleUploadingMediaFileDateChange = date => {
    var uploadingFileList = Object.assign([], this.state.uploadingFileList)
    for (var i = 0; i < uploadingFileList.length; i++) {
      // this.state.activeStep
      uploadingFileList[i].case_date = date
    }

    this.setState({ uploadingFileList })
  }
  handleSaveAllDroppedImages = () => {
    // function getBase64Image(img) {
    //   var canvas = document.createElement("canvas");
    //   canvas.width = img.width;
    //   canvas.height = img.height;
    //   var ctx = canvas.getContext("2d");
    //   ctx.drawImage(img, 0, 0);
    //   var dataURL = canvas.toDataURL("image/png");
    //   return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    // }

    // var base64 = getBase64Image(document.getElementById("current-dropped-image"));
    // console.log(base64)
    // return;
    var fileList = this.state.uploadingFileList
    const length = fileList.length;

    for (var i = 0; i < length; i++) {
      let eachOneData = fileList[i]
      let file = eachOneData.file;
      let fileExtention = file.type.split('/')[1] || 'jpeg', mediaType = file.type.split('/')[0];
      if (file.type.indexOf('/') < 0) {
        fileExtention = file.name.split('.')[1]
        mediaType = 'video'
      }
      const newPostKey = this.patientImagesRef.push().key;

      this.setState({ uploadingMedia: true, uploadingProgress: 0 });
      let uploadTask = this.patientImageStorageRef.child(newPostKey + '.' + fileExtention).put(file);
      uploadTask.on('state_changed', snapshot => {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.setState({ uploadingProgress: progress });
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case 'paused': // or 'paused'
            console.log('Upload is paused');
            break;
          case 'running': // or 'running'
            console.log('Upload is running');
            break;
          default:
            break;
        }
      }, error => {
        this.setState({ uploadingMedia: false });
        console.log(error);
      }, () => {
        uploadTask.snapshot.ref.getDownloadURL().then(url => {
          this.patientImagesRef.child(newPostKey).set({
            case_date: String(Math.floor(new Date(eachOneData.case_date).getTime())),
            description: "",
            filename: newPostKey + '.' + fileExtention,
            greyscale: 0,
            reversed: 0,
            rotation: 0,
            media: mediaType,
            thumburl: url,
            timestamp: String(Date.now()),
            url: "gs://" + uploadTask.snapshot.ref.bucket + "/patientimages/" + this.props.patient.id + "/" + newPostKey + '.' + fileExtention
          });
          this.saveChangedPatientProfile();
        })
        this.setState({ uploadingMedia: false });
      });
    }
    this.setState({ droppedFilesToUpload: false })
  }
  handleNext = () => {
    this.setState(prevState => ({ activeStep: prevState.activeStep + 1 }), () => { this.handleSetCurrentDroppedImage() });
  }
  handleBack = () => {
    this.setState(prevState => ({ activeStep: prevState.activeStep - 1 }), () => { this.handleSetCurrentDroppedImage() });
  }
  handleStepChange = activeStep => {
    this.setState({ activeStep }, () => { this.handleSetCurrentDroppedImage(activeStep) });
  }
  handleCopyDateToClipboard = () => {
    this.clipboardForDate = Math.floor((new Date(this.state.case_date).getTime() - new Date().getTimezoneOffset() * 60 * 1000) / (1000 * 60 * 60 * 24))
    this.clipboardForDate = this.clipboardForDate * 1000 * 60 * 60 * 24 + (new Date().getTimezoneOffset() * 60 * 1000)
  }
  handlePasteDateFromClipboard = () => {
    var time = (new Date(this.state.case_date).getTime() - new Date().getTimezoneOffset() * 60 * 1000) % (1000 * 60 * 60 * 24)
    this.setState({ case_date: new Date(this.clipboardForDate + time) }, this.handleSaveDetail)
  }
  handleSetCropState = (state) => { this.setState({ detailCaseImageCropping: state }) }
  handlePopupDetailCaseSnackBar = () => {
    this.props.enqueueSnackbar('You need to choose a area holding the mouse button !', { variant: 'warning' });
  }
  handleMakeGooglePresentation = () => {
    this.setState({ presentationSettingDlg: true });
  }
  handleSavePresentationSetting = () => {
    console.log(this.state.presentationLogoSetting, this.state.presentationEvolutionVisible)
    this.setState({ presentationSettingDlg: false });    
    this.setState({ presentationCreattingDlg: true });    
  }

  handlePresentationCreattingYes = () => {
    this.setState({ presentationCreattingDlg: true });
    console.log('You want to create PPTX');
    // jts added google presentation
    
    
    


  }

  handlePresentationCreattingNo = () => {
    this.setState({ presentationCreattingDlg: false });
  }

  render() {
    var { classes, theme } = this.props;

    var { bed, name, email, notes, observation, phone, birthdayforComponent } = this.state;
    var { chosenPatientDiagnosticsList, chosenPatientTagsList, chosenPatientImagesList, chosableDiagnosticsList, chosableTagsList,
      chosenPatientDocumentsList, openDetailDocumentDlg, currentDoumentDescription, currentDocumentFilename, diagFilterName, tagFilterName,
      disabledEditingStatue, editButtonLabel, thumburl, uploadingImageType, uploadingMedia, savingDetailCaseImage, presentationSettingDlg, presentationCreattingDlg,
      draggingFilesToUplaod, droppedFilesToUpload, uploadingFileList, activeStep, currentDroppedOneImage, detailCaseImageCropping } = this.state;

    var maxSteps = uploadingFileList.length

    const { mediaType, reversed, rotate, greyscale, description, case_date, currentDetailCaseIndex } = this.state;

    const patientCase = chosenPatientImagesList[currentDetailCaseIndex] || {};

    var CurrentMediaPlayer = null;
    if (mediaType === 'video' && patientCase.value) CurrentMediaPlayer = <div className={classes.detailCaseVideoContainer}><Player playsInline src={patientCase.value.thumburl} /></div>
    else if (patientCase.value && window.innerWidth < 600) CurrentMediaPlayer = <PatientDetailCaseImageWidget ref={this.detailCaseImageViewCanvasRef} src={patientCase.value.thumburl} rotation={rotate} reversed={!!reversed} grayscaled={!!greyscale} mediaType={mediaType} />
    else if (patientCase.value && window.innerWidth >= 600) CurrentMediaPlayer = <PatientDetailCaseImageWidgetForLaptop ref={this.detailCaseImageViewCanvasRef} src={patientCase.value.thumburl} rotation={rotate} reversed={!!reversed} grayscaled={!!greyscale} mediaType={mediaType} setCropState={this.handleSetCropState} popupSnackBar={this.handlePopupDetailCaseSnackBar} saveImage={this.handleSaveDetail} />

    var CurrentMediaPlayerFooter = null;
    CurrentMediaPlayerFooter = <div className={classes.detailCaseDateTimeContainer}>
      <MuiPickersUtilsProvider utils={DateFnsUtils} >
        {/* <DateTimePicker format="dd/MM/yyyy hh:mm" value={case_date} onChange={this.handleDetailCaseDateChange} label="Last Updated" size="small"/> */}
        <Button variant="contained" size="small" className={classes.dateButton} onClick={this.handleCopyDateToClipboard}> Copy Date </Button>
        <DatePicker keyboard format="dd/MM/yyyy" value={case_date} onChange={this.handleDetailCaseDateChange} label="Case Date" size="small" />
        <Button variant="contained" size="small" className={classes.dateButton} onClick={this.handlePasteDateFromClipboard}> Paste Date </Button>
        <TimePicker keyboard format="hh:mm" value={case_date} onChange={this.handleDetailCaseTimeChange} label="Case Time" size="small" />
      </MuiPickersUtilsProvider>
    </div>

    return (
      <Grid container spacing={24} className={classes.eachPatientViewMainContainer}>

        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Tabs className={classes.tabs} value={this.state.galleryTabIndex} onChange={this.handleGalleryTabChange}
            indicatorColor="secondary" textColor="secondary" fullWidth centered>
            <Tab className={classes.eachTab} label="Profile" icon={<PersonPinIcon />} />
            <Tab className={classes.eachTab} label="Diagnostics & Tags" icon={<img alt="Diagnostics And Tags" src={DiagnosticsImg} style={{ width: 24, height: 24 }} />} />
            <Tab className={classes.eachTab} label="Image & Video" icon={<PhotoCameraIcon />} />
            <Tab className={classes.eachTab} label="Documents" icon={<EventNoteIcon />} />
            <Tab className={classes.eachTab} label="Evolution" icon={<ListAltIcon />} />
          </Tabs>
          <SwipeableViews className={classes.swipeableView} axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'} index={this.state.galleryTabIndex} onChangeIndex={this.handleGalleryTabIndexChange} >
            <TabContainer dir={theme.direction}>
              <Card>
                <CardContent style={{ position: 'relative' }}>
                  {this.googleLogin && <div className={classes.googlePresentation} onClick={this.handleMakeGooglePresentation}>
                    <Tooltip placement="top" title={'Make a Presentation'}>
                      <img src={PresentationImg} />
                    </Tooltip>
                  </div>}
                  <div className={classNames({ [classes.pointerCursor]: !disabledEditingStatue })} onClick={this.handleTryToUploadAvatar}>
                    <ExifImageViewer src={thumburl} mediaSize="lg" />
                  </div>
                  {/* <Avatar className={classNames(classes.avatar, { [classes.pointerCursor]: !disabledEditingStatue })}
                  src={thumburl} onClick={this.handleTryToUploadAvatar}>{thumburl || <PersonIcon/>}</Avatar> */}
                  <FormControl className={classes.formControl} fullWidth>
                    <InputLabel htmlFor="formatted-text-mask-input-name">Name</InputLabel>
                    <Input disabled={disabledEditingStatue} id="formatted-text-mask-input-name" value={name} onChange={this.handleChangeSpecificState('name')} fullWidth />
                  </FormControl>
                  <FormControl className={classes.formControl} fullWidth>
                    <InputLabel htmlFor="formatted-text-mask-input-bed">Bed</InputLabel>
                    <Input disabled={disabledEditingStatue} id="formatted-text-mask-input-bed" value={bed} onChange={this.handleChangeSpecificState('bed')} />
                  </FormControl>
                  <FormControl className={classes.formControl} fullWidth>
                    <InputLabel htmlFor="formatted-text-mask-input-tel">Telephone No</InputLabel>
                    <Input disabled={disabledEditingStatue} value={phone} onChange={this.handleChangeSpecificState('phone')} id="formatted-text-mask-input-tel" />
                  </FormControl>

                  <MuiPickersUtilsProvider utils={DateFnsUtils} aria-label="Birthday">
                    <Fragment>
                      <div className={classes.formControl} style={{ display: 'inline-flex', width: '100%', position: 'relative' }}>
                        <DatePicker disabled={disabledEditingStatue} keyboard label="Birthday" format="dd/MM/yyyy" placeholder="10/10/2018" showTodayButton style={{ flex: 'auto' }}
                          mask={value => value ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/] : []} value={birthdayforComponent}
                          onChange={this.handleDateChange} disableOpenOnEnter animateYearScrolling={false} />
                        <div style={{ fontSize: 16, display: 'flex', flexDirection: 'column-reverse', position: 'absolute', right: 70, bottom: 7 }}>
                          <span style={{ color: 'dimgray' }}>
                            {Math.floor((Date.now() - new Date(birthdayforComponent).getTime()) / 1000 / 60 / 60 / 24 / 365) + ' years old'}
                          </span>
                        </div>
                      </div>
                    </Fragment>
                  </MuiPickersUtilsProvider>

                  <FormControl className={classes.formControl} fullWidth>
                    <InputLabel htmlFor="formatted-text-mask-input-email">Email</InputLabel>
                    <Input disabled={disabledEditingStatue} value={email} onChange={this.handleChangeSpecificState('email')} id="formatted-text-mask-input-email" />
                  </FormControl>

                  <FormControl className={classes.formControl} fullWidth>
                    <InputLabel htmlFor="formatted-text-mask-input-observation">Observation</InputLabel>
                    <Input disabled={disabledEditingStatue} value={observation} onChange={this.handleChangeSpecificState('observation')} id="formatted-text-mask-input-observation" multiline />
                  </FormControl>
                </CardContent>
                <CardActions>
                  <Button style={{ display: !disabledEditingStatue ? 'none' : 'block' }} size="small" color="secondary" onClick={() => this.handleRemoveItem('PATIENT')}> Remove from List</Button>
                  <Button style={{ display: disabledEditingStatue ? 'none' : 'block' }} size="small" color="secondary" onClick={this.handleCancelEditPatientProfile}>Cancel Editing</Button>
                  <div className={classes.wrapperParent}>
                    <div className={classes.wrapper}>
                      <Button disabled={this.state.savingPatientProfile && !disabledEditingStatue} size="small" color="primary" onClick={this.handleEditPatientProfile}
                        className={classNames({ [classes.buttonProgress]: !disabledEditingStatue })}>{editButtonLabel}</Button>
                      {this.state.savingPatientProfile && !disabledEditingStatue && <CircularProgress size={24} className={classes.circlingProgress} />}
                    </div>
                  </div>

                </CardActions>
              </Card>
            </TabContainer>
            <TabContainer dir={theme.direction}>
              <Grid container spacing={8} onDrop={event => this.handleDropMediaFiles(event)} onDragOver={event => this.handleDragOver(event)}>
                <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                  <Grid container spacing={8}>
                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                      <Card>
                        <CardHeader title="New"></CardHeader>
                        <CardContent>
                          <div className={classes.search}>
                            <div className={classes.searchIcon}> <SearchIcon /> </div>
                            <Input value={diagFilterName} onChange={event => this.handleChangeDiagsFilterName(event)} disableUnderline
                              placeholder="Filter ?" classes={{ root: classes.inputRoot, input: classes.inputInput }} />
                            <div className={classes.clearIcon} onClick={() => this.clearSearchNameFilteringValue('Diagnostics')}> <ClearIcon /> </div>
                          </div>
                          {chosableDiagnosticsList.map((eachOne, index) =>
                            <Chip key={index} label={eachOne.value.description} onDelete={this.handleToggleDiagnostics(eachOne.id)}
                              className={classNames(classes.customFullWidth, classes.chip)} color="secondary" variant="outlined" deleteIcon={<DoneIcon />} />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                      <Card>
                        <CardHeader title="Chosen"></CardHeader>
                        <CardContent>
                          {chosenPatientDiagnosticsList.map((eachOne, index) => (
                            <Chip key={index} label={eachOne.value.description} onDelete={this.handleToggleDiagnostics(eachOne.id)}
                              className={classNames(classes.customFullWidth, classes.chip)} color="primary" />
                          ))}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                  <Grid container spacing={8}>
                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                      <Card>
                        <CardHeader title="New"></CardHeader>
                        <CardContent>
                          <div className={classes.search}>
                            <div className={classes.searchIcon}> <SearchIcon /> </div>
                            <Input value={tagFilterName} onChange={event => this.handleChangeTagsFilterName(event)} disableUnderline
                              placeholder="Filter ?" classes={{ root: classes.inputRoot, input: classes.inputInput }} />
                            <div className={classes.clearIcon} onClick={() => this.clearSearchNameFilteringValue('Tags')}> <ClearIcon /> </div>
                          </div>
                          {chosableTagsList.map((eachOne, index) =>
                            <Chip label={eachOne.value.description} onDelete={this.handleToggleTags(eachOne.id)} key={index}
                              avatar={<Avatar style={{ backgroundColor: eachOne.value.color }} ></Avatar>}
                              className={classNames(classes.customFullWidth, classes.chip)} color="secondary" variant="outlined" deleteIcon={<DoneIcon />} />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                      <Card>
                        <CardHeader title="Chosen"></CardHeader>
                        <CardContent>
                          {chosenPatientTagsList.map((eachOne, index) => (
                            <Chip label={eachOne.value.description} onDelete={this.handleToggleTags(eachOne.id)} key={index}
                              avatar={<Avatar style={{ backgroundColor: eachOne.value.color }} ></Avatar>}
                              className={classNames(classes.customFullWidth, classes.chip)} color="primary" variant="outlined" />
                          ))}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </TabContainer>
            <TabContainer dir={theme.direction}>
              <Card>
                <CardContent className={classes.caseImagesContainer}>
                  {uploadingMedia && <LinearProgress color="secondary" variant="determinate" value={this.state.uploadingProgress} />}
                  <Fab id="add-media-button" variant="extended" aria-label="AddImage" className={classes.rightFab} color="primary" onClick={this.handleTryToUploadCaseImage}>
                    <AddIcon className={classes.extendedIcon} /> Click or Drop Images&nbsp;/&nbsp;Video to add
                  </Fab>
                  <input id="photoUploadInput" type="file" accept={uploadingImageType === 'CASE' ? 'image/*,video/*' : 'image/*'} style={{ 'display': 'none' }}
                    onChange={event => this.handleUploadFiles(event)} multiple={uploadingImageType === 'CASE' ? true : false} />
                  <Grid className={classes.gridListRoot}>
                    <GridList cellHeight={240} cols={Math.ceil(window.innerWidth / 300)} className={classes.eachGridList}>
                      {chosenPatientImagesList.map((eachOne, index) => {
                        var eachFileExtension = 'jpeg';
                        var arrNameParts = [];
                        if (typeof eachOne.value.filename === 'string') arrNameParts = eachOne.value.filename.split('.')
                        if (arrNameParts.length > 0) eachFileExtension = arrNameParts[arrNameParts.length - 1]
                        return (
                          <GridListTile key={index} cols={1}>
                            {
                              eachOne.value.media === 'video' ?
                                <Player playsInline src={eachOne.value.thumburl} /> :
                                <img src={eachOne.value.thumburl} alt='' className={classNames({ [classes.GrayScaled]: eachOne.value.greyscale })} />
                            }
                            <GridListTileBar title={new Date(parseInt(eachOne.value.case_date)).toLocaleDateString() + ' - ' + eachFileExtension} subtitle={eachOne.value.description}
                              actionIcon={<IconButton className={classes.icon} onClick={() => this.handleViewDetailCase(index)}> <FormatShapes /> </IconButton>} />
                          </GridListTile>
                        );
                      })}
                    </GridList>
                  </Grid>
                </CardContent>
              </Card>
            </TabContainer>
            <TabContainer dir={theme.direction}>
              <Card>
                <CardContent className={classes.caseImagesContainer}>
                  {uploadingMedia && <LinearProgress color="secondary" variant="determinate" value={this.state.uploadingProgress} />}
                  <Fab id="add-document-button" variant="extended" aria-label="AddImage" className={classes.rightFab} color="primary" onClick={this.handleTryToUploadCaseDocument}>
                    <AddIcon className={classes.extendedIcon} /> Click or Drop Documents to Add
                  </Fab>
                  <input id="documentUploadInput" type="file" accept={'application/pdf'} style={{ 'display': 'none' }}
                    onChange={event => this.handleUploadDocFiles(event)} multiple />
                  <Grid className={classes.gridListRoot}>
                    <List className={classes.listRoot}>
                      {
                        chosenPatientDocumentsList.map((eachOne, index) => (
                          <ListItem key={index} role={undefined} dense button className={classes.eachListItem}>
                            <Fab size="small" onClick={() => this.handleViewDetailDocument(index)} > <OpenInBrowserIcon /> </Fab>
                            <Tooltip placement="top" title={new Date(Date(parseInt(eachOne.value.timestamp))).toLocaleString()} aria-label="Document">
                              <ListItemText primary={eachOne.value.filename} />
                            </Tooltip>
                            <ListItemSecondaryAction style={{ marginRight: 10 }}>
                              <Fab size="small" color='primary' style={{ marginRight: 10 }} onClick={() => this.handleEditDetailDocument(index)} > <EventNoteIcon /> </Fab>
                              <Fab size="small" color='secondary' onClick={() => this.handleTryToRemoveCurrentDocument(index)}> <DeleteIcon /> </Fab>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))
                      }
                    </List>
                  </Grid>
                </CardContent>
              </Card>
            </TabContainer>
            <TabContainer dir={theme.direction}>
              <Paper style={{ padding: 8 }}>
                <TextField id="outlined-full-width" label="Notes to this Patient" multiline
                  placeholder="Type your notes here ..." fullWidth margin="normal" variant="outlined"
                  InputLabelProps={{ shrink: true, }} value={notes} onChange={this.handleChangeSpecificState('notes')} />
                <Button variant="contained" size="small" className={classes.button} onClick={this.handleSaveNotes}>
                  <SaveIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
                  Save Your Notes
                </Button>
              </Paper>
            </TabContainer>
          </SwipeableViews>
        </Grid>

        <Dialog open={this.state.openDetailCaseDlg} TransitionComponent={Transition} keepMounted scroll='paper' fullScreen
          onClose={this.handleCloseDetailView} aria-labelledby="detail-case-title" aria-describedby="detail-case-slide-description" >
          <DialogTitle id="detail-case-title" className={classes.detailDialogTitle}>
            {"Detail of Patient Case"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={32} justify="center">
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                {savingDetailCaseImage && <LinearProgress color="secondary" variant="determinate" value={this.state.uploadingProgress} />}
                {CurrentMediaPlayer}
              </Grid>
              <Grid item className={classes.detailCaseFormControl} xs={12} sm={12} md={12} lg={12} xl={12} style={{ textAlign: 'center' }}>
                <FormControl style={{ maxWidth: 500, width: '75%' }}>
                  <InputLabel htmlFor="detail-case-description">Description</InputLabel>
                  <Input value={description} onChange={this.handleChangeSpecificState('description')} id="detail-case-description" multiline />
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
              <Paper className={classes.buttonPaper} elevation={1}>
                {CurrentMediaPlayerFooter}
              </Paper>
              <Paper className={classes.buttonPaper} elevation={1}>
                <Tooltip placement="top" title="Previous" aria-label="Previous">
                  <IconButton disabled={this.state.savingDetailCaseImage} color="secondary" aria-label="Previous" onClick={this.handleViewPreviousCaseImage}>
                    <LeftIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip placement="top" title="Delete Really?" aria-label="Delete">
                  <Button disabled={this.state.savingDetailCaseImage} className={classes.iconRed} aria-label="Delete" onClick={() => this.handleRemoveItem('CASE')}> <DeleteIcon /> {/*<span className={classes.sectionDesktop}>Delete</span>*/} </Button>
                </Tooltip>
                <Tooltip placement="top" title={"Current : " + rotate} aria-label={"Rotation"}>
                  <Button disabled={this.state.savingDetailCaseImage} className={classes.iconGreen} aria-label="Rotation" onClick={this.handleRotateCurrentCaseImage}> <RotateIcon /> {/*<span className={classes.sectionDesktop}>Rotate</span> */}</Button>
                </Tooltip>
                <Tooltip placement="top" title={"Current : " + (reversed ? "Reversed" : "Original")} aria-label="Reverse">
                  <Button disabled={this.state.savingDetailCaseImage} className={classes.iconBlue} aria-label="Reverse" onClick={this.handleReverseCurrentCaseImage}> <SwapHoriz /> {/*<span className={classes.sectionDesktop}>Reverse</span> */} </Button>
                </Tooltip>
                <Tooltip placement="top" title={"Current : " + (greyscale ? "Grey" : "Colored")} aria-label="Greyscale">
                  <Button disabled={this.state.savingDetailCaseImage} className={classes.iconGrey} aria-label="Greyscale" onClick={this.handleMakeGreyCurrentCaseImage}> <InvertColors /> {/*<span className={classes.sectionDesktop}>Greyscale</span>*/} </Button>
                </Tooltip>
                <Tooltip placement="top" title={"Crop Image"} aria-label="Crop">
                  <Button className={classes.iconYellow} aria-label="Crop" onClick={this.handleToggleCropImage}> {!detailCaseImageCropping ? <CropIcon /> : <CropFreeIcon />} {/*<span className={classes.sectionDesktop}>Greyscale</span>*/} </Button>
                </Tooltip>
                <Tooltip placement="top" title="Next" aria-label="Next">
                  <IconButton color="primary" aria-label="Next" onClick={this.handleViewNextCaseImage}> <RightIcon /></IconButton>
                </Tooltip>
              </Paper>
              <Paper className={classes.buttonPaper} elevation={1}>
                <Button disabled={this.state.savingDetailCaseImage} onClick={this.handleCloseDetailView} size="large" color="secondary" style={{ flex: 1 }}> Cancel </Button>
                <Button disabled={this.state.savingDetailCaseImage} onClick={this.handleSaveDetail} size="large" color="primary" style={{ flex: 1 }}> Save </Button>
              </Paper>
            </div>

          </DialogActions>
        </Dialog>

        <Dialog open={openDetailDocumentDlg} onClose={this.handleCloseDetailDocumentDlg} keepMounted scroll='paper' TransitionComponent={Transition}>
          <DialogTitle id="detail-document-title" className={classes.detailDialogTitle}>
            {"Documentation Description"}
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth>
              <InputLabel htmlFor="detail-document-filename">Filename</InputLabel>
              <Input value={currentDocumentFilename} onChange={this.handleChangeSpecificState('currentDocumentFilename')} id="detail-document-filename" />
            </FormControl>
            <FormControl fullWidth>
              <InputLabel htmlFor="detail-document-description">Description</InputLabel>
              <Input value={currentDoumentDescription} onChange={this.handleChangeSpecificState('currentDoumentDescription')} id="detail-document-description" multiline />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseDetailDocumentDlg} size="large" color="secondary"> Cancel </Button>
            <Button onClick={this.handleSaveCurrentDocument} size="large" color="primary" className={classes.editButton}> Save </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={this.state.showConfirmingDlg} TransitionComponent={Transition} keepMounted
          onClose={this.handleClose} aria-labelledby="alert-dialog-slide-title" aria-describedby="alert-dialog-slide-description" >
          <DialogTitle id="alert-dialog-slide-title"> Remove Really? </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              If you remove this one, you will never return it back.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.handleConfirmRemoveItem(false)} color="primary"> Disagree </Button>
            <Button onClick={() => this.handleConfirmRemoveItem(true)} color="primary"> Agree </Button>
          </DialogActions>
        </Dialog>

        {draggingFilesToUplaod && <div id="drag-drop-panel" className={classes.dragDropPanel}>
          <img alt="DoctorCases" src={DoctorCasesLogo} className={classes.dragDropLogo} />
          <div id="drag-drop-container" className={classes.dragDropTextContainer}>
            <img alt="UploadIcon" src={UploadIcon} className={classes.dragDropUploadIcon} />
            <div className={classes.dragDropText}>{'Drop ' + draggingFilesToUplaod + ' Files Here ...'}</div>
          </div>
        </div>}

        <Dialog open={droppedFilesToUpload} onClose={() => { this.setState({ droppedFilesToUpload: false }) }} aria-labelledby="dropped-media-dlg" >
          <DialogTitle id="dropped-media-dlg">Preview Uploading Files</DialogTitle>
          <DialogContent>
            {uploadingFileList.length > 0 ? <div>
              <Paper square elevation={0} className={classes.eachDropPanel}>
                <Typography>{uploadingFileList[activeStep].filename || ''}</Typography>
              </Paper>
              {
                uploadingFileList[activeStep].mediaType === 'image' ?
                  <img id="current-dropped-image" className={classes.droppedImg} src={currentDroppedOneImage} alt={uploadingFileList[activeStep].filename} /> :
                  <img id="current-dropped-image" className={classes.droppedImg} src={VideoPoster} alt={uploadingFileList[activeStep].filename} />
              }
              <Paper square elevation={0} className={classes.eachDropPanel}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <Fragment>
                    <div className={classes.formControl}>
                      <DatePicker keyboard label="Case Date" format="dd/MM/yyyy" placeholder="10/10/2018" showTodayButton fullWidth
                        mask={value => value ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/] : []} value={uploadingFileList[activeStep].case_date}
                        onChange={this.handleUploadingMediaFileDateChange} disableOpenOnEnter animateYearScrolling={false} />
                    </div>
                  </Fragment>
                </MuiPickersUtilsProvider>
              </Paper>
              <MobileStepper steps={maxSteps} position="static" activeStep={activeStep} className={classes.mobileStepper}
                nextButton={
                  <Button size="small" onClick={this.handleNext} disabled={activeStep === maxSteps - 1}> Next
                    {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                  </Button>}
                backButton={
                  <Button size="small" onClick={this.handleBack} disabled={activeStep === 0}>
                    {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />} Back
                  </Button>}
              />
            </div> : <div> No Media Files Detected...</div>
            }
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { this.setState({ droppedFilesToUpload: false }) }} color="secondary"> CANCEL </Button>
            <Button onClick={this.handleSaveAllDroppedImages} color="primary"> SAVE </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={presentationSettingDlg} onClose={() => { this.setState({ presentationSettingDlg: false }) }} aria-labelledby="presentation-dlg" >
          <DialogTitle id="presentation-setting-title" className={classes.detailDialogTitle}>
            {"Presentation Setting"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={32} justify="center">
              <Typography>{name}</Typography>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Card>
                  <CardHeader title="Logo Position" />
                  <CardContent>
                    <RadioGroup aria-label="Logo Position" name="logo-pos" className={classes.radioGroup} value={this.state.presentationLogoSetting} onChange={this.handleChangeSpecificState('presentationLogoSetting')} >
                      <FormControlLabel value="top-left" control={<Radio />} label="Top Left" />
                      <FormControlLabel value="top-right" control={<Radio />} label="Top Right" />
                      <FormControlLabel value="bottom-left" control={<Radio />} label="Bottom Left" />
                      <FormControlLabel value="bottom-right" control={<Radio />} label="Bottom Right" />
                    </RadioGroup>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Card>
                  <CardHeader title="Evolusion Visible" />
                  <CardContent>
                    <FormControlLabel control={<Switch checked={this.state.presentationEvolutionVisible} onChange={this.handleChangeSpecificCheckState('presentationEvolutionVisible')} value="evolution-visible" />} label="Evolution Visible" />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleSavePresentationSetting} color="secondary" className={classes.editButton}> OK </Button>
          </DialogActions>
        </Dialog>
        {/* iron-tiger-start */}
        <Dialog open={presentationCreattingDlg} onClose={() => { this.setState({ presentationCreattingDlg: false }) }} aria-labelledby="presentation-create-dlg" >
          <DialogTitle id="presentation-create-title" className={classes.detailDialogTitle}>
            {"Do you want to create Presentation?"}
          </DialogTitle>
          <DialogActions>
            <Button onClick={this.handlePresentationCreattingYes} color="secondary" className={classes.editButton}> YES </Button>
            <Button onClick={this.handlePresentationCreattingNo} color="secondary" className={classes.editButton}> NO </Button>
          </DialogActions>
        </Dialog>
        {/* iron-tiger-end */}
      </Grid>
    )
  }
}

PatientDetailWidget.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  patient: PropTypes.object,
  tagsList: PropTypes.array,
  diagnosticsList: PropTypes.array,
  enqueueSnackbar: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(withSnackbar(PatientDetailWidget));
