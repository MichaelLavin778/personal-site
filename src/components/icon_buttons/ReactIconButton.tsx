import { IconButton, Tooltip, type IconButtonOwnProps } from "@mui/material";
import ReactIcon from "../icons/ReactIcon";

const ReactIconButton = (props: IconButtonOwnProps) => {
	const name = "React";
	return (
		<Tooltip title={name}>
			<IconButton
				aria-label={name}
				href="https://react.dev"
				target="_blank"
				rel="noopener noreferrer"
				{...props}
			>
				<ReactIcon />
			</IconButton>
		</Tooltip>
	);
};

export default ReactIconButton