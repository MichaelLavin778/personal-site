import { makeStyles } from "@material-ui/core";
import { Box, Container, Stack, Typography } from "@mui/material";
import AmplifyIconButton from "./icon_buttons/AmplifyIconButton";
import GithubIconButton from "./icon_buttons/GitHubIconButton";
import LinkedInIconButton from "./icon_buttons/LinkedInIconButton";
import ReactIconButton from "./icon_buttons/ReactIconButton";
import S3IconButton from "./icon_buttons/S3IconButton";
import ViteIconButton from "./icon_buttons/ViteIconButton";


const useStyles = makeStyles(() => ({
	footer: {
		position: 'fixed',
		bottom: 0,
		left: 0,
		width: '100%',
		height: 50,
		overflow: 'hidden'
	},
	container: {
		alignItems: "center"
	},
	main: {
		justifyContent: "space-between",
		height: '100%'
	},
	poweredRow: {
		alignItems: "center"
	},
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
						<S3IconButton />
						<ViteIconButton />
						<ReactIconButton />
					</Stack>
					<Stack direction="row" spacing={1}>
						<LinkedInIconButton />
						<GithubIconButton />
					</Stack>
				</Stack>
			</Container>
		</Box>
	);
};

export default Footer;
