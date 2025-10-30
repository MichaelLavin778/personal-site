import { makeStyles } from "@material-ui/core";
import { Box, Container, Typography, Stack } from "@mui/material";
import LinkedInIconButton from "./icon_buttons/LinkedInIconButton";
import GithubIconButton from "./icon_buttons/GitHubIconButton";
import AmplifyIconButton from "./icon_buttons/AmplifyIconButton";
import ViteIconButton from "./icon_buttons/ViteIconButton";
import ReactIconButton from "./icon_buttons/ReactIconButton";

const useStyles = makeStyles(() => ({
	footer: {
		display: 'flex',
		flex: 1,
		flexWrap: 'nowrap',
		backgroundColor: "#1a1a1a",
		color: "#fff",
		height: 50,
		overflow: 'hidden'
	},
	icon: {
		color: "#fff"
	},
	main: {
		justifyContent: "space-between",
		alignItems: "center",
		display: 'flex',
		flex: 1,
		height: '100%'
	},
	poweredRow: {
		alignItems: "center",
		display: 'flex',
		flex: 1,
		height: '100%'
	}
}));

const Footer = () => {
	const classes = useStyles();

	return (
		<Box
			component="footer"
			className={classes.footer}
		>
			<Container>
				<Stack
					direction={{ xs: "column", sm: "row" }}
					className={classes.main}
				>
					<Stack
						direction={{ xs: "column", sm: "row" }}
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
