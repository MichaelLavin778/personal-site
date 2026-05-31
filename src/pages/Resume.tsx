import { Box } from "@mui/material";
import { useEffect } from "react";
import TutorialPopover from "../components/TutorialPopover";
import { getPublicS3Url } from "../loaders/S3FileDownloader";

const resumeUrl = getPublicS3Url('personal--site', 'resume.pdf');

const Resume = () => {
    // Set the tab name
    useEffect(() => {
        document.title = "Resume";
    }, []);

    return (
        <>
            {/* Resume */}
            <Box sx={{ position: 'absolute', width: '100%', height: '100vh', paddingBottom: '50px', paddingTop: '50px', bgcolor: 'background.paper', colorScheme: 'light' }}>
                <object
                    data={resumeUrl}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                    style={{ backgroundColor: '#fff', colorScheme: 'light', display: 'block' }}
                />
            </Box>

            {/* Tutorial */}
            <TutorialPopover>
                My resume is loaded from an <b style={{ whiteSpace: 'nowrap' }}>S3 bucket</b>. This way the resume can be updated without needing to redeploy the site.
            </TutorialPopover>
        </>
    );
};

export default Resume;
