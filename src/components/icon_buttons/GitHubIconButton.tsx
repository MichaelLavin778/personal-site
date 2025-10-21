import { IconButton, type IconButtonOwnProps } from "@mui/material";
import GithubIcon from "@mui/icons-material/Github";

const GithubIconButton = (props: IconButtonOwnProps) => {
	return (
		<IconButton
			aria-label="Github"
			href="https://github.com/MichaelLavin778"
			target="_blank"
			rel="noopener noreferrer"
			{...props}
		>
			<GithubIcon />
		</IconButton>
	);
};

export default GithubIconButton