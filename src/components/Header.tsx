import { makeStyles } from '@material-ui/core';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar } from "@mui/material";

const useStyles = makeStyles(() => ({
	header: {
		display: 'flex',
		flexWrap: 'nowrap',
		backgroundColor: "#1a1a1a",
		color: "#fff"
	}
}));

const Header = () => {
	const classes = useStyles();

	return (
		<AppBar component="header" className={classes.header}>
			<MenuIcon />
		</AppBar>
	);
};

export default Header