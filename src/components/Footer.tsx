import { makeStyles } from "@material-ui/core";
import { Box, Container, Typography, Stack } from "@mui/material";
import LinkedInIconButton from "./icon_buttons/LinkedInIconButton";
import GithubIconButton from "./icon_buttons/GitHubIconButton";
import AmplifyIconButton from "./icon_buttons/AmplifyIconButton";
import ViteIconButton from "./icon_buttons/ViteIconButton";
import ReactIconButton from "./icon_buttons/ReactIconButton";

const useStyles = makeStyles(() => ({
	footer: {
		position: 'fixed',
		bottom: 0,
		left: 0,
		width: '100%',
		backgroundColor: "#1a1a1a",
		height: 50,
		overflow: 'hidden'
	},
	container: {
		alignItems: "center",
		height: '100%'
	},
	main: {
		justifyContent: "space-between",
		height: '100%'
	},
	poweredRow: {
		alignItems: "center"
	},
	icon: {
		color: "#fff"
	}
}));

const Footer = () => {
	const classes = useStyles();

	return (
		<Box
			component="footer"
			className={classes.footer}
		>
			<Container className={classes.container}>
				<Stack
					direction="row"
					className={classes.main}
				>
					<Stack
						direction="row"
						spacing={1}
						className={classes.poweredRow}
					>
						<Typography variant="body2">Powered by</Typography>
						<AmplifyIconButton />
						<ViteIconButton />
						<ReactIconButton />
					</Stack>
					<Stack direction="row" spacing={1}>
						<LinkedInIconButton className={classes.icon} />
						<GithubIconButton className={classes.icon} />
					</Stack>
				</Stack>
			</Container>
		</Box>
	);
};

export default Footer;
