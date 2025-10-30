import { makeStyles } from "@material-ui/core";
import { Avatar, Box, Container, Stack, Typography } from "@mui/material";
import self_portrait from '../assets/self_portrait.jpg'
// import useS3FileDownloader from "../loaders/S3FileDownloader";


const useStyles = makeStyles(() => ({
    container: {
        display: 'flex',
        flex: 1,
        width: '100vw',
        height: '92vh',
        paddingTop: '6vh',
        alignItems: 'center',
        justifyContent: 'center'
    },
    stack: {
        textAlign: 'center',
        alignItems: 'center'
    }
}));

const Home = () => {
    const classes = useStyles();
    // const file = useS3FileDownloader({ destFilename: 'self_portrait.jpg' });

    return (
        <Container className={classes.container}>
            <Stack spacing={4} className={classes.stack}>
                <Box>
                    <Typography variant="h2">Michael Lavin</Typography>
                    <Typography variant="h6">FULL-STACK DEVELOPER</Typography>
                </Box>
                <Avatar src={self_portrait} alt="Michael Lavin" sx={{ width: '50vh', height: '50vh' }} />
            </Stack>
        </Container>
    );
};

export default Home;