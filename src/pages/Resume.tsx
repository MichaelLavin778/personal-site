import { Box } from "@mui/material";
import { makeStyles } from "@material-ui/core";
import resume from '../assets/resume.pdf'
import { useEffect } from "react";

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

    // Set the tab name
    useEffect(() => {
        document.title = "Resume";
    }, []);

    return (
        <Box className={classes.container}>
            <object data={resume} type="application/pdf" width="100%" height="100%" />
        </Box>
    );
};

export default Resume;