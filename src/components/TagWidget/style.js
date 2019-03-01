import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';

const styles = theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '60%',
    flexShrink: 0,
    '&:hover': {
      // color: red[800],
    },
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  addNewTag: {
    marginBottom: '10px'
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  formContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  fab: {
    float: 'right'
  },
  fabGreen: {
    position: 'absolute',
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
    color: theme.palette.common.white,
    backgroundColor: green[500],
  },
  fabRed: {
    position: 'absolute',
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 4 + 40,
    color: theme.palette.common.white,
    backgroundColor: red[500],
  }
});

export default styles;