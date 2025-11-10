import { IconButton, type IconButtonOwnProps } from "@mui/material";
import S3Icon from "../icons/S3Icon";

const S3IconButton = (props: IconButtonOwnProps) => (
		<IconButton
			aria-label="S3"
			href="https://aws.amazon.com/s3/"
			target="_blank"
			rel="noopener noreferrer"
			{...props}
		>
			<S3Icon sx={{ overflow: 'visible', mt: -1 }} />
		</IconButton>
	);

export default S3IconButton;