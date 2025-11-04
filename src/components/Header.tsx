import { makeStyles } from '@material-ui/core';
import { AppBar, Container, Stack } from "@mui/material";
import { Link } from 'react-router-dom';

const useStyles = makeStyles(() => ({
	header: {
		height: 50
	},
	container: {
		height: "100%"
	},
	stack: {
		justifyContent: "space-around",
		alignItems: "center",
		height: '100%'
	},
	link: {
		color: "#fff",
		textDecoration: 'none',
		'&:hover': {
			textDecoration: 'underline',
		},
	}
}));

const Header = () => {
	const classes = useStyles();
	const toHome = "/";
	const toShowcase = "/showcase"
	const toResume = "/resume"

	const onClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, to: string) => window.location.pathname === to && e.preventDefault();

	return (
		<AppBar className={classes.header}>
			<Container className={classes.container}>
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
				</Stack>
			</Container>
		</AppBar>
	);
};

export default Header;