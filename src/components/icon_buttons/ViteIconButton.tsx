import { IconButton, type IconButtonOwnProps } from "@mui/material";
import ViteIcon from "../icons/ViteIcon";

const ViteIconButton = (props: IconButtonOwnProps) => (
		<IconButton
			aria-label="Vite"
			href="https://vite.dev"
			target="_blank"
			rel="noopener noreferrer"
			{...props}
		>
			<ViteIcon sx={{ overflow: 'visible', mt: -1 }} />
		</IconButton>
	);

export default ViteIconButton;