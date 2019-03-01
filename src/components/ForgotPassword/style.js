const styles = theme => ({
    ForgotPasswordCard: {
        maxWidth: 400,
        display: 'flex',
        width: 'fit-content',
        padding: 10,
        flexDirection: 'column',
        '& formControl': {
            marginTop: 16,
            marginBottom: 8,
        },
        boxShadow: 'none'
    },
    ForgotPasswordCardheader: {
        backgroundColor: '#f44336',
        '& span':  { color: 'white', fontWeight: 'bold', fontSize: 20 }
    },
    bigAvatar: {
        margin: '0 auto',
        width: '45%',
        height: 'auto',
        marginTop: '3vh',
        marginBottom: '6vh',
        overflow: 'visible',
        boxShadow: '3px 5px 25px grey',
        borderRadius: '50%'
    }
});
export default styles;