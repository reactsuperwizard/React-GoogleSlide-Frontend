const styles = theme => ({
    signInCardHeader: {
        'background-color': '#f44336',
        'font-weight': 'bold',
        color: 'white',
        '& span': { color: 'white', fontWeight: 'bold' }
    },
    signInCard: {
        overflow: 'auto',
        maxWidth: 500,
        width: 'fit-content',
        height: 'fit-content',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'none',
        padding: 10
    },
    signInFormControl: {
        // 'margin-top': '16px',
        'margin-bottom': '8px'
    },
    leftIcon: {
        marginRight: theme.spacing.unit,
    },
    googleIcon: {
        'margin-right': '20px',
    },
    fab: {
        margin: theme.spacing.unit,
        'background-color': 'white',
        'padding-left': '20px',
        'padding-right': '20px'
    },
    spaceBox: {
        height: 30,
        [theme.breakpoints.up('sm')]: {
            height: 100
          },
    },
    bigAvatar: {
        margin: '0 auto',
        width: '50%',
        height: 'auto',
        marginTop: '3vh',
        marginBottom: '6vh',
        overflow: 'visible',
        boxShadow: '3px 5px 25px grey',
        borderRadius: '50%'
    }
});
export default styles;
