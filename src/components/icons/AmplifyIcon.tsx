import { Icon, type IconProps } from "@mui/material";
import amplifyLogo from "../../assets/amplify.svg"

const AmplifyIcon = (props: IconProps) => {
	return (
		<Icon {...props}>
			<img src={amplifyLogo} alt="Amplify logo" style={{ maxWidth: '100%', height: 'auto' }} />
		</Icon>
	);
};

export default AmplifyIcon;