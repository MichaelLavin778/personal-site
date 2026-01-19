import { Box, Container, Stack, Typography } from "@mui/material";
import AmplifyIconButton from "./icon_buttons/AmplifyIconButton";
import PlaywrightIconButton from "./icon_buttons/PlaywrightIconButton";
import ReactIconButton from "./icon_buttons/ReactIconButton";
import S3IconButton from "./icon_buttons/S3IconButton";
import ViteIconButton from "./icon_buttons/ViteIconButton";


const Footer = () => (
	<Box
		component="footer"
		sx={{ position: 'fixed', bottom: 0, left: 0, width: '100%', height: 50, overflow: 'hidden' }}
	>
		<Container sx={{ alignItems: 'center', height: '100%' }}>
			<Stack
				direction="row"
				sx={{ justifyContent: 'space-between', height: '100%' }}
			>
				<Stack
					direction="row"
					spacing={1}
					sx={{ alignItems: 'center' }}
				>
					<Typography variant="body2">Powered by</Typography>
					<AmplifyIconButton />
					<S3IconButton />
					<ViteIconButton />
					<ReactIconButton />
					<PlaywrightIconButton />
				</Stack>
			</Stack>
		</Container>
	</Box>
);

export default Footer;
