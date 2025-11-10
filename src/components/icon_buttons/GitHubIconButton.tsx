import { IconButton, type SvgIconProps } from "@mui/material";
import GitHubIcon from '@mui/icons-material/GitHub';

const GithubIconButton = (props: SvgIconProps) => (
		<IconButton
			aria-label="Github"
			href="https://github.com/MichaelLavin778"
			target="_blank"
			rel="noopener noreferrer"
		>
			<GitHubIcon {...props} />
		</IconButton>
	);

export default GithubIconButton;