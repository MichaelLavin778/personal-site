import { Icon, type IconProps } from "@mui/material";
import reactLogo from "../../assets/react.svg"

const ReactIcon = (props: IconProps) => {
	return (
		<Icon {...props}>
			<img src={reactLogo} alt="React logo" style={{ maxWidth: '100%', height: 'auto' }} />
		</Icon>
	);
};

export default ReactIcon