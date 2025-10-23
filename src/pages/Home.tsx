import { makeStyles } from "@material-ui/core";
import { Avatar, Box, Container, Stack, Typography } from "@mui/material";


const useStyles = makeStyles(() => ({
    container: {
        display: 'flex',
        flex: 1,
        width: '100vw',
        height: '92vh', // 100 0 (header - padded) - 6 (footer) - 1 (comfort)
        paddingTop: '6vh',
        alignItems: 'center',
        justifyContent: 'center'
    },
    stack: {
        textAlign: 'center'
    },
    avatar: {
        width: 56,
        height: 56
    }
}));

const Home = () => {
    const classes = useStyles();

    return (
        <Container className={classes.container}>
            <Stack spacing={4} className={classes.stack}>
                <Box>
                    <Typography variant="h2">Michael Lavin</Typography>
                    <Typography variant="h6">FULL-STACK DEVELOPER</Typography>
                </Box>
                <Avatar src="src/assets/self_portrait.jpg" alt="Michael Lavin" sx={{ width: 500, height: 500 }} />
            </Stack>
        </Container>
    );
};

export default Home;