import { WebAsset as WebAssetIcon } from "@mui/icons-material";
import { Avatar, Box, Container, Stack, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import self_portrait from '../assets/self_portrait.jpg';
import GithubIconButton from "../components/icon_buttons/GitHubIconButton";
import LinkedInIconButton from "../components/icon_buttons/LinkedInIconButton";
import TutorialPopover from "../components/TutorialPopover";
import { headerFooterPadding } from "../model/common";


const Home = () => {
    // for tutorial popover
    const ref = useRef<HTMLDivElement | null>(null);

    // Set the tab name
    useEffect(() => {
        document.title = "Michael Lavin";
    }, []);

    const inTextIcon = <WebAssetIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />;

    return (
		<Container
			sx={{
				display: 'flex',
				flex: 1,
				width: '100%',
				height: '100%',
				minHeight: '100vh',
				paddingTop: headerFooterPadding,
				paddingBottom: headerFooterPadding,
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
            <Stack spacing={4} textAlign="center" alignItems="center">
                <Box ref={ref}>
                    <Typography variant="h1" fontSize="max(min(6vw, 74px), 32px)">Michael Lavin</Typography>
                    <Typography variant="caption" fontSize="max(min(2vw, 24px), 12px)">FULL-STACK DEVELOPER</Typography>
                </Box>
                <Avatar src={self_portrait} alt="Michael Lavin" sx={{ width: '40vw', height: '40vw', minWidth: 175, minHeight: 175, maxWidth: 450, maxHeight: 450, border: 1 }} />
                <Stack direction="row" spacing={1}>
                    <LinkedInIconButton fontSize="large" />
                    <GithubIconButton fontSize="large" />
                </Stack>
            </Stack>
			<TutorialPopover
				anchorEl={ref.current}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
                Welcome to my personal website! These popovers are here to explain some of the technical
                details behind how the site was built. If you'd like to disable them, use the
                {inTextIcon} toggle in the header.
            </TutorialPopover>
        </Container>
    );
};

export default Home;