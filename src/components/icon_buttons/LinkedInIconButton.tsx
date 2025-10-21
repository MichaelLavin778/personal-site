import { IconButton, type IconButtonOwnProps } from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const LinkedInIconButton = (props: IconButtonOwnProps) => {
	return (
		<IconButton
			aria-label="LinkedIn"
			href="https://www.linkedin.com/in/michael-lavin-2373b7198"
			target="_blank"
			rel="noopener noreferrer"
			{...props}
		>
			<LinkedInIcon />
		</IconButton>
	);
};

export default LinkedInIconButton