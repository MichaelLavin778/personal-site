import { Backdrop, Box, Popover, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import TutorialContext from "../context/TutorialContext";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { loadResume, selectResumeUrl } from "../state/resumeSlice";


const Resume = () => {
    const dispatch = useAppDispatch();
    const s3Resume = useAppSelector(selectResumeUrl);
    const { showTutorial } = useContext(TutorialContext);
    const [anchorEl, setAnchorEl] = useState<DOMRect | null>(window.document.body.getBoundingClientRect());
    const open = showTutorial && !!anchorEl;

    // Set the tab name
    useEffect(() => {
        document.title = "Resume";
    }, []);

    // grab resume from s3 and store blob URL in the Redux store
    useEffect(() => {
        if (!s3Resume) dispatch(loadResume());
    }, [dispatch, s3Resume]);

    return (
        <>
            {/* Resume */}
            <Box sx={{ position: 'absolute', width: '100%', height: '100vh', paddingBottom: '50px', paddingTop: '50px', bgcolor: 'background.paper', colorScheme: 'light' }}>
                <object
                    data={s3Resume}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                    style={{ backgroundColor: '#fff', colorScheme: 'light', display: 'block' }}
                />
            </Box>

            {/* Tutorial */}
            {open && (
                <Backdrop
                    open={open}
                    onClick={() => setAnchorEl(null)}
                    sx={{ zIndex: (theme) => theme.zIndex.modal - 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
                />
            )}
            <Popover open={open} onClose={() => setAnchorEl(null)}>
                <Typography maxWidth={300} padding={2} border={1} borderRadius={2}>
                    The file here was pulled from an <b style={{ whiteSpace: 'nowrap' }}>S3 bucket</b> and stored in the state (this way the resume can be updated without needing to redeploy the site).
                </Typography>
            </Popover>
            
        </>
    );
};

export default Resume;