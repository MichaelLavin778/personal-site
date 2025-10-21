import { IconButton, Tooltip, type IconButtonOwnProps } from "@mui/material";
import ViteIcon from "../icons/ViteIcon";

const ViteIconButton = (props: IconButtonOwnProps) => {
	const name = "Vite";
	return (
		<Tooltip title={name}>
			<IconButton
				aria-label={name}
				href="https://vite.dev"
				target="_blank"
				rel="noopener noreferrer"
				{...props}
			>
				<ViteIcon />
			</IconButton>
		</Tooltip>
	);
};

export default ViteIconButton