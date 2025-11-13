import { Box } from "@mui/material";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { loadResume, selectResumeUrl } from "../state/resumeSlice";


const Resume = () => {
    const dispatch = useAppDispatch();
    const s3Resume = useAppSelector(selectResumeUrl);

    // Set the tab name
    useEffect(() => {
        document.title = "Resume";
    }, []);

    // grab resume from s3 and store blob URL in the Redux store
    useEffect(() => {
        if (!s3Resume) dispatch(loadResume());
    }, [dispatch, s3Resume]);

    return (
        <Box sx={{ position: 'absolute', width: '100%', height: '100vh', paddingBottom: '50px', paddingTop: '50px', bgcolor: 'background.paper', colorScheme: 'light' }}>
            <object
                data={s3Resume}
                type="application/pdf"
                width="100%"
                height="100%"
                style={{ backgroundColor: '#fff', colorScheme: 'light', display: 'block' }}
            />
        </Box>
    );
};

export default Resume;