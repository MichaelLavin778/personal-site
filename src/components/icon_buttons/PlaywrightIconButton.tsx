import { IconButton, type IconButtonOwnProps } from "@mui/material";
import PlaywrightIcon from "../icons/PlaywrightIcon";

const PlaywrightIconButton = (props: IconButtonOwnProps) => (
	<IconButton
		aria-label="Playwright"
		href="https://playwright.dev"
		target="_blank"
		rel="noopener noreferrer"
		{...props}
	>
		<PlaywrightIcon sx={{ overflow: 'visible', mt: -1 }} />
	</IconButton>
);

export default PlaywrightIconButton;
