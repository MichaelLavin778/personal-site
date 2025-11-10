import { IconButton, type IconButtonOwnProps } from "@mui/material";
import ReactIcon from "../icons/ReactIcon";

const ReactIconButton = (props: IconButtonOwnProps) => (
		<IconButton
			aria-label="React"
			href="https://react.dev"
			target="_blank"
			rel="noopener noreferrer"
			{...props}
		>
			<ReactIcon sx={{ overflow: 'visible', mt: -1 }} />
		</IconButton>
	);

export default ReactIconButton;