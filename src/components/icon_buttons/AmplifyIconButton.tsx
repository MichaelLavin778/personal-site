import { IconButton, type IconButtonOwnProps } from "@mui/material";
import AmplifyIcon from "../icons/AmplifyIcon";

const AmplifyIconButton = (props: IconButtonOwnProps) => (
		<IconButton
			aria-label="AWS Amplify"
			href="https://aws.amazon.com/amplify"
			target="_blank"
			rel="noopener noreferrer"
			{...props}
		>
			<AmplifyIcon sx={{ overflow: 'visible', mt: -1 }} />
		</IconButton>
	);

export default AmplifyIconButton;