import {
	Brightness4 as Brightness4Icon,
	Brightness7 as Brightness7Icon,
	Menu as MenuIcon,
	WebAsset as WebAssetIcon,
	WebAssetOff as WebAssetOffIcon,
} from "@mui/icons-material";
import {
	AppBar,
	Box,
	Container,
	Drawer,
	Grid,
	IconButton,
	List,
	ListItemButton,
	ListItemText,
	Link as MuiLink,
	Stack,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { type MouseEvent as ReactMouseEvent, useContext, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useThemeMode } from '../context/ThemeModeContext';
import TutorialContext from "../context/TutorialContext";
import { isMobile } from "../helpers/common";


const Header = () => {
	const toHome = "/";
	const toShowcase = "/showcase"
	const toResume = "/resume"

	const { mode, toggleMode } = useThemeMode();
	const { showTutorial, toggleTutorial } = useContext(TutorialContext);

	const theme = useTheme();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
	const [isNavOpen, setIsNavOpen] = useState(false);

	const navLinks = useMemo(() => ([
		{ label: 'Home', to: toHome },
		{ label: 'Showcase', to: toShowcase },
		{ label: 'Resume', to: toResume },
	]), [toHome, toResume, toShowcase]);

	const onClick = (
		e: ReactMouseEvent<HTMLAnchorElement, MouseEvent>,
		to: string
	) => {
		if (window.location.pathname === to) e.preventDefault();
	};

	return (
		<AppBar sx={{ height: 50 }}>
			<Container sx={{ height: '100%' }}>
				<Grid container={true} spacing={2} sx={{ alignItems: 'center', height: '100%' }}>
					{/* left: hamburger (small screens) / spacer (desktop) */}
					<Grid size={{ xs: 2, sm: 1 }} sx={{ display: 'flex', alignItems: 'center' }}>
						<IconButton
							color="inherit"
							onClick={() => setIsNavOpen(true)}
							aria-label="open navigation menu"
							sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
						>
							<MenuIcon />
						</IconButton>
					</Grid>
					{/* center: desktop links */}
					<Grid size={{ xs: 8, sm: 10 }}>
						<Stack
							direction="row"
							justifyContent="space-around"
							sx={{ display: { xs: 'none', sm: 'flex' } }}
						>
							{navLinks.map(({ label, to }) => (
								<MuiLink
									key={to}
									component={RouterLink}
									to={to}
									onClick={(e) => onClick(e, to)}
									sx={{ color: 'inherit' }}
								>
									{label}
								</MuiLink>
							))}
						</Stack>
					</Grid>
					{/* right: actions */}
					<Grid size={{ xs: 2, sm: 1 }} sx={{ whiteSpace: 'nowrap', display: 'flex', justifyContent: 'flex-end' }}>
						<IconButton color="inherit" onClick={toggleMode} aria-label={mode === 'dark' ? "dark theme" : "light theme"}>
							{mode === 'dark' ? <Brightness4Icon /> : <Brightness7Icon />}
						</IconButton>
						{!isMobile() && (
							<IconButton color="inherit" onClick={toggleTutorial} aria-label={showTutorial ? "tutorial on" : "tutorial off"}>
								{showTutorial ? <WebAssetIcon /> : <WebAssetOffIcon />}
							</IconButton>
						)}
					</Grid>
				</Grid>

				<Drawer
					anchor="left"
					open={isNavOpen && isSmallScreen}
					onClose={() => setIsNavOpen(false)}
				>
					<Box sx={{ width: 240 }} role="presentation" onClick={() => setIsNavOpen(false)}>
						<List>
							{navLinks.map(({ label, to }) => (
								<ListItemButton
									key={to}
									component={RouterLink}
									to={to}
									onClick={(e: ReactMouseEvent<HTMLAnchorElement, MouseEvent>) => onClick(e, to)}
								>
									<ListItemText primary={label} />
								</ListItemButton>
							))}
						</List>
					</Box>
				</Drawer>
			</Container>
		</AppBar>
	);
};

export default Header;