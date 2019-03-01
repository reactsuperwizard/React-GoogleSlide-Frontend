import { fade } from '@material-ui/core/styles/colorManipulator';
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';
import grey from '@material-ui/core/colors/grey';
import yellow from '@material-ui/core/colors/yellow';

const styles = theme => ({
  media: {
    width: '100%',
    height: 'auto',
  },
  formControl: {
    margin: theme.spacing.unit,
  },
  eachPatientViewMainContainer: {
    width: '100%',
    flexDirection: 'row-reverse'
  },
  tabs: {
    minWidth: '50px',
  },
  addExpansionPanel: {
    marginBottom: '10px'
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '60%',
    flexShrink: 0,
    '&:hover': {
      // color: red[800],
    },
  },
  customFullWidth: { 
    width: '100%',
  },
  chip:{
    marginBottom: '15px',
    justifyContent: 'space-between'
  },
  expansionPanelDetails: {
    display: 'block'
  },
  avatar: {
    backgroundColor: 'white',
    color: blue[600],
    width: 200,
    height: 200,
    margin: 'auto',
    '& svg': {
      fontSize: '150px'
    },
  },
  tagClass: {
    marginLeft: '0px',
    color: '#fff',
  },
  swipeableView: {
    margin: '2px'
  },
  extendedIcon: {
    marginRight: theme.spacing.unit,
  },
  rightFab: {
    float: 'right',
    margin: theme.spacing.unit,
  },
  pointerCursor: {
    cursor: 'pointer'
  },
  caseImagesContainer: {
    display: 'grid'
  },
  gridListRoot: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  eachGridList: {
    width: '100%'
  },
  icon: {
    color: 'rgba(255, 255, 255, 0.54)',
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
    },
  },

  detailDialogTitle: {
    textAlign: 'center',
  },
  buttonPaper: {
    flex: 'auto',
    ...theme.mixins.gutters(),
    padding: '4px',
    margin: '8px',
    display: 'flex',
    justifyContent: 'space-around'
  },
  iconRed: {
    color: red,
    backgroundColor: red[100],
    '&:hover': {
      color: red[800],
    },
  },
  iconGreen: {
    color: green,
    backgroundColor: green[100],
    '&:hover': {
      color: green[800],
    },
  },
  iconBlue: {
    color: blue,
    backgroundColor: blue[100],
    '&:hover': {
      color: blue[800],
    },
  },
  iconGrey: {
    color: grey,
    backgroundColor: grey[400],
    '&:hover': {
      color: grey[800],
    },
  },
  iconYellow: {
    color: yellow,
    backgroundColor: yellow[400],
    '&:hover': {
      color: yellow[800],
    },
  },
  GrayScaled: {
    filter: 'grayscale(100%)',
    WebkitFilter: 'grayscale(100%)'
  },
  detailCaseFormControl: {
    padding: '10px'
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  iconSmall: {
    fontSize: 20,
  },
  button: {
    margin: theme.spacing.unit,
  },
  listRoot: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  eachListItem: {
    border: '1px solid #DDD',
    borderRadius: 5
  },


  imgContainer: {
    width: '500',
    height: '500',
    overflow: 'hidden',
  },
  imgContainerRotate90:{
    width: '500',
    height: '500'
  },
  imgContainerRotate270: {
    width: '500',
    height: '500'
  },
  imgContainerRotate90Image: {
    width: '100%',
    transformOrigin: 'top left',
    WebKitTransformOrigin: 'top left',
    MsTransformOrigin: 'top left',
    transform: 'rotate(90deg) translateY(-100%)',
    WebKitTransform: 'rotate(90deg) translateY(-100%)',
    MsTransform: 'rotate(90deg) translateY(-100%)'
  },
  imgContainerRotate180Image: {
    width: '100%',
    transformOrigin: 'top left',
    WebKitTransformOrigin: 'top left',
    MsTransformOrigin: 'top left',
    transform: 'rotate(180deg) translate(-100%, -100%)',
    WebKitTransform: 'rotate(180deg) translate(-100%, -100%)',
    MsTransform: 'rotate(180deg) translateX(-100%, -100%)'
  },
  imgContainerRotate270Image: {
    width: '100%',
    transformOrigin: 'top left',
    WebKitTransformOrigin: 'top left',
    MsTransformOrigin: 'top left',
    transform: 'rotate(270deg) translateX(-100%)',
    WebKitTransform: 'rotate(270deg) translateX(-100%)',
    MsTransform: 'rotate(270deg) translateX(-100%)'
  },
  buttonProgress: {
    marginTop: -16,
    color: green[500],
    position: 'absolute',
  },
  wrapper: {
    // margin: theme.spacing.unit,
    position: 'relative',
  },
  circlingProgress: {
    left: '50%',
    top: '50%'
  },
  wrapperParent:{
    direction: 'rtl',
    flex: 'auto',
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.black, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.black, 0.25),
    },
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 'auto',
    },
    marginBottom: theme.spacing.unit
  },
  searchIcon: {
    width: 48,//theme.spacing.unit * 9,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearIcon: {
    width: 48,//theme.spacing.unit * 9,
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: fade(theme.palette.common.black, 0.25)
    }
  },
  inputRoot: {
    color: 'inherit',
    width: 'auto',
    marginRight: 50,
    marginLeft: 50
  },
  inputInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: 0,
    paddingBottom: theme.spacing.unit,
    paddingLeft: 0,//theme.spacing.unit * 10,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
  },
  eachTab: {
    '& span[class*=labelContainer]': {
      [theme.breakpoints.down('sm')]: {
        display: 'none'
      },
    }
  },
  dragDropPanel: {
    position: 'fixed',
    textAlign: 'center',
    zIndex: 9999,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: green[500],
    top: 0,
    left: 0,
    display: 'flex',
    justifyContent: 'center'
  },
  dragDropText: {
    fontStyle: 'italic',
    color: 'white',
    fontSize: 42,
    margin: 'auto 30px'
  },
  dragDropLogo: {
    position: 'absolute',
    left: window.innerWidth / 2 - 125,
    top: 50,
    width: 250,
    height: 250,
    opacity: 0.5,
    boxShadow: '2px 5px 7px darkgreen',
    borderRadius: '50%',
    pointerEvents: 'none'
  },
  dragDropUploadIcon: {
    boxShadow: '1px 2px 3px grey',
    borderRadius: '50%',
    width: 200,
    height: 200,
    pointerEvents: 'none',
    margin: 'auto 0'
  },
  dragDropTextContainer: {
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    display: 'inline-flex',
    top: window.innerHeight / 2 - 100,
    textAlign: 'center'
  },
  droppedImg: {
    margin: 'auto',
    height: 300,
    display: 'block',
    overflow: 'hidden',
    width: 'auto',
    pointerEvents: 'none'
  },
  eachDropPanel: {
    textAlign: 'center',
  },
  smallSizedOnly: {
    [theme.breakpoints.down('sm')]: {
      display: 'block'
    },
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  galleryEachItem: {
    '& div[class*=video]': {
      pointerEvents: 'none'
    }
  },
  notSmallSizedOnly: {
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    },
    [theme.breakpoints.up('md')]: {
      display: 'block',
    },
  },
  detailCaseDateTimeContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    paddingTop: theme.spacing.unit*4,
    paddingLeft: theme.spacing.unit*3,
    paddingRight: theme.spacing.unit*3,
    justifyContent: 'center'
  },
  detailCaseVideoContainer: {
    margin: 'auto',
    // maxHeight: window.innerHeight*0.7,
    maxWidth: 500
  },
  dateButton: {
    marginBottom: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    marginLeft: theme.spacing.unit,
    marginTop: theme.spacing.unit,
  },
  googlePresentation: {
    position: 'absolute',
    right: 20,
    '& img': {
      width: 40
    },
    '&:hover': {
      opacity: 0.8,
      boxShadow: '1px 2px 3px grey'
    },
    '&:active': {
      opacity: 0.3,
      boxShadow: 'none'
    }
  },
  radioGroup: { 

  }
});

export default styles;