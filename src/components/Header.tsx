import { AppBar, Container, Grid, IconButton, Link as MuiLink, Stack } from "@mui/material";
import { Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon, WebAsset as WebAssetIcon, WebAssetOff as WebAssetOffIcon } from "@mui/icons-material";
import { useThemeMode } from '../context/ThemeModeContext';
import { type MouseEvent as ReactMouseEvent, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import TutorialContext from "../context/TutorialContext";
import { isMobile } from "../helpers/common";


const Header = () => {
	const toHome = "/";
	const toShowcase = "/showcase"
	const toResume = "/resume"

	const { mode, toggleMode } = useThemeMode();
	const { showTutorial, toggleTutorial } = useContext(TutorialContext);

	const onClick = (e: ReactMouseEvent<HTMLAnchorElement, MouseEvent>, to: string) => window.location.pathname === to && e.preventDefault();

	return (
		<AppBar sx={{ height: 50 }}>
			<Container sx={{ height: '100%' }}>
				<Grid container={true} spacing={2} sx={{ alignItems: 'center', height: '100%' }}>
					{/* below is to even out with the icon buttons */}
					<Grid size={1} sx={{ display: { xs: 'none', sm: 'block' } }} />
					{/* general links */}
					<Grid size={10}>
						<Stack direction="row" justifyContent="space-around">
							<MuiLink component={RouterLink} to={toHome} onClick={(e) => onClick(e, toHome)} sx={{ color: 'inherit' }}>
								Home
							</MuiLink>
							<MuiLink component={RouterLink} to={toShowcase} onClick={(e) => onClick(e, toShowcase)} sx={{ color: 'inherit' }}>
								Showcase
							</MuiLink>
							<MuiLink component={RouterLink} to={toResume} onClick={(e) => onClick(e, toResume)} sx={{ color: 'inherit' }}>
								Resume
							</MuiLink>
						</Stack>
					</Grid>
					{/* actions */}
					<Grid size={1} sx={{ whiteSpace: 'nowrap' }}>
						<IconButton color="inherit" onClick={toggleMode} aria-label={mode === 'dark' ? "dark theme" : "light theme"}>
							{mode === 'dark' ? <Brightness4Icon /> : <Brightness7Icon /> }
						</IconButton>
						{!isMobile() && (
							<IconButton color="inherit" onClick={toggleTutorial} aria-label={showTutorial ? "tutorial on" : "tutorial off"}>
								{showTutorial ? <WebAssetIcon /> : <WebAssetOffIcon />}
							</IconButton>
						)}
					</Grid>
				</Grid>
			</Container>
		</AppBar>
	);
};

export default Header;