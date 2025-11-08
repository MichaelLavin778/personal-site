import { Box } from "@mui/material";
import { makeStyles } from "@material-ui/core";
import { useEffect, useState } from "react";
import fetchPublicS3Blob from "../loaders/S3FileDownloader";

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
    const [s3Resume, setS3Resume] = useState<string | undefined>(undefined);

    // Set the tab name
    useEffect(() => {
        document.title = "Resume";
    }, []);

    // grab resume from s3
    useEffect(() => {
        Promise.resolve(fetchPublicS3Blob('personal--site', 'resume.pdf')).then((blob) => {
            if (blob) setS3Resume(URL.createObjectURL(blob))
        })
    }, []);

    return (
        <Box className={classes.container}>
            <object data={s3Resume} type="application/pdf" width="100%" height="100%" />
        </Box>
    );
};

export default Resume;