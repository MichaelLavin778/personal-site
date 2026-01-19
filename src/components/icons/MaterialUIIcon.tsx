import { Icon, type IconProps } from "@mui/material";
import muiLogo from "../../assets/mui.svg";

const MaterialUIIcon = (props: IconProps) => (
	<Icon {...props}>
		<img src={muiLogo} alt="Material UI logo" style={{ maxWidth: '100%', height: 'auto' }} />
	</Icon>
);

export default MaterialUIIcon;
