import React from "react";
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
		flexWrap: 'nowrap',
		backgroundColor: "#1a1a1a",
		color: "#fff",
		height: '6vh'
	},
	icon: {
		color: "#fff"
	},
	main: {
		justifyContent: "space-between",
		alignItems: "center",
		display: 'flex',
		flex: 1,
		height: '100%',
	},
	powerRow: {
		alignItems: "center",
		display: 'flex',
		flex: 1,
		height: '100%',
	}
}));

const Footer: React.FC = () => {
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
						className={classes.powerRow}
					>
						<Typography variant="body2">Powered by</Typography>
						<AmplifyIconButton />
						<ViteIconButton />
						<ReactIconButton />
					</Stack>
					{/* <Stack direction="row" spacing={2}>
						<Link href="/about" color="inherit" underline="hover">
							About
						</Link>
						<Link href="/contact" color="inherit" underline="hover">
							Contact
						</Link>
						<Link href="/privacy" color="inherit" underline="hover">
							Privacy Policy
						</Link>
					</Stack> */}
					<Stack direction="row" spacing={1}>
						<LinkedInIconButton sx={{ color: "#fff" }} />
						<GithubIconButton sx={{ color: "#fff" }} />
					</Stack>
				</Stack>
			</Container>
		</Box>
	);
};

export default Footer;
