import { Box } from "@mui/material";
import { makeStyles } from "@material-ui/core";
import resume from '../assets/resume.pdf'

const useStyles = makeStyles(() => ({
    container: {
        position: 'absolute',
        left: 0,
        top: 50,
        width: '100%',
        height: '89.4vh'
    }
}));

const Resume = () => {
    const classes = useStyles();

    return (
        <Box className={classes.container}>
            <object data={resume} type="application/pdf" width="100%" height="100%" />
        </Box>
    );
};

export default Resume;