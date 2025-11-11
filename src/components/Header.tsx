import { makeStyles } from '@material-ui/core';
import { AppBar, Container, IconButton, Stack } from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeMode } from '../theme/ThemeModeContext';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(() => ({
	header: {
		height: 50
	},
	stack: {
		justifyContent: "space-around",
		alignItems: "center",
		height: '100%'
	},
	link: {
		color: 'inherit',
	}
}));

const Header = () => {
	const classes = useStyles();
	const { mode, toggleMode } = useThemeMode();
	const toHome = "/";
	const toShowcase = "/showcase"
	const toResume = "/resume"

	const onClick = (e: ReactMouseEvent<HTMLAnchorElement, MouseEvent>, to: string) => window.location.pathname === to && e.preventDefault();

	return (
		<AppBar className={classes.header}>
			<Container>
				<Stack direction="row" className={classes.stack}>
					<Link to={toHome} onClick={(e) => onClick(e, toHome)} className={classes.link}>
						Home
					</Link>
					<Link to={toShowcase} onClick={(e) => onClick(e, toShowcase)} className={classes.link}>
						Showcase
					</Link>
					<Link to={toResume} onClick={(e) => onClick(e, toResume)} className={classes.link}>
						Resume
					</Link>
					<IconButton color="inherit" onClick={toggleMode} aria-label="toggle theme">
						{mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
					</IconButton>
				</Stack>
			</Container>
		</AppBar>
	);
};

export default Header;