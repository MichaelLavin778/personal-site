import { Box } from "@mui/material";
import { makeStyles } from "@material-ui/core";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { loadResume, selectResumeUrl } from "../state/resumeSlice";


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
    const dispatch = useAppDispatch();
    const s3Resume = useAppSelector(selectResumeUrl);

    // Set the tab name
    useEffect(() => {
        document.title = "Resume";
    }, []);

    // grab resume from s3 and store blob URL in the Redux store
    useEffect(() => {
        if (!s3Resume) {
            dispatch(loadResume());
        }
    }, [dispatch, s3Resume]);

    // TODO: pdf looks "backdropped" on mobile
    return (
        <Box className={classes.container}>
            <object data={s3Resume} type="application/pdf" width="100%" height="100%" />
        </Box>
    );
};

export default Resume;