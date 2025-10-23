import { makeStyles } from '@material-ui/core';
import { AppBar, Container, Link, Stack } from "@mui/material";

const useStyles = makeStyles(() => ({
	header: {
		height: "6vh"
	},
	container: {
		height: "100%"
	},
	stack: {
		justifyContent: "space-around",
		alignItems: "center",
		height: '100%'
	}
}));

const Header = () => {
	const classes = useStyles();

	return (
		<AppBar component="header" enableColorOnDark={true} className={classes.header}>
			<Container className={classes.container}>
				<Stack direction="row" className={classes.stack}>
					<Link href="/skill" color="inherit" underline="hover">
						My Skill
					</Link>
					<Link href="/resume" color="inherit" underline="hover">
						Resume
					</Link>
				</Stack>
			</Container>
		</AppBar>
	);
};

export default Header;