const styles = theme => ({
    signUnCard: {
        overflow: 'auto',
        maxWidth: 500,
        display: 'flex',
        width: 'fit-content',
        height: 'fit-content',
        padding: 10,
        flexDirection: 'column',
        '& formControl': {
            marginTop: 16,
            marginBottom: 8,
        },
        boxShadow: 'none'
    },
    signUpCardheader: {
        backgroundColor: '#f44336',
        '& span':  { color: 'white', fontWeight: 'bold' }
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