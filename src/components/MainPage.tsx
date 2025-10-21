import { makeStyles } from "@material-ui/core";
import { Container } from "@mui/material";


const useStyles = makeStyles(() => ({
    container: {
        display: 'flex',
        flex: 1,
        width: '100vw',
        height: '92vh'
    }
}));

const MainPage = () => {
    const classes = useStyles();

    return (
        <Container className={classes.container} />
    );
};

export default MainPage