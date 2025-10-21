import { IconButton, Tooltip, type IconButtonOwnProps } from "@mui/material";
import AmplifyIcon from "../icons/AmplifyIcon";

const AmplifyIconButton = (props: IconButtonOwnProps) => {
	const name = "AWS Amplify";
	return (
		<Tooltip title={name}>
			<IconButton
				aria-label={name}
				href="https://aws.amazon.com/amplify"
				target="_blank"
				rel="noopener noreferrer"
				{...props}
			>
				<AmplifyIcon />
			</IconButton>
		</Tooltip>
	);
};

export default AmplifyIconButton