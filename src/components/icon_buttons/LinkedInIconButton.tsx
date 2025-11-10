import { IconButton, type SvgIconProps } from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const LinkedInIconButton = (props: SvgIconProps) => (
		<IconButton
			aria-label="LinkedIn"
			href="https://www.linkedin.com/in/michael-lavin-2373b7198"
			target="_blank"
			rel="noopener noreferrer"
		>
			<LinkedInIcon {...props} />
		</IconButton>
	);

export default LinkedInIconButton;