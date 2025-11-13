import { makeStyles } from "@material-ui/core";
import { Avatar, Box, Container, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import self_portrait from '../assets/self_portrait.jpg';
import GithubIconButton from "../components/icon_buttons/GitHubIconButton";
import LinkedInIconButton from "../components/icon_buttons/LinkedInIconButton";


const useStyles = makeStyles(() => ({
    container: {
        display: 'flex',
        flex: 1,
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        paddingTop: 50, // header
        paddingBottom: 50, // footer
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

    // Set the tab name
    useEffect(() => {
        document.title = "Michael Lavin";
    }, []);

    return (
        <Container className={classes.container}>
            <Stack spacing={4} className={classes.stack}>
                <Box>
                    <Typography variant="h1" fontSize="max(min(6vw, 74px), 32px)">Michael Lavin</Typography>
                    <Typography variant="caption" fontSize="max(min(2vw, 24px), 12px)">FULL-STACK DEVELOPER</Typography>
                </Box>
                <Avatar src={self_portrait} alt="Michael Lavin" sx={{ width: '40vw', height: '40vw', minWidth: 175, minHeight: 175, maxWidth: 450, maxHeight: 450, border: 1 }} />
                <Stack direction="row" spacing={1}>
                    <LinkedInIconButton fontSize="large" />
                    <GithubIconButton fontSize="large" />
                </Stack>
            </Stack>
        </Container>
    );
};

export default Home;