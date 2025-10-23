import { IconButton, type SvgIconProps } from "@mui/material";
import GithubIcon from "@mui/icons-material/Github";

const GithubIconButton = (props: SvgIconProps) => {
	return (
		<IconButton
			aria-label="Github"
			href="https://github.com/MichaelLavin778"
			target="_blank"
			rel="noopener noreferrer"
		>
			<GithubIcon {...props} />
		</IconButton>
	);
};

export default GithubIconButton;