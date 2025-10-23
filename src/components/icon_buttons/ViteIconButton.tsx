import { IconButton, type IconButtonOwnProps } from "@mui/material";
import ViteIcon from "../icons/ViteIcon";

const ViteIconButton = (props: IconButtonOwnProps) => {
	const name = "Vite";

	return (
		<IconButton
			aria-label={name}
			href="https://vite.dev"
			target="_blank"
			rel="noopener noreferrer"
			{...props}
		>
			<ViteIcon sx={{ overflow: 'visible', mt: -1 }} />
		</IconButton>
	);
};

export default ViteIconButton;