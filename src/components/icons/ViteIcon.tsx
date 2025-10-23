import { Icon, type IconProps } from "@mui/material";
import viteLogo from "../../assets/vite.svg"

const ViteIcon = (props: IconProps) => {
	return (
		<Icon {...props}>
			<img src={viteLogo} alt="Vite logo" style={{ maxWidth: '100%', height: 'auto' }} />
		</Icon>
	);
};

export default ViteIcon;