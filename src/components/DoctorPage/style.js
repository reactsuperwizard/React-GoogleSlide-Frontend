import { fade } from '@material-ui/core/styles/colorManipulator';
import green from '@material-ui/core/colors/green';

const drawerWidth = 280;

const styles = theme => ({
    root: {
      display: 'flex',
      width: '100%'
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      minWidth: 550 + (theme.spacing.unit * 7 + 1),
      left: 0
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginLeft: 12,
      marginRight: 36,
    },
    hide: {
      display: 'none',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
    drawerPaper: {
      width: drawerWidth,
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      ...theme.mixins.toolbar,
      justifyContent: 'space-between',
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      ...theme.mixins.toolbar,
    },
    drawerOpen: {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
      width: theme.spacing.unit * 7 + 1,
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing.unit * 9 + 1,
      },
    },

    content: {
      flexGrow: 1,
      padding: theme.spacing.unit * 1,
      width: `calc(100% - ${theme.spacing.unit * 7 + 1}px)`,
      minWidth: 550
    },
    contentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
    eachPatient: {
      margin: '20px',
    },
    sectionDesktop: {
      display: 'none',
      [theme.breakpoints.up('md')]: {
        display: 'flex',
      },
    },
    sectionMobile: {
      display: 'flex',
      [theme.breakpoints.up('md')]: {
        display: 'none',
      },
    },
    smallAvatar: {
      width: 24,
      height: 24,
      cursor: 'pointer'
    },
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      marginRight: theme.spacing.unit * 2,
      marginLeft: 0,
      width: 'auto',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing.unit * 3,
        // width: 'auto',
      },
    },
    grow: {
      flexGrow: 1,
    },
    searchIcon: {
      [theme.breakpoints.up('md')]: {
        width: 48,
      },
      width: 35,//theme.spacing.unit * 9,
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    clearIcon: {
      [theme.breakpoints.up('md')]: {
        width: 48,
      },
      width: 35,//theme.spacing.unit * 9,
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
      marginRight: 35,
      marginLeft: 35,
      [theme.breakpoints.up('md')]: {
        marginRight: 48,
        marginLeft: 48,
      }
    },
    inputInput: {
      paddingTop: theme.spacing.unit,
      paddingRight: 0,
      paddingBottom: theme.spacing.unit,
      transition: theme.transitions.create('width'),
      width: 120,
      [theme.breakpoints.up('md')]: {
        width: 250,
      },
    },
    newPatientDialogAppbar: {
      position: 'relative',
    },
    flexOne: {
      flex: 1,
    },
    newPatientInput: {
      marginTop: '20px'
  },
  formControl: {
    margin: theme.spacing.unit,
  },
  bigAvatar: {
    margin: 'auto',
    width: 150,
    height: 150,
    cursor: 'pointer'
  },
  customAvatar: {
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontSize: '1.25rem',
    alignItems: 'center',
    flexShrink: 0,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    userSelect: 'none',
    borderRadius: '50%',
    justifyContent: 'center',
  },
  patientNameListItem: {
    paddingRight: 0,
    '& span': {
      fontSize: 14,
      display: 'block',
      display: '-webkit-box',
      maxWidth: '100%',
      height: 30,
      margin: '0 auto',
      fontSize: 14,
      lineHeight: 1,
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'pre-wrap'
    }
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  wrapper: {
    margin: theme.spacing.unit,
    position: 'relative',
  },
  fabAddNewPatient: {
    marginRight: 10
  },
  formContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  nameInAppBar: {
    color: theme.palette.common.white,
    height: 24,
    overflow: 'hidden',
    wordBreak: 'break-all'
  }
});

export default styles;