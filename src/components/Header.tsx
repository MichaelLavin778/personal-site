import { AppBar, Container, Grid, IconButton, Link as MuiLink, Stack } from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeMode } from '../theme/ThemeModeContext';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';


const Header = () => {
	const { mode, toggleMode } = useThemeMode();
	const toHome = "/";
	const toShowcase = "/showcase"
	const toResume = "/resume"

	const onClick = (e: ReactMouseEvent<HTMLAnchorElement, MouseEvent>, to: string) => window.location.pathname === to && e.preventDefault();

	return (
		<AppBar sx={{ height: 50 }}>
			<Container sx={{ height: '100%' }}>
				<Grid container={true} spacing={2} sx={{ alignItems: 'center', height: '100%' }}>
					{/* below is to even out with the icon buttons */}
					<Grid  size={1} sx={{ display: { xs: 'none', sm: 'block' }}}/>
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
					{/* icon button actions */}
					<Grid size={1}>
						<IconButton color="inherit" onClick={toggleMode} aria-label="toggle theme">
							{mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
						</IconButton>
					</Grid>
				</Grid>
			</Container>
		</AppBar>
	);
};

export default Header;