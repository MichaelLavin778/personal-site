import { Icon, type IconProps } from "@mui/material";
import s3Logo from "../../assets/s3.png"

const S3Icon = (props: IconProps) => (
		<Icon {...props}>
			<img src={s3Logo} alt="S3 logo" style={{ maxWidth: '100%', height: 'auto' }} />
		</Icon>
	);

export default S3Icon;